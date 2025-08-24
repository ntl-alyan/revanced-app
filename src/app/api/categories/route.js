import { isAuthenticated } from "@/src/lib/auth-middleware";
import clientPromise from "@/src/lib/mongo";
import { NextResponse } from "next/server";
import { z } from "zod";

// Enhanced category schema with more validation
const insertCategorySchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name too long"),
  
  slug: z.string()
    .min(1, "Slug is required")
    .max(100, "Slug too long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  
  description: z.string().max(500, "Description too long").optional(),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
  parentId: z.string().optional().nullable(),
  icon: z.string().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
});

export async function POST(req) {
  try {
    // Check authentication
    const authResult = await isAuthenticated(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const validData = insertCategorySchema.parse(body);

    // Check if category with same slug exists
    const existingCategory = await db.collection('categories').findOne({ 
      slug: validData.slug 
    });

    if (existingCategory) {
      return NextResponse.json(
        { 
          message: "A category with this slug already exists",
          existingCategoryId: existingCategory._id
        },
        { status: 400 }
      );
    }

    // Validate parent category if provided
    if (validData.parentId) {
      if (!ObjectId.isValid(validData.parentId)) {
        return NextResponse.json(
          { message: "Invalid parent category ID format" },
          { status: 400 }
        );
      }

      const parentCategory = await db.collection('categories').findOne({ 
        _id: new ObjectId(validData.parentId) 
      });

      if (!parentCategory) {
        return NextResponse.json(
          { message: "Parent category not found" },
          { status: 400 }
        );
      }

      if (!parentCategory.isActive) {
        return NextResponse.json(
          { message: "Parent category is not active" },
          { status: 400 }
        );
      }
    }

    // Create category
    const categoryData = {
      name: validData.name,
      slug: validData.slug,
      description: validData.description,
      isActive: validData.isActive,
      order: validData.order,
      parentId: validData.parentId ? new ObjectId(validData.parentId) : null,
      icon: validData.icon,
      color: validData.color,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('categories').insertOne(categoryData);
    
    // Get the created category without MongoDB internal fields if desired
    const category = await db.collection('categories').findOne(
      { _id: result.insertedId },
      { projection: { _id: 1, name: 1, slug: 1, description: 1, isActive: 1, order: 1, parentId: 1, icon: 1, color: 1, createdAt: 1 } }
    );

    return NextResponse.json(category, { status: 201 });

  } catch (error) {
    console.error('Create category error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: "Validation failed", 
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const data = await db.collection('categories').find({}).toArray();
    
    return NextResponse.json(data);
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}


