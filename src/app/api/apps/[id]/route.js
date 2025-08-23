import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';
import { ObjectId } from "mongodb"; // Required for _id queries
import { isAdmin } from '@/src/lib/auth-utils';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Validate ID format (optional but recommended)
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const user = await db.collection("apps").findOne({
      _id: new ObjectId(id), // Convert string ID to ObjectId
    });

    if (!user) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (e) {
    console.error("Error fetching App:", e);
    return NextResponse.json(
      { error: "Failed to fetch App data" },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = params;

    // Check if user is admin
    const adminCheck = await isAdmin(req);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid app ID format" },
        { status: 400 }
      );
    }

    // Check if app exists
    const app = await db.collection('apps').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!app) {
      return NextResponse.json(
        { message: "App not found" },
        { status: 404 }
      );
    }

    // Parse and process request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // Special handling for sections to avoid parsing errors
    let appData = { ...body };

    // Explicitly handle sections data to ensure proper format
    if (appData.sections) {
      try {
        // If sections is already parsed as an array, use it directly
        if (Array.isArray(appData.sections)) {
          // All good, keep it as is
        } 
        // If it's a string, try to parse it as JSON
        else if (typeof appData.sections === 'string') {
          appData.sections = JSON.parse(appData.sections);
        }
        // Handle null/undefined case
        else if (appData.sections === null || appData.sections === undefined) {
          appData.sections = [];
        }
      } catch (sectionError) {
        console.error("Error parsing app sections:", sectionError);
        // In case of error, set to empty array to avoid validation issues
        appData.sections = [];
      }
    }


    // Prepare update data
    const updateData = {
      ...appData,
      updatedAt: new Date()
    };

    // Update app
    const result = await db.collection('apps').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { message: "App not found" },
        { status: 404 }
      );
    }

    const updatedApp = result;

    return NextResponse.json(updatedApp);

  } catch (error) {
    console.error("Error updating app via PUT:", error);
    

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}