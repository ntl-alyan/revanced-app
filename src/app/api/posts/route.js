import { isAuthenticated } from '@/src/lib/auth-middleware';
import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Fetch all posts from the database
    const posts = await db.collection('posts').find({}).toArray();
    
    // Filter published posts for public access
    const publishedPosts = posts.filter(post => post.status === 'published');
    
    return NextResponse.json(publishedPosts);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function PATCH() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Fetch all posts from the database
    const posts = await db.collection('posts').find({}).toArray();
    
    // Filter published posts for public access
    // const publishedPosts = posts.filter(post => post.status === 'published');
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// Define the post schema
const insertPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  categoryId: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  featuredImage: z.string().optional(),
  authorId: z.string().min(1, "Author ID is required"),
  metadata: z.record(z.any()).default({}),
});

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
    
    const postData = {
      ...body,
      authorId: authResult.user.id,
    };

    const validData = insertPostSchema.parse(postData);

    // Check if post with same slug exists
    const existingPost = await db.collection('posts').findOne({ 
      slug: validData.slug 
    });

    if (existingPost) {
      return NextResponse.json(
        { message: "A post with this slug already exists" },
        { status: 400 }
      );
    }

    // Validate category if provided
    if (validData.categoryId) {
      if (!ObjectId.isValid(validData.categoryId)) {
        return NextResponse.json(
          { message: "Invalid category ID format" },
          { status: 400 }
        );
      }

      const category = await db.collection('categories').findOne({ 
        _id: new ObjectId(validData.categoryId),
        isActive: true
      });

      if (!category) {
        return NextResponse.json(
          { message: "Category not found or inactive" },
          { status: 400 }
        );
      }
    }

    // Create post with additional metadata
    const post = {
      ...validData,
      // Convert categoryId to ObjectId if provided
      categoryId: validData.categoryId ? new ObjectId(validData.categoryId) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: validData.status === 'published' ? new Date() : null,
    };

    const result = await db.collection('posts').insertOne(post);
    
    // Get the created post
    const createdPost = await db.collection('posts').findOne({ 
      _id: result.insertedId 
    });

    if (!createdPost) {
      return NextResponse.json(
        { message: "Failed to create post" },
        { status: 500 }
      );
    }

    return NextResponse.json(createdPost, { status: 201 });

  } catch (error) {
    console.error('Create post error:', error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: "Invalid post data", 
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