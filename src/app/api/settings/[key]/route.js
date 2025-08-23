import { isAdmin } from '@/src/lib/auth-utils';
import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';

// Optional: same sanitize function you used in Express
import { sanitizeScript } from '@/src/lib/sanitize';

export async function PUT(req, { params }) {
  try {
    // ✅ Check if user is admin
    const adminCheck = await isAdmin(req);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const key = params.key;
    const body = await req.json();
    let { settingValue } = body;

    if (settingValue === undefined) {
      return NextResponse.json(
        { message: "Setting value is required" },
        { status: 400 }
      );
    }

    // ✅ Sanitize script-related settings
    if (key === "headerScripts" || key === "footerScripts") {
      settingValue = sanitizeScript(settingValue);
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Update the setting
    const result = await db.collection("settings").findOneAndUpdate(
      { settingKey: key },
      { $set: { settingValue, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { message: "Setting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Update setting error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
