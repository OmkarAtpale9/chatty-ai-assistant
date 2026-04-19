import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(req) {
  const data = await req.formData();
  const file = data.get("file");

  if (!file) return NextResponse.json({ message: "No file uploaded" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filePath = path.join(process.cwd(), "public/uploads", file.name);
  await writeFile(filePath, buffer);

  const client = await clientPromise;
  const db = client.db("chatty");
  const collection = db.collection("BCA");

  await collection.insertOne({
    filename: file.name,
    path: `/uploads/${file.name}`,
    uploadedAt: new Date(),
  });

  return NextResponse.json({ message: "PDF uploaded successfully" });
}
