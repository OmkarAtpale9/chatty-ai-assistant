# 🤖 Chatty AI Assistant

Chatty is an intelligent, context-aware college AI assistant built to streamline information retrieval. It uses semantic search and LLM reasoning to provide accurate, helpful answers to student queries.

## 🚀 Features
- **Semantic Search:** Uses `Sentence-Transformers` to find the most relevant information from your database.
- **LLM Reasoning:** Integrates Google's `Gemini 2.0 Flash` to synthesize answers based on retrieved context.
- **Fuzzy Matching:** Automatically corrects user typos using `TextBlob` for a better user experience.
- **Auto-Training:** Automatically generates embeddings for new college data on application startup.
- **Robust Backend:** Built with `FastAPI` for high-performance and asynchronous request handling.

## 🛠 Tech Stack
- **Frontend:** Next.js
- **Backend:** Python [FastAPI]
- **AI/ML:** Google Gemini API (Generative AI), Sentence-Transformers
- **Database:** MongoDB
- **NLP:** TextBlob (Spell correction)
- **Environment:** dotenv (for secure config management)

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/OmkarAtpale9/chatty-ai-assistant.git](https://github.com/OmkarAtpale9/chatty-ai-assistant.git)
   cd chatty-ai-assistant

2. Set up a virtual environment (Recommended):
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate

3. Install dependencies:
   pip install -r requirements.txt

4. Environment Variables:
   Create a .env file in the root directory and add your keys:
      GEMINI_API_KEY=your_actual_api_key_here
      MONGO_URI=mongodb://localhost:27017/
   
5. Run the Application:
      Frontend: npm run dev
      Backend:  uvicorn app:app --host 0.0.0.0 --port 8000 --reload

🔌 API Endpoints
      GET /: Health check.
      GET /train: Triggers the embedding training process for the database.
      POST /ask: Send a question (JSON body: {"question": "your text here"}) to get an AI-generated answer.

🤝 Contributing
    "This project is for academic/personal portfolio purposes, but I welcome feedback and suggestions for improvement!"

👤 Author
    Omkar Atpale | Computer Applications Student | Developer | [https://www.linkedin.com/in/omkar-atpale/] | [Omkar Atpale]


    
