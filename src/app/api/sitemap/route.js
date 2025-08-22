import { isAuthenticated } from '@/src/lib/auth-middleware';
import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const data = await db.collection('sitemapentries').find({}).toArray();
    
    return NextResponse.json(data);
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
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

    // Check if entry with same URL exists
    const existingEntry = await db.collection('sitemapentries').findOne({ 
      url: body.url 
    });

    if (existingEntry) {
      return NextResponse.json(
        { message: "A sitemap entry with this URL already exists" },
        { status: 400 }
      );
    }

    // Create sitemap entry with additional metadata
    const entryData = {
      ...body,
      createdBy: authResult.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('sitemapentries').insertOne(entryData);
    
    // Get the created entry
    const entry = await db.collection('sitemapentries').findOne({ 
      _id: result.insertedId 
    });

    if (!entry) {
      return NextResponse.json(
        { message: "Failed to create sitemap entry" },
        { status: 500 }
      );
    }

    return NextResponse.json(entry, { status: 201 });

  } catch (error) {
    console.error('Create sitemap entry error:', error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}