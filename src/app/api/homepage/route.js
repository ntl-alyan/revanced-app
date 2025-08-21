import dbConnect from "@/src/lib/mongo";
import { HomepageModel } from "@/src/shared/schema";
import { NextResponse } from "next/server";

// GET homepage data
export async function GET() {
  try {
    await dbConnect();
    let homepage = await HomepageModel.findOne({}).lean();

    if (!homepage) {
      homepage = await HomepageModel.create({
        sections: [],
        version: "",
        downloadUrl: "",
        downloadId: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        ogTitle: "",
        ogDescription: "",
        ogImage: ""
      });
    }

    return NextResponse.json(homepage);
  } catch (err) {
    console.error("Homepage GET error:", err);
    return NextResponse.json({ error: "Failed to fetch homepage" }, { status: 500 });
  }
}

// PATCH update homepage
export async function PATCH(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const homepage = await HomepageModel.findOneAndUpdate(
      {},
      { ...body, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    return NextResponse.json(homepage);
  } catch (err) {
    console.error("Homepage PATCH error:", err);
    return NextResponse.json({ error: "Failed to update homepage" }, { status: 500 });
  }
}
