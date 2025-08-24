import { NextResponse } from 'next/server';
import { writeFile, unlink, stat } from 'fs/promises';
import { join } from 'path';
import { nanoid } from 'nanoid';
import sharp from 'sharp';
import { isAuthenticated } from '@/src/lib/auth-middleware';
import { z } from 'zod';
import clientPromise from '@/src/lib/mongo';

// Define the media schema
const insertMediaSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  originalFilename: z.string().min(1, "Original filename is required"),
  filePath: z.string().min(1, "File path is required"),
  fileType: z.string().min(1, "File type is required"),
  fileSize: z.number().min(1, "File size must be positive"),
  uploadedBy: z.string().min(1, "Uploader ID is required"),
  width: z.number().optional(),
  height: z.number().optional(),
  createdAt: z.date().optional()
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

    // Parse the form data
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Generate a unique random filename with nanoid
    const webpFilename = `${nanoid(20)}.webp`;
    const webpPath = join(uploadDir, webpFilename);
    
    // Create uploads directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (mkdirError) {
      console.error('Error creating upload directory:', mkdirError);
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = join(uploadDir, `temp-${nanoid(10)}`);

    try {
      // Save temporary file
      await writeFile(tempPath, buffer);

      // Get image metadata
      const metadata = await sharp(tempPath).metadata();
      
      // Process the image with sharp to convert to WebP with optimized quality
      const sharpInstance = sharp(tempPath);
      
      // Optimize conversion based on image type
      const mimeType = file.type;
      if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
        sharpInstance.jpeg({ quality: 85, force: false });
      } else if (mimeType === 'image/png') {
        sharpInstance.png({ compressionLevel: 9, force: false });
      }
      
      // Apply basic optimizations
      sharpInstance
        .rotate() // Auto-rotate based on EXIF data
        .withMetadata({ orientation: 0 }); // Clear orientation after rotation
      
      // Convert to WebP
      await sharpInstance
        .webp({ 
          quality: 85, 
          alphaQuality: 100,
          lossless: mimeType === 'image/png' && metadata.hasAlpha,
          effort: 4
        })
        .toFile(webpPath);
        
      // Delete the temporary file
      await unlink(tempPath);
      
      // Create the media record
      const fileSize = (await stat(webpPath)).size;
      
      const mediaData = {
        filename: webpFilename,
        originalFilename: file.name,
        filePath: `/uploads/${webpFilename}`,
        fileType: 'image/webp',
        fileSize: fileSize,
        uploadedBy: authResult.user.id,
        width: metadata.width,
        height: metadata.height,
        createdAt:new Date()
      };
      
      const validData = insertMediaSchema.parse(mediaData);
      
      // Save to database
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB);
      
      const result = await db.collection('media').insertOne(validData);
      const media = await db.collection('media').findOne({ _id: result.insertedId });
      
      return NextResponse.json(media, { status: 201 });

    } catch (conversionError) {
      console.error('Image conversion error:', conversionError);
      
      // Clean up temporary file if it exists
      try {
        await unlink(tempPath);
      } catch (unlinkError) {
        console.error('Error cleaning up temp file:', unlinkError);
      }
      
      // Fallback: try simple conversion
      try {
        await sharp(buffer)
          .webp({ quality: 80 })
          .toFile(webpPath);
          
        const fileSize = (await stat(webpPath)).size;
        
        const mediaData = {
          filename: webpFilename,
          originalFilename: file.name,
          filePath: `/uploads/${webpFilename}`,
          fileType: 'image/webp',
          fileSize: fileSize,
          uploadedBy: authResult.user.id,
          width: undefined,
          height: undefined
        };
        
        const validData = insertMediaSchema.parse(mediaData);
        
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        
        const result = await db.collection('media').insertOne(validData);
        const media = await db.collection('media').findOne({ _id: result.insertedId });
        
        return NextResponse.json(media, { status: 201 });
        
      } catch (fallbackError) {
        console.error('Fallback conversion error:', fallbackError);
        return NextResponse.json(
          { message: "Failed to process image" },
          { status: 500 }
        );
      }
    }

  } catch (error) {
    console.error('Media upload error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: "Invalid media data", 
          errors: error.errors 
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

// Helper function to create directory (since fs.promises.mkdir might not be available)
async function mkdir(dir, options) {
  try {
    await import('fs').then(fs => fs.promises.mkdir(dir, options));
  } catch (error) {
    if (error.code === 'EEXIST') return;
    throw error;
  }
}