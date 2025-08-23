import { isAdmin } from '@/src/lib/auth-utils';
import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const data = await db.collection('settings').find({}).toArray();
    
    return NextResponse.json(data);
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    // Check if user is admin
    const adminCheck = await isAdmin(req);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Parse and validate request body
    const body = await req.json();

    // Check if setting with same key exists
    const existingSetting = await db.collection('settings').findOne({ 
      settingKey: body.settingKey 
    });
console.log(existingSetting)
    if (existingSetting) {
      return NextResponse.json(
        { message: "A setting with this key already exists" },
        { status: 400 }
      );
    }

    // Create setting with additional metadata
    const settingData = {
      ...body,
      createdBy: adminCheck.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('settings').insertOne(settingData);
    
    // Get the created setting
    const setting = await db.collection('settings').findOne({ 
      _id: result.insertedId 
    });

    if (!setting) {
      return NextResponse.json(
        { message: "Failed to create setting" },
        { status: 500 }
      );
    }

    return NextResponse.json(setting, { status: 201 });

  } catch (error) {
    console.error('Create setting error:', error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}