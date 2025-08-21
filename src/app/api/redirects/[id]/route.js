import clientPromise from "@/src/lib/mongo";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb"; // Required for _id queries
import { hashPassword, isAdmin } from "@/src/lib/auth-utils";
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

    const user = await db.collection("redirects").findOne({
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

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid redirect ID format" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Check if redirect exists
    const redirect = await db.collection("redirects").findOne({
      _id: new ObjectId(id),
    });

    if (!redirect) {
      return NextResponse.json(
        { message: "Redirect not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // If source URL is changing, check if it conflicts with an existing one
    if (body.sourceUrl && body.sourceUrl !== redirect.sourceUrl) {
      const normalizedSourceUrl = body.sourceUrl.toLowerCase().trim();
      const existingRedirect = await db.collection("redirects").findOne({
        sourceUrl: normalizedSourceUrl,
        _id: { $ne: new ObjectId(id) },
      });

      if (existingRedirect) {
        return NextResponse.json(
          {
            message: "A redirect with this source URL already exists",
            existingRedirectId: existingRedirect._id,
          },
          { status: 400 }
        );
      }
    }

    // Prepare update data with normalization
    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    // Normalize URLs if provided
    if (body.sourceUrl) {
      updateData.sourceUrl = body.sourceUrl.toLowerCase().trim();
    }
    if (body.destinationUrl) {
      updateData.destinationUrl = body.destinationUrl.toLowerCase().trim();
    }

    // Update redirect
    const result = await db
      .collection("redirects")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" }
      );

    const updatedRedirect = result;

    return NextResponse.json(updatedRedirect);
  } catch (error) {
    console.error("Update redirect error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
