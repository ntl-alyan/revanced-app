import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { isAuthenticated } from '@/src/lib/auth-middleware';
import { z } from "zod";

export async function GET(req, { params }) {
  try {
    const { id } = params;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    let category;

    // Check if the ID is a valid MongoDB ObjectId
    if (ObjectId.isValid(id)) {
      // Find category by MongoDB ID
      category = await db.collection('categories').findOne({ 
        _id: new ObjectId(id) 
      });
    } else {
      // If not a valid ObjectId, try finding by slug
      category = await db.collection('categories').findOne({ 
        slug: id 
      });
    }

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);

  } catch (error) {
    console.error('Get category error:', error);
    
    // Handle invalid ObjectId format
    if (error instanceof Error && error.message.includes('ObjectId')) {
      return NextResponse.json(
        { message: "Invalid category ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

const updateCategorySchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  slug: z.string().min(1, "Slug is required").optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
  parentId: z.string().optional().nullable(),
  icon: z.string().optional(),
  color: z.string().optional(),
}).partial();

export async function PUT(req, { params }) {
  try {
    const { id } = params;

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

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid category ID format" },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await db.collection('categories').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validData = updateCategorySchema.parse(body);

    // If slug is being updated, check if it already exists
    if (validData.slug && validData.slug !== category.slug) {
      const existingCategory = await db.collection('categories').findOne({ 
        slug: validData.slug,
        _id: { $ne: new ObjectId(id) } // Exclude current category
      });

      if (existingCategory) {
        return NextResponse.json(
          { message: "A category with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Validate parent category if provided
    if (validData.parentId !== undefined) {
      if (validData.parentId === null) {
        // Allow setting parentId to null
      } else if (!ObjectId.isValid(validData.parentId)) {
        return NextResponse.json(
          { message: "Invalid parent category ID format" },
          { status: 400 }
        );
      } else {
        const parentCategory = await db.collection('categories').findOne({ 
          _id: new ObjectId(validData.parentId) 
        });

        if (!parentCategory) {
          return NextResponse.json(
            { message: "Parent category not found" },
            { status: 400 }
          );
        }

        // Prevent circular references
        if (validData.parentId === id) {
          return NextResponse.json(
            { message: "Category cannot be its own parent" },
            { status: 400 }
          );
        }
      }
    }

    // Prepare update data
    const updateData = {
      ...validData,
      updatedAt: new Date()
    };

    // Convert parentId to ObjectId if provided
    if (validData.parentId !== undefined) {
      updateData.parentId = validData.parentId ? new ObjectId(validData.parentId) : null;
    }

    // Update category
    const result = await db.collection('categories').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    const updatedCategory = result;

    return NextResponse.json(updatedCategory);

  } catch (error) {
    console.error('Update category error:', error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: "Invalid category data", 
          errors: error.errors 
        },
        { status: 400 }
      );
    }

    // Handle invalid ObjectId format
    if (error instanceof Error && error.message.includes('ObjectId')) {
      return NextResponse.json(
        { message: "Invalid category ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;

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

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid category ID format" },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await db.collection('categories').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // Delete the category
    const result = await db.collection('categories').deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // Return 204 No Content
    return  NextResponse.json({ message: "Deleted Successfully" }, { status: 200 });

  } catch (error) {
    console.error('Delete category error:', error);
    
    // Handle invalid ObjectId format
    if (error instanceof Error && error.message.includes('ObjectId')) {
      return NextResponse.json(
        { message: "Invalid category ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
