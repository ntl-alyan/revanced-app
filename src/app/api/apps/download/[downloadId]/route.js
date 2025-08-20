import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const { downloadId } = params;
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Get all apps and find the one with matching downloadId
    const apps = await db.collection('apps').find({}).toArray();
    const app = apps.find(app => app.downloadId === downloadId);
    
    if (!app) {
      return NextResponse.json(
        { message: "Download not found" },
        { status: 404 }
      );
    }
    
    // Check if user is admin (implement proper authentication)
    const userRole = req.headers.get('x-user-role') || null;
    const isAdmin = userRole === 'admin';
    
    // Only return active apps for non-admin users
    if (!app.isActive && !isAdmin) {
      return NextResponse.json(
        { message: "Download not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(app);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch download' },
      { status: 500 }
    );
  }
}