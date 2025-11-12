import { NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// --- THIS IS THE FIX ---
// Configure Cloudinary with your "world-class" keys from Railway
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});
// -----------------------

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
    // We must use a "Promise" to handle the upload stream
    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto', // Allows PDF, PNG, JPG
          folder: 'attestations' // Organizes files in your Cloudinary account
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
    return NextResponse.json({ 
      message: 'File uploaded successfully',
      url: data.secure_url // This is the permanent https:// URL
    });

  } catch (error: any) {
    console.error("File Upload Error:", error.message);
    return NextResponse.json(
      { error: 'File upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
