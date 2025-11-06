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
    const { bvn, dob } = body; 

    if (!bvn || !dob) {
      return NextResponse.json({ error: 'BVN and Date of Birth are required' }, { status: 400 });
    }

    // --- 1. Call Raudah BVN API ---
    const raudahResponse = await axios.post(
      RAUDAH_ENDPOINT,
      { value: bvn }, // 'ref' is optional, so we removed it
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': RAUDAH_API_KEY,
        },
      }
    );

    const data = raudahResponse.data;

    // --- 2. Robust Error Handling ---
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
    // Get the data from their correct locations based on your log
    const bvnData = data.data;           // The nested data object
    const bvnFirstName = data.firstName;  // The root first name
    const bvnLastName = data.lastName;    // The root last name
    // ----------------------

    if (!bvnData || bvnData.status !== 'found' || !bvnFirstName || !bvnLastName) {
      throw new Error("BVN record not found or response was incomplete.");
    }

    // --- 3. Validate Date of Birth ---
    const bvnDob = bvnData.dateOfBirth; 

    if (bvnDob !== dob) {
      return NextResponse.json(
        { error: 'Date of Birth does not match BVN record.' },
        { status: 400 }
      );
    }

    // --- 4. Update User in Database ---
    const verifiedNin = bvnData.nin || null; 
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: bvnFirstName, // Use the correct variable
        lastName: bvnLastName,   // Use the correct variable
        bvn: bvn,
        nin: verifiedNin,
        isIdentityVerified: true,
      },
    });

    // --- 5. Send Response ---
    if (verifiedNin) {
      return NextResponse.json({ status: 'IDENTITY_VERIFIED', nin: verifiedNin });
    } else {
      // This will now trigger the NIN fallback
      return NextResponse.json({ status: 'NIN_REQUIRED' }); 
    }

  } catch (error: any) {
    console.error('BVN Verification Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
