import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const { categoryId } = params;
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // First, try to find the category by slug in categories collection
    const category = await db.collection('categories').findOne({ 
      $or: [
        { slug: categoryId }, // Try matching by slug
        { _id: categoryId }   // Also try matching by ID if needed
      ]
    });
    
    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }
    
    // Check if user is admin
    const userRole = req.headers.get('x-user-role') || null;
    const isAdmin = userRole === 'admin';
    
    // Build query based on user role
    let query = { categoryId: category._id }; // Use the category's ID
    if (!isAdmin) {
      query.status = 'published'; // Only published posts for non-admins
    }
    
    // Find posts with appropriate filters
    const categoryPosts = await db.collection('posts')
      .find(query)
      .toArray();
    
    // Optionally, you can include category info in the response
    const response = {
      category: {
        id: category._id,
        name: category.name,
        slug: category.slug
      },
      posts: categoryPosts
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch category posts' },
      { status: 500 }
    );
  }
}