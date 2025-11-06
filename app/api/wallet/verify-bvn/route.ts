import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';

// API credentials from your blueprint
const RAUDAH_API_KEY = process.env.RAUDAH_API_KEY;
const RAUDAH_ENDPOINT = 'https://raudah.com.ng/api/bvn/bvn';

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    const response = await axios.post(
      RAUDAH_ENDPOINT,
      {
        value: bvn,
        ref: `XPRESSPOINT_${user.id}_${Date.now()}` // Unique ref
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': RAUDAH_API_KEY,
        },
      }
    );

    const data = response.data;

    // --- 2. NEW ROBUST ERROR HANDLING ---
    // This checks for all known success and failure formats
    if (data.status === false || (data.data && data.data.status === false)) {
      let errorMessage = "BVN verification failed.";
      
      // Check for the error format from your log: { status: false, message: { '0': '...error...' } }
      if (data.message && typeof data.message === 'object' && data.message['0']) {
        errorMessage = data.message['0'];
      }
      // Check for other potential error formats
      else if (data.data && data.data.message) {
        errorMessage = data.data.message;
      }
      else if (data.message && typeof data.message === 'string') {
        errorMessage = data.message;
      }
      
      throw new Error(errorMessage);
    }
    // ------------------------------------

    // This is now the "success" path
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
      return NextResponse.json({
        status: 'IDENTITY_VERIFIED',
        nin: verifiedNin,
      });
    } else {
      return NextResponse.json({ status: 'NIN_REQUIRED' });
    }

  } catch (error: any) {
    // This now sends the *correct* error message to the frontend
    console.error('BVN Verification Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
