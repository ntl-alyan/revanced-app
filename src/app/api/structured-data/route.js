import { isAuthenticated } from '@/src/lib/auth-middleware';
import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const data = await db.collection('structureddatas').find({}).toArray();
    
    return NextResponse.json(data);
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

const commonEntityTypes = [
  'Article', 'BlogPosting', 'WebPage', 'WebSite', 'Organization', 
  'Person', 'Product', 'Event', 'Recipe', 'Review', 'VideoObject'
];

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
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      );
    }
    // Additional validation for common entity types (optional)
    if (!commonEntityTypes.includes(body.entityType)) {
      console.warn(`Uncommon entity type used: ${body.entityType}`);
    }

    // Check if structured data with same entity type and ID exists
    const existingData = await db.collection('structureddatas').findOne({ 
      entityType: body.entityType,
      entityId: body.entityId
    });

    if (existingData) {
      return NextResponse.json(
        { 
          message: "A structured data entry for this entity type and ID already exists",
          existingId: existingData._id
        },
        { status: 400 }
      );
    }

    // Create structured data
    const structuredData = {
      entityType: body.entityType,
      entityId: body.entityId,
      data: body.data,
      isActive: body.isActive,
      schemaType:body.schemaType,
      description: body.description,
      createdBy: authResult.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('structureddatas').insertOne(structuredData);
    
    // Get the created entry without MongoDB internal fields if desired
    const data = await db.collection('structureddatas').findOne(
      { _id: result.insertedId },
      { projection: { _id: 1, entityType: 1, entityId: 1, data: 1, isActive: 1, description: 1, createdAt: 1 } }
    );

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('Create structured data error:', error);
 
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}