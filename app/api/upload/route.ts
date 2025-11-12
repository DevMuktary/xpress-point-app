import { NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with your "world-class" keys
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    // 1. Get the file data from the request
    const formData = await request.formData();
    const file = formData.get('attestation') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // 2. Convert the file to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Upload the buffer to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          // --- THIS IS THE "WORLD-CLASS" FIX ---
          // We force 'raw' for PDFs, not 'auto' or 'image'
          resource_type: 'raw',
          // ------------------------------------
          folder: 'attestations', // Organizes files
          public_id: file.name    // Uses the original file name
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });

    const data = uploadResponse as any;

    // 4. Check for a "world-class" success
    if (!data || !data.secure_url) {
      throw new Error('Cloudinary upload failed.');
    }

    // 5. Return the "world-class" permanent URL
    // This URL will now correctly be:
    // https://res.cloudinary.com/.../raw/upload/.../attestation.pdf
    return NextResponse.json({ 
      message: 'File uploaded successfully',
      url: data.secure_url 
    });

  } catch (error: any) {
    console.error("File Upload Error:", error.message);
    return NextResponse.json(
      { error: 'File upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
