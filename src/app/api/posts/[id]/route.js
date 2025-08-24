import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { isAuthenticated } from '@/src/lib/auth-middleware';
import { z } from "zod";

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
        { message: "Invalid post ID format" },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = await db.collection('posts').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    // Only allow the author or admin to delete the post
    const isAuthor = post.authorId === authResult.user.id;
    const isAdmin = authResult.user.role === "admin";
    
    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { message: "You don't have permission to delete this post" },
        { status: 403 }
      );
    }

    // Delete the post
    const result = await db.collection('posts').deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    // Return 204 No Content
    return NextResponse.json({ message: "Post Deleted" }, { status: 200 });

  } catch (error) {
    console.error('Delete post error:', error);
    
    // Handle invalid ObjectId format
    if (error instanceof Error && error.message.includes('ObjectId')) {
      return NextResponse.json(
        { message: "Invalid post ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req, { params }) {
  try {
    const { id } = params;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid post ID format" },
        { status: 400 }
      );
    }

    // Fetch the post
    const post = await db.collection('posts').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error("Get post error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "Post ID is required" },
        { status: 400 }
      );
    }

    // ✅ Authentication
    const authResult = await isAuthenticated(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const postsCollection = db.collection("posts");

    // ✅ Check if post exists
    const post = await postsCollection.findOne({ _id: new ObjectId(id) });
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // ✅ Only author or admin can update
    const isAuthor = post.authorId === authResult.user.id;
    const isAdmin = authResult.user.role === "admin";
    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { message: "You don't have permission to update this post" },
        { status: 403 }
      );
    }

    // ✅ Validate request body
    const body = await req.json();

    // ✅ If slug is being updated, check uniqueness
    if (body.slug) {
      const existingPost = await postsCollection.findOne({ slug: body.slug });
      if (existingPost && existingPost._id.toString() !== id) {
        return NextResponse.json(
          { message: "A post with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // ✅ Update post
    const result = await postsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...body, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Update Post API Error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}