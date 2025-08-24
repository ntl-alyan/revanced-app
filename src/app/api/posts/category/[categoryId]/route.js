import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { isAuthenticated } from '@/src/lib/auth-middleware';

export async function GET(req, { params }) {
  try {
    const { categoryId } = params;

    // Check authentication to determine if user is admin
    let isAdmin = false;
    try {
      const authResult = await isAuthenticated(req);
      isAdmin = authResult.authenticated && authResult.user?.role === 'admin';
    } catch (authError) {
      isAdmin = false;
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Validate if categoryId is a valid ObjectId or try to find by slug
    let category;
    let categoryQuery;

    if (ObjectId.isValid(categoryId)) {
      categoryQuery = { _id: new ObjectId(categoryId) };
    } else {
      categoryQuery = { slug: categoryId };
    }

    // Check if category exists
    category = await db.collection('categories').findOne(categoryQuery);

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    if (!category.isActive && !isAdmin) {
      return NextResponse.json(
        { message: "Category not available" },
        { status: 404 }
      );
    }

    // Build query based on user role
    let query = { categoryId: category._id.toString() };
    
    if (!isAdmin) {
      query.status = 'published';
    }

    // Get posts
    const posts = await db.collection('posts')
      .find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .project({
        title: 1,
        slug: 1,
        excerpt: 1,
        featuredImage: 1,
        status: 1,
        tags: 1,
        publishedAt: 1,
        createdAt: 1
      })
      .toArray();

    return NextResponse.json({
      posts,
      category: {
        id: category._id,
        name: category.name,
        slug: category.slug
      }
    });

  } catch (error) {
    console.error('Get category posts error:', error);
    
    if (error instanceof Error && error.message.includes('ObjectId')) {
      return NextResponse.json(
        { message: "Invalid category ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}