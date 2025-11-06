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
    let data: any; // Define data in the outer scope

    try {
      // This is the "happy path"
      const raudahResponse = await axios.post(
        RAUDAH_ENDPOINT,
        { value: bvn }, // 'ref' is optional
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': RAUDAH_API_KEY,
          },
        }
      );
      data = raudahResponse.data; // Assign if 2xx status
      
    } catch (apiError: any) {
      // --- THIS IS THE FIX ---
      // This block runs if the HTTP status is 4xx or 5xx
      console.log("Raudah API returned an error status, checking payload...");
      
      if (apiError.response && apiError.response.data && apiError.response.data.success === true) {
        // This is the scenario from your log:
        // The API failed (e.g., 500 status) BUT sent a success payload.
        // We will trust the payload and treat it as a success.
        console.log("...Payload contains 'success: true'. Treating as success.");
        data = apiError.response.data;
      } else {
        // This is a *real* failure (e.g., server down, auth failed)
        console.error("RAUDAH API CALL FAILED:", apiError.response ? apiError.response.data : apiError.message);
        throw new Error("The verification service is currently unavailable. Please try again later.");
      }
    }

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

    // --- 3. Parse the successful response ---
    const bvnData = data.data;
    const bvnFirstName = data.firstName;
    const bvnLastName = data.lastName;

    if (!bvnData || bvnData.status !== 'found' || !bvnFirstName || !bvnLastName) {
      throw new Error("BVN record not found or response was incomplete.");
    }

    // 4. Validate Date of Birth
    const bvnDob = bvnData.dateOfBirth; 

    if (bvnDob !== dob) {
      return NextResponse.json(
        { error: 'Date of Birth does not match BVN record.' },
        { status: 400 }
      );
    }

    // 5. Update User in Database
    const verifiedNin = bvnData.nin || null; 
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: bvnFirstName,
        lastName: bvnLastName,
        bvn: bvn,
        nin: verifiedNin,
        isIdentityVerified: true,
      },
    });

    // 6. Send Response
    if (verifiedNin) {
      return NextResponse.json({ status: 'IDENTITY_VERIFIED', nin: verifiedNin });
    } else {
      return NextResponse.json({ status: 'NIN_REQUIRED' }); 
    }

  } catch (error: any) {
    console.error('BVN Verification Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      { status: 400 } // Send 400, not 500, as it's a handled error
    );
  }
}
