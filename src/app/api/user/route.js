import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get session (if using NextAuth)
    // const session = await getServerSession(authOptions);
    
    // if (!session) {
    //   return NextResponse.json(
    //     { message: "Not authenticated" },
    //     { status: 401 }
    //   );
    // }
    
    // // Connect to MongoDB
    // const client = await clientPromise;
    // const db = client.db(process.env.MONGODB_DB);
    
    // // Get user from database
    // const usersCollection = db.collection('users');
    // const user = await usersCollection.findOne({ 
    //   _id: new ObjectId(session.user.id) 
    // });
    
    // if (!user) {
    //   return NextResponse.json(
    //     { message: "User not found" },
    //     { status: 404 }
    //   );
    // }
    
    // // Remove password from response
    // const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json({});
  } catch (e) {
    console.error("Error fetching user:", e);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}