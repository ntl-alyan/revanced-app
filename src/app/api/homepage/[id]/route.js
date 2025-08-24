import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/src/lib/auth-utils';

export async function PATCH(req) {
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

    // Parse request body
    const updates = await req.json();

    // For PATCH, we don't need full validation, just use the data as-is
    // Find the homepage document (assuming there's only one)
    const homepage = await db.collection('homepage').findOne({});
    
    let result;
    
    if (homepage) {
      // Update existing homepage
      result = await db.collection('homepage').findOneAndUpdate(
        { _id: homepage._id },
        { 
          $set: {
            ...updates,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );
    } else {
      // Create new homepage if it doesn't exist
      result = await db.collection('homepage').insertOne({
        ...updates,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Get the created document
      result.value = await db.collection('homepage').findOne({ 
        _id: result.insertedId 
      });
    }

    if (!result.value) {
      return NextResponse.json(
        { message: "Failed to update homepage" },
        { status: 500 }
      );
    }

    return NextResponse.json(result.value);

  } catch (error) {
    console.error('Update homepage error:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}