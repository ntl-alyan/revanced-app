import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const { slug } = params;
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Find page by slug
    const page = await db.collection('pages').findOne({ slug });
    
    if (!page) {
      return NextResponse.json(
        { message: "Page not found" },
        { status: 404 }
      );
    }
    
    // Check if user is admin
    const userRole = req.headers.get('x-user-role') || null;
    const isAdmin = userRole === 'admin';
    
    // Only return published pages for non-admin users
    if (page.status !== 'published' && !isAdmin) {
      return NextResponse.json(
        { message: "Page not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(page);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}