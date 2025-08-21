import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import clientPromise from "@/src/lib/mongo";

// Schema validation
const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["admin", "editor"]),
});

export async function POST(req) {
  try {
    const body = await req.json();

    // Validate input
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { username, email, password, firstName, lastName, role } = parsed.data;

    // Connect to Mongo
   
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB); 
    const users = db.collection("users");

    // Check if user already exists
    const existing = await users.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await users.insertOne({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "User created successfully", userId: result.insertedId },
      { status: 201 }
    );
  } catch (err) {
    console.error("CreateUser API Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
