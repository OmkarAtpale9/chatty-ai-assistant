import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb"; 
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("chatty");
    const users = await db.collection("admin").find({}).toArray();
    return NextResponse.json(users);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });

    
  }
}
