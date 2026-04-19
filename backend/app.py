from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
from textblob import TextBlob
import numpy as np
import google.generativeai as genai
import os
import operator
import logging
from datetime import datetime

# Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# Load Environment Variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")


# MongoDB Setup

client = MongoClient(mongo_uri)
db = client["chatty"]

COLLECTIONS_TO_SEARCH = ["BCA", "AI","BVOC", "General_FAQ"]

if not api_key:
    logging.warning("⚠️ GEMINI_API_KEY not found in environment. Gemini reasoning may fail.")
else:
    genai.configure(api_key=api_key)

# FastAPI App Setup
app = FastAPI(title="Chatty AI Assistant", version="4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins (safe for local testing)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Embedding Model
model = SentenceTransformer("all-MiniLM-L6-v2")
GEMINI_MODEL = "gemini-2.0-flash"
TOP_K_RETRIEVAL = 4  # gather more docs for richer context
SIMILARITY_THRESHOLD = 0.45  # more tolerant, helps fuzzy matches

# Request Schema
class Question(BaseModel):
    question: str


# Helper: Train Embeddings
def train_embeddings():
    """Generate embeddings for questions in each collection if missing."""
    total_count = 0
    for collection_name in COLLECTIONS_TO_SEARCH:
        collection = db[collection_name]
        docs = list(collection.find({"question": {"$exists": True}}))
        count = 0

        for doc in docs:
            if "embedding" not in doc or not doc["embedding"]:
                try:
                    question_text = doc["question"]
                    embedding = model.encode(question_text).tolist()
                    collection.update_one(
                        {"_id": doc["_id"]},
                        {"$set": {"embedding": embedding}},
                    )
                    count += 1
                except Exception as e:
                    logging.error(f"Error embedding doc in {collection_name}: {e}")

        if count:
            logging.info(f"✅ Trained {count} entries in collection: {collection_name}")
        total_count += count
    return total_count


# Startup Auto Train
@app.on_event("startup")
def startup_event():
    logging.info("🚀 Auto-training embeddings on startup...")
    trained = train_embeddings()
    logging.info(f"Embedding training complete: {trained} updated.")


# Train API
@app.get("/train")
async def train():
    count = train_embeddings()
    return {"message": f"✅ Trained/Updated {count} entries successfully."}


# Ask API
@app.post("/ask")
async def ask(q: Question):
    try:
        user_query = q.question.strip()
        if not user_query:
            raise HTTPException(status_code=400, detail="Empty question.")

        # 1️⃣ Auto-correct and normalize query
        corrected_query = str(TextBlob(user_query).correct())
        logging.info(f"🧠 Received query: '{user_query}' | Corrected: '{corrected_query}'")

        # 2️⃣ Encode user query into embedding
        query_vector = model.encode(corrected_query).tolist()

        all_search_results = []

        # 3️⃣ Semantic search across collections
        for collection_name in COLLECTIONS_TO_SEARCH:
            collection = db[collection_name]

            if collection.count_documents({"embedding": {"$exists": True}}) == 0:
                continue

            docs = list(collection.find({"embedding": {"$exists": True}}))
            for doc in docs:
                embedding = np.array(doc["embedding"])
                score = float(np.dot(query_vector, embed    ding) /
                              (np.linalg.norm(query_vector) * np.linalg.norm(embedding)))

                if score >= SIMILARITY_THRESHOLD:  # accept fuzzy matches
                    all_search_results.append({
                        "question": doc.get("question", ""),
                        "answer": doc.get("answer", ""),
                        "score": score,
                        "source_collection": collection_name,
                    })

        # 4️⃣ If no semantic match, fallback to reasoning-only Gemini
        if not all_search_results:
            logging.info("No close match found, invoking Gemini reasoning only.")
            gen_model = genai.GenerativeModel(GEMINI_MODEL)
            prompt = f"""
You are a helpful college AI assistant. The student asked: "{corrected_query}"
You have no database context. Use your reasoning and general college knowledge
to answer helpfully, politely, and concisely.
"""
            g_resp = gen_model.generate_content(prompt)
            return {
                "answer": getattr(g_resp, "text", str(g_resp)).strip(),
                "confidence": 0.3,
                "source": "Gemini Reasoning",
            }

        # 5️⃣ Sort by similarity
        all_search_results.sort(key=operator.itemgetter("score"), reverse=True)
        best_matches = all_search_results[:TOP_K_RETRIEVAL]
        best_score = best_matches[0]["score"]

        # 6️⃣ Build contextual knowledge
        context = ""
        for doc in best_matches:
            context += f"[{doc['source_collection']}] Q: {doc['question']}\nA: {doc['answer']}\n---\n"

        # 7️⃣ Generate final answer using Gemini with reasoning + context
        gen_model = genai.GenerativeModel(GEMINI_MODEL)
        prompt = f"""
You are Chatty — an intelligent AI assistant for a college.
You answer student questions using the provided CONTEXT.
Combine reasoning + context to give a natural, helpful answer.
If information seems incomplete, answer as best as possible and suggest where to ask further.

CONTEXT:
{context}

USER QUESTION:
{corrected_query}
"""
        g_resp = gen_model.generate_content(prompt)
        final_answer = getattr(g_resp, "text", str(g_resp))

        return {
            "answer": final_answer.strip(),
            "confidence": round(float(best_score), 3),
            "source": best_matches[0]["source_collection"],
        }

    except Exception as e:
        logging.error(f"🔥 Error in /ask: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error.")


# Root Endpoint
@app.get("/")
def root():
    return {"message": "🤖 Chatty AI Assistant is running smoothly!"}
