import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';

// API credentials
const RAUDAH_API_KEY = process.env.RAUDAH_API_KEY;
const RAUDAH_ENDPOINT = 'https://raudah.com.ng/api/bvn/bvn';

if (!RAUDAH_API_KEY) {
  console.error('CRITICAL: RAUDAH_API_KEY is not set in environment variables.');
}

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!RAUDAH_API_KEY) {
    console.error('BVN Verification Error: RAUDAH_API_KEY is missing.');
    return NextResponse.json(
      { error: 'Server configuration error. Please contact support.' },
      { status: 500 }
    );
  }

  if (user.isIdentityVerified) {
    return NextResponse.json({ error: 'Identity already verified' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { bvn, dob } = body; // dob is in 'YYYY-MM-DD'

    if (!bvn || !dob) {
      return NextResponse.json({ error: 'BVN and Date of Birth are required' }, { status: 400 });
    }

    // --- 1. Call Raudah BVN API ---
    // (We removed the inner try...catch as it's no longer needed)
    const response = await axios.post(
      RAUDAH_ENDPOINT,
      { value: bvn }, // 'ref' is optional, so we removed it
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': RAUDAH_API_KEY,
        },
      }
    );

    const data = response.data;

    // --- 2. Robust Error Handling (for 'status: false' or 'success: false') ---
    if (data.status === false || data.success === false) {
      let errorMessage = "BVN verification failed.";
      if (data.message && typeof data.message === 'object' && data.message['0']) {
        errorMessage = data.message['0'];
      } else if (data.message && typeof data.message === 'string') {
        errorMessage = data.message;
      }
      throw new Error(errorMessage);
    }
    
    // --- THIS IS THE FIX ---
    // The data is at data.data, not data.data.data
    const bvnData = data.data; 

    if (!bvnData || bvnData.status !== 'found') {
      throw new Error("BVN record not found.");
    }

    // --- 3. Validate Date of Birth ---
    // The field is 'dateOfBirth' and format is 'YYYY-MM-DD'
    const bvnDob = bvnData.dateOfBirth; 

    if (bvnDob !== dob) {
      return NextResponse.json(
        { error: 'Date of Birth does not match BVN record.' },
        { status: 400 }
      );
    }

    // --- 4. Update User in Database ---
    // Use the correct field names: 'firstName', 'lastName', and 'nin'
    const verifiedNin = bvnData.nin || null; 
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: bvnData.firstName,
        lastName: bvnData.lastName,
        bvn: bvn,
        nin: verifiedNin,
        isIdentityVerified: true,
      },
    });

    // --- 5. Send Response ---
    // The log shows 'nin: null', so this will trigger the fallback
    if (verifiedNin) {
      return NextResponse.json({ status: 'IDENTITY_VERIFIED', nin: verifiedNin });
    } else {
      return NextResponse.json({ status: 'NIN_REQUIRED' }); // This is what we expect
    }

  } catch (error: any) {
    // This will now only catch *real* errors
    console.error('BVN Verification Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
