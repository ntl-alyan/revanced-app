import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const { slug } = params;
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Find app by slug
    const app = await db.collection('apps').findOne({ slug });
    
    if (!app) {
      return NextResponse.json(
        { message: "App not found" },
        { status: 404 }
      );
    }
    
    // Check if user is admin (you'll need to implement authentication)
    // For now, we'll assume we can get user info from headers or session
    // This is a placeholder - you'll need to implement proper auth
    const userRole = req.headers.get('x-user-role') || null;
    const isAdmin = userRole === 'admin';
    
    // Only return active apps for non-admin users
    if (!app.isActive && !isAdmin) {
      return NextResponse.json(
        { message: "App not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(app);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}