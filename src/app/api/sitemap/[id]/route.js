import clientPromise from "@/src/lib/mongo";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb"; // Required for _id queries
import { isAuthenticated } from "@/src/lib/auth-middleware";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Validate ID format (optional but recommended)
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const user = await db.collection("sitemapentries").findOne({
      _id: new ObjectId(id), // Convert string ID to ObjectId
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (e) {
    console.error("Error fetching user:", e);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;

    // Check authentication
    const authResult = await isAuthenticated(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid sitemap entry ID format" },
        { status: 400 }
      );
    }

    // Check if entry exists
    const entry = await db.collection('sitemapentries').findOne({ 
      _id: new ObjectId(id) 
    });
console.log(id)
    if (!entry) {
      return NextResponse.json(
        { message: "Sitemap entry not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await req.json();

    // If URL is changing, check if it conflicts with an existing one
    if (body.url && body.url !== entry.url) {
      const existingEntry = await db.collection('sitemapentries').findOne({ 
        url: body.url,
        _id: { $ne: new ObjectId(id) } // Exclude current entry
      });

      if (existingEntry) {
        return NextResponse.json(
          { message: "A sitemap entry with this URL already exists" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {
      ...body,
      updatedAt: new Date()
    };

    // Update sitemap entry
    const result = await db.collection('sitemapentries').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { message: "Sitemap entry not found" },
        { status: 404 }
      );
    }

    const updatedEntry = result;

    return NextResponse.json(updatedEntry);

  } catch (error) {
    console.error('Update sitemap entry error:', error);
    
    // Handle invalid ObjectId format
    if (error instanceof Error && error.message.includes('ObjectId')) {
      return NextResponse.json(
        { message: "Invalid sitemap entry ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}