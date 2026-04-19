import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const client = await clientPromise;
    const db = client.db("chatty"); // database name
    const collection = db.collection("admin"); // collection name

    const user = await collection.findOne({ email, password });

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({ message: "Login successful" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
