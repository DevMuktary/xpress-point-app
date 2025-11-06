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

/**
 * NEW: A robust parser to find the data
 * This handles all the inconsistent API responses.
 */
function parseBvnData(data: any): {
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  nin: string | null;
} {
  // 1. Get the core data object
  // (From your log, it's data.data. For documentation, it's data.data.data)
  const coreData = data.data?.data || data.data;

  // 2. Find the names
  // (From your log, it's data.firstName. For documentation, it's coreData.firstname)
  const firstName = data.firstName || coreData?.firstname || coreData?.firstName || null;
  const lastName = data.lastName || coreData?.surname || coreData?.lastName || null;

  // 3. Find the DOB
  // (From your log, it's coreData.dateOfBirth. For documentation, it's coreData.birthdate)
  const dateOfBirth = coreData?.dateOfBirth || coreData?.birthdate || null;
  
  // 4. Find the NIN
  const nin = coreData?.nin || null;

  return { firstName, lastName, dateOfBirth, nin };
}


export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!RAUDAH_API_KEY) {
    console.error('BVN Verification Error: RAUDAH_API_KEY is missing.');
    return NextResponse.json(
      { error: 'Server configuration error. Please contact support.' }, { status: 500 }
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
    let data: any; 

    try {
      const raudahResponse = await axios.post(
        RAUDAH_ENDPOINT, { value: bvn }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': RAUDAH_API_KEY,
          },
        }
      );
      data = raudahResponse.data; 
      
    } catch (apiError: any) {
      if (apiError.response && apiError.response.data && (apiError.response.data.success === true || apiError.response.data.status === true)) {
        // This is our special case: API "failed" but sent success data
        console.log("Raudah API returned an error status, but payload contains 'success: true'. Treating as success.");
        data = apiError.response.data;
      } else {
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
    
    // --- 3. Use the NEW Bulletproof Parser ---
    const { firstName, lastName, dateOfBirth, nin } = parseBvnData(data);

    if (!firstName || !lastName || !dateOfBirth) {
      throw new Error("BVN record not found or response was incomplete.");
    }

    // 4. Validate Date of Birth
    // The parser handles DD-MM-YYYY or YYYY-MM-DD
    let bvnDob = dateOfBirth;
    if (bvnDob.includes('-') && bvnDob.length === 10) {
      const parts = bvnDob.split('-');
      if (parts[0].length === 4) {
        // It's YYYY-MM-DD, which is what we need
        bvnDob = `${parts[0]}-${parts[1]}-${parts[2]}`;
      } else {
        // It's DD-MM-YYYY, convert it
        bvnDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    if (bvnDob !== dob) {
      return NextResponse.json(
        { error: 'Date of Birth does not match BVN record.' },
        { status: 400 }
      );
    }

    // 5. Update User in Database
    const verifiedNin = nin || null; 
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: firstName,
        lastName: lastName,
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
      { status: 400 }
    );
  }
}
