import { isAdmin } from '@/src/lib/auth-utils';
import { z } from 'zod';
import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const data = await db.collection('apps').find({}).toArray();
    
    return NextResponse.json(data);
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

// Define the app schema
const insertAppSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
  featuredImage: z.string().optional(),
  bannerImage: z.string().optional(),
  version: z.string().optional(),
  downloadUrl: z.string().url().optional(),
  downloadId: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  screenshots: z.array(z.string()).default([]),
  sections: z.array(z.any()).default([]), // Flexible sections array
  metadata: z.record(z.any()).default({}),
});

export async function POST(req) {
  try {
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

    // Parse and process request body
    let body;
    try {
      body = await req.json();
      console.log("POST app data received:", JSON.stringify(body, null, 2));
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
          console.log("Sections is already an array");
        } 
        // If it's a string, try to parse it as JSON
        else if (typeof appData.sections === 'string') {
          console.log("Parsing sections string as JSON");
          appData.sections = JSON.parse(appData.sections);
        }
        // Handle null/undefined case
        else if (appData.sections === null || appData.sections === undefined) {
          console.log("Sections is null/undefined, setting to empty array");
          appData.sections = [];
        }
        else {
          console.warn("Unexpected sections type:", typeof appData.sections);
          appData.sections = [];
        }
      } catch (sectionError) {
        console.error("Error parsing app sections:", sectionError);
        // In case of error, set to empty array to avoid validation issues
        appData.sections = [];
      }
    }

    // Validate the processed data
    const validData = insertAppSchema.parse(appData);

    // Check if app with same slug already exists
    const existingApp = await db.collection('apps').findOne({ 
      slug: validData.slug 
    });

    if (existingApp) {
      return NextResponse.json(
        { message: "An app with this slug already exists" },
        { status: 400 }
      );
    }

    // Create app with additional metadata
    const app = {
      ...validData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('apps').insertOne(app);
    
    // Get the created app
    const createdApp = await db.collection('apps').findOne({ 
      _id: result.insertedId 
    });

    if (!createdApp) {
      return NextResponse.json(
        { message: "Failed to create app" },
        { status: 500 }
      );
    }

    return NextResponse.json(createdApp, { status: 201 });

  } catch (error) {
    console.error("Error creating app:", error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: "Invalid app data", 
          errors: error.errors,
          details: error.format()
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}