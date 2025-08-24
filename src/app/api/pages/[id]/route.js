// app/api/pages/[id]/route.js
import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
// import { isAuthenticated } from "@/src/lib/auth-middleware";

// =============================
// GET /api/pages/[id] → Get a single page by ID
// =============================
export async function GET(req, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const pagesCollection = db.collection("pages");

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "Page ID is required" },
        { status: 400 }
      );
    }

    const page = await pagesCollection.findOne({ _id: new ObjectId(id) });

    if (!page) {
      return NextResponse.json(
        { message: "Page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(page, { status: 200 });
  } catch (error) {
    console.error("Get Page by ID API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

// =============================
// PUT /api/pages/[id] → Update a page by ID
// =============================
export async function PUT(req, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const pagesCollection = db.collection("pages");

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "Page ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();

    if (!body.title || !body.slug) {
      return NextResponse.json(
        { message: "Title and slug are required" },
        { status: 400 }
      );
    }

    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    const result = await pagesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Page updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Page API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

// =============================
// DELETE /api/pages/[id] → Delete a page by ID
// =============================
export async function DELETE(req, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const pagesCollection = db.collection("pages");

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "Page ID is required" },
        { status: 400 }
      );
    }

    const result = await pagesCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Page deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete Page API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
