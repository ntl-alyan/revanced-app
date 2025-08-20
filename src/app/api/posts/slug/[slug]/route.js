import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const { slug } = params;
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Find post by slug
    const post = await db.collection('posts').findOne({ slug });
    
    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }
    
    // Check if user is admin (implement proper authentication)
    const userRole = req.headers.get('x-user-role') || null;
    const isAdmin = userRole === 'admin';
    
    // Only return published posts for non-admin users
    if (post.status !== 'published' && !isAdmin) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}