import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    // Get token from cookies or Authorization header
    const token = req.cookies.get('auth-token')?.value || 
                 req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    // If you need to fetch the full user data from database:
    // const client = await clientPromise;
    // const db = client.db(process.env.MONGODB_DB);
    // const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.id) });
    
    // Since JWT already contains user info, we can use that directly
    // Remove any sensitive fields if they exist in the token
    const { iat, exp, ...userWithoutJwtFields } = decoded;
    
    return NextResponse.json(userWithoutJwtFields);
    
  } catch (error) {
    console.error('User API error:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
