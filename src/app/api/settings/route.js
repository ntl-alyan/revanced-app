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