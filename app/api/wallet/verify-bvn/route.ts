import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';

// API credentials from your blueprint
const RAUDAH_API_KEY = process.env.RAUDAH_API_KEY;
const RAUDAH_ENDPOINT = 'https://raudah.com.ng/api/bvn/bvn';

// This checks if the variable is missing when the server starts
if (!RAUDAH_API_KEY) {
  console.error('CRITICAL: RAUDAH_API_KEY is not set in environment variables.');
}

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // --- THIS IS THE FIX ---
  // This check prevents the server from crashing if the key is missing
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
    let raudahResponse;
    try {
      raudahResponse = await axios.post(
        RAUDAH_ENDPOINT,
        {
          value: bvn,
          ref: `XPRESSPOINT_${user.id}_${Date.now()}`
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': RAUDAH_API_KEY, // This is now safe to use
          },
        }
      );
    } catch (apiError: any) {
      // This catches if Raudah's server is down or the key is wrong
      console.error("RAUDAH API CALL FAILED:", apiError.response ? apiError.response.data : apiError.message);
      throw new Error("The verification service is currently unavailable. Please try again later.");
    }

    const data = raudahResponse.data;

    // --- 2. Robust Error Handling (from your logs) ---
    if (data.status === false || (data.data && data.data.status === false)) {
      let errorMessage = "BVN verification failed.";
      if (data.message && typeof data.message === 'object' && data.message['0']) {
        errorMessage = data.message['0'];
      }
      else if (data.data && data.data.message) {
        errorMessage = data.data.message;
      }
      else if (data.message && typeof data.message === 'string') {
        errorMessage = data.message;
      }
      throw new Error(errorMessage);
    }
    
    const bvnData = data.data.data;

    // --- 3. Validate Date of Birth ---
    const [day, month, year] = bvnData.birthdate.split('-');
    const bvnDob = `${year}-${month}-${day}`;

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
        firstName: bvnData.firstname,
        lastName: bvnData.surname,
        bvn: bvn,
        nin: verifiedNin,
        isIdentityVerified: true,
      },
    });

    // --- 5. Send Response ---
    if (verifiedNin) {
      return NextResponse.json({ status: 'IDENTITY_VERIFIED', nin: verifiedNin });
    } else {
      return NextResponse.json({ status: 'NIN_REQUIRED' });
    }

  } catch (error: any) {
    // This will now return the error (e.g., "BVN not found") to the modal
    console.error('BVN Verification Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
