import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';

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