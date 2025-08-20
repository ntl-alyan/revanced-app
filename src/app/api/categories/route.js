import init from "@/src/lib/db";
import { NextResponse } from "next/server";


// GET all categories
export async function GET() {
  try {
    const db = await init();
    const categories = await db.collection("categories").find().sort({ createdAt: -1 }).toArray();

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("GET /categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST create new category
export async function POST(req) {
  try {
    const db = await init();
    if (!db) {
      console.error("DB connection failed.");
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    const body = await req.json();
    console.log("Request body:", body);

    const { name, slug, description } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const category = {
      name,
      slug,
      description: description || "",
      createdAt: new Date(),
    };

    // check duplicate slug
    const existing = await db.collection("categories").findOne({ slug });
    console.log("Existing category:", existing);

    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const result = await db.collection("categories").insertOne(category);
    console.log("Insert result:", result);

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("POST /categories error details:", error);
    return NextResponse.json({ error: "Failed to create category", details: error.message }, { status: 500 });
  }
}
