import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb'; // Required for _id queries
import { hashPassword, isAdmin } from '@/src/lib/auth-utils';
import { isAuthenticated } from '@/src/lib/auth-middleware';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Validate ID format (optional but recommended)
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const user = await db.collection('users').findOne({
      _id: new ObjectId(id) // Convert string ID to ObjectId
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (e) {
    console.error('Error fetching user:', e);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}


export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Check authentication
    const authResult = await isAuthenticated(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const currentUser = authResult.user;

    // Get user data from request
    const { password, ...userData } = await req.json();

    // Check if user exists
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Authorization check
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      return NextResponse.json(
        { message: "Unauthorized to update this user" },
        { status: 403 }
      );
    }

    let updateData = { ...userData };

    // Non-admins cannot change role
    if (currentUser.role !== 'admin' && userData.role) {
      delete updateData.role;
    }

    // If password is provided, hash it
    if (password) {
      const hashedPassword = await hashPassword(password);
      updateData.password = hashedPassword;
    }

    // Update user
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const updatedUser = result;

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(userWithoutPassword);

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    // Check if user is admin
    const adminCheck = await isAdmin(req);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // Don't allow deleting your own account
    if (adminCheck.user && adminCheck.user.id === id) {
      return NextResponse.json(
        { message: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Check if user exists first
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Delete the user
    const result = await db.collection('users').deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Return 204 No Content
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}