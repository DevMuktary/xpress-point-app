import { NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';

const IMGBB_API_KEY = process.env.IMGBB_API_KEY;
const UPLOAD_ENDPOINT = 'https://api.imgbb.com/1/upload';

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (!IMGBB_API_KEY) {
    console.error("CRITICAL: IMGBB_API_KEY is not set.");
    return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
  }

  try {
    // 1. Get the file data from the request
    const formData = await request.formData();
    const file = formData.get('attestation') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // 2. Create a new FormData to send to ImgBB
    // We must convert the file to a base64 string
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const imageBase64 = buffer.toString('base64');

    const imgBbFormData = new FormData();
    imgBbFormData.append('image', imageBase64);
    
    // 3. Call the ImgBB API
    const response = await axios.post(
      `${UPLOAD_ENDPOINT}?key=${IMGBB_API_KEY}`,
      imgBbFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const data = response.data;

    if (data.success !== true || !data.data.url) {
      throw new Error(data.error?.message || 'File upload failed.');
    }

    // 4. Return the "world-class" secure URL
    return NextResponse.json({ 
      message: 'File uploaded successfully',
      url: data.data.url 
    });

  } catch (error: any) {
    console.error("File Upload Error:", error.message);
    return NextResponse.json(
      { error: 'File upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
