import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { collectionName } = await req.json();
    if (!collectionName) {
      return new Response(JSON.stringify({ message: "Collection name required" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("chatty");

    // Insert a dummy document to create collection
    await db.collection(collectionName).insertOne({
      createdAt: new Date(),
      initial: true
    });

    return new Response(JSON.stringify({ message: `Collection '${collectionName}' created successfully!` }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error creating collection" }), { status: 500 });
  }
}
