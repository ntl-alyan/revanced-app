import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/src/lib/auth-middleware'; // Your auth middleware

export async function GET(req) {
  try {
    // Check authentication
    const authResult = await isAuthenticated(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Fetch all redirects from the database
    const redirects = await db.collection('media').find({}).toArray();
    
    return NextResponse.json(redirects);
  } catch (error) {
    console.error('Media API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}