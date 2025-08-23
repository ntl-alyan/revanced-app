import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { isAuthenticated } from '@/src/lib/auth-middleware';

export async function GET(req, { params }) {
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
        { message: "Invalid structured data ID format" },
        { status: 400 }
      );
    }

    // Find structured data by ID
    const data = await db.collection('structureddatas').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!data) {
      return NextResponse.json(
        { message: "Structured data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Get structured data error:', error);
    
    // Handle invalid ObjectId format
    if (error instanceof Error && error.message.includes('ObjectId')) {
      return NextResponse.json(
        { message: "Invalid structured data ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
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
        { message: "Invalid structured data ID format" },
        { status: 400 }
      );
    }

    // Check if structured data exists
    const data = await db.collection('structureddatas').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!data) {
      return NextResponse.json(
        { message: "Structured data not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await req.json();

    // If entity type or entity ID is changing, check if it conflicts with an existing one
    if ((body.entityType && body.entityType !== data.entityType) || 
        (body.entityId && body.entityId !== data.entityId)) {
      
      const entityType = body.entityType || data.entityType;
      const entityId = body.entityId || data.entityId;
      
      const existingData = await db.collection('structureddatas').findOne({ 
        entityType,
        entityId,
        _id: { $ne: new ObjectId(id) } // Exclude current entry
      });

      if (existingData) {
        return NextResponse.json(
          { 
            message: "A structured data entry for this entity type and ID already exists" 
          },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {
      ...body,
      updatedAt: new Date()
    };

    // Update structured data
    const result = await db.collection('structureddatas').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { message: "Structured data not found" },
        { status: 404 }
      );
    }

    const updatedData = result;

    return NextResponse.json(updatedData);

  } catch (error) {
    console.error('Update structured data error:', error);
    

    // Handle invalid ObjectId format
    if (error instanceof Error && error.message.includes('ObjectId')) {
      return NextResponse.json(
        { message: "Invalid structured data ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function DELETE(req, { params }) {
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
        { message: "Invalid structured data ID format" },
        { status: 400 }
      );
    }

    // Check if structured data exists
    const data = await db.collection('structureddatas').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!data) {
      return NextResponse.json(
        { message: "Structured data not found" },
        { status: 404 }
      );
    }

    // Delete the structured data
    const result = await db.collection('structureddatas').deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Structured data not found" },
        { status: 404 }
      );
    }

    // Return 204 No Content
    return  NextResponse.json({ message: "Deleted Succesfully" }, { status: 200 });

  } catch (error) {
    console.error('Delete structured data error:', error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}