import { CategoryModel, insertCategorySchema } from "@/src/shared/schema";
import { NextResponse } from "next/server";

// POST /api/categories
export async function POST(req) {
  try {
    const body = await req.json();

    // Validate using Zod
    const data = insertCategorySchema.parse(body);

    // Save to database
    const category = new CategoryModel(data);
    await category.save();

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (err) {
    console.error(err);

    // Zod validation errors
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }

    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}
