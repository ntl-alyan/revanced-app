import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { unlink, access } from 'fs/promises';
import { join } from 'path';
import { isAuthenticated } from '@/src/lib/auth-middleware';

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
        { message: "Invalid media ID format" },
        { status: 400 }
      );
    }

    // Check if media exists
    const media = await db.collection('media').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!media) {
      return NextResponse.json(
        { message: "Media not found" },
        { status: 404 }
      );
    }

    // Authorization check
    const isOwner = media.uploadedBy === authResult.user.id;
    const isAdmin = authResult.user.role === "admin";
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { message: "You don't have permission to delete this media" },
        { status: 403 }
      );
    }

    // Delete the file from the filesystem
    try {
      const filePath = join(process.cwd(), 'public', 'uploads', media.filename);
      
      // Check if file exists before trying to delete
      try {
        await access(filePath);
        
        // File exists, proceed with deletion
        await unlink(filePath);
        console.log(`Successfully deleted file: ${filePath}`);
        
      } catch (accessError) {
        if (accessError.code === 'ENOENT') {
          console.warn(`File not found, skipping deletion: ${filePath}`);
        } else {
          throw accessError;
        }
      }
    } catch (fileError) {
      console.error('Error deleting media file:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete the media record from database
    const result = await db.collection('media').deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Media not found" },
        { status: 404 }
      );
    }

    // Return 204 No Content
    return NextResponse.json({ message: "Media Deleted" }, { status: 200 });

  } catch (error) {
    console.error('Delete media error:', error);
    
    if (error instanceof Error && error.message.includes('ObjectId')) {
      return NextResponse.json(
        { message: "Invalid media ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}