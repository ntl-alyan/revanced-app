import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/src/lib/auth-middleware'; // Your auth middleware

export async function GET(req) {
  try {
    // Check authentication
    const authResult = await isAuthenticated(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Fetch all redirects from the database
    const redirects = await db.collection('redirects').find({}).toArray();
    
    return NextResponse.json(redirects);
  } catch (error) {
    console.error('Redirects API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch redirects' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
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

    // Parse and validate request body
    const body = await req.json();

    // Check if redirect with same source URL exists
    const existingRedirect = await db.collection('redirects').findOne({ 
      sourceUrl: body.sourceUrl 
    });

    if (existingRedirect) {
      return NextResponse.json(
        { message: "A redirect with this source URL already exists" },
        { status: 400 }
      );
    }

    // Create redirect with additional metadata
    const redirectData = {
      ...body,
      createdBy: authResult.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('redirects').insertOne(redirectData);
    
    // Get the created redirect
    const redirect = await db.collection('redirects').findOne({ 
      _id: result.insertedId 
    });

    if (!redirect) {
      return NextResponse.json(
        { message: "Failed to create redirect" },
        { status: 500 }
      );
    }

    return NextResponse.json(redirect, { status: 201 });

  } catch (error) {
    console.error('Create redirect error:', error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: "Invalid redirect data", 
          errors: error.errors 
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