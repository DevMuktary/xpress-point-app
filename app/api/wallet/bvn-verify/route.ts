import { NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';

// --- Raudah (BVN) Credentials ---
const RAUDAH_API_KEY = process.env.RAUDAH_API_KEY;
const RAUDAH_ENDPOINT = 'https://raudah.com.ng/api/bvn/bvn';

if (!RAUDAH_API_KEY) {
  console.error("CRITICAL: RAUDAH_API_KEY is not set.");
}

// --- Helper Functions ---
function parseBvnData(data: any): {
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  nin: string | null;
} {
  console.log("--- DEBUG: Parsing BVN Data ---");
  const coreData = data.data?.data || data.data;
  const firstName = data.firstName || coreData?.firstname || coreData?.firstName || null;
  const lastName = data.lastName || coreData?.surname || coreData?.lastName || null;
  const dateOfBirth = coreData?.dateOfBirth || coreData?.birthdate || null;
  const nin = coreData?.nin || null;
  return { firstName, lastName, dateOfBirth, nin };
}

export async function POST(request: Request) {
  console.log("\n--- [DEBUG] NEW BVN VERIFICATION REQUEST ---");
  
  // 1. Get User
  const user = await getUserFromSession();
  if (!user) {
    console.error("[DEBUG] Auth check failed. User not found.");
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { bvn, dob } = body; 

    if (!bvn || !dob) {
      console.error("[DEBUG] BVN or DOB missing.");
      return NextResponse.json({ error: 'BVN and Date of Birth are required' }, { status: 400 });
    }

    // --- 2. Call Raudah BVN API ---
    const userReference = `XPS-BVN-${user.id.substring(0, 5)}-${Date.now()}`;
    const raudahPayload = {
      value: bvn,       // Using 'value' as per your original code
      ref: userReference
    };
    
    console.log("--- [DEBUG] Sending to Raudah ---");
    console.log("Payload:", JSON.stringify(raudahPayload));

    let data: any;
    try {
      const raudahResponse = await axios.post(
        RAUDAH_ENDPOINT, 
        raudahPayload,
        { headers: { 'Content-Type': 'application/json', 'Authorization': RAUDAH_API_KEY } }
      );
      data = raudahResponse.data; 
      console.log("--- [DEBUG] Received from Raudah (Success) ---");
    } catch (apiError: any) {
      console.error("--- [DEBUG] Received from Raudah (ERROR) ---", apiError.response?.data);
      throw new Error("The BVN verification service is currently unavailable.");
    }

    // --- 3. Handle Raudah Error Response ---
    if (data.status === false || data.success === false) {
      let errorMessage = data.message && typeof data.message === 'object' ? data.message['0'] : data.message;
      throw new Error(errorMessage || "BVN verification failed.");
    }
    
    // --- 4. Parse and Validate ---
    const { firstName, lastName, dateOfBirth, nin } = parseBvnData(data);

    if (!firstName || !lastName || !dateOfBirth) {
      throw new Error("BVN record not found or response was incomplete.");
    }

    let bvnDob = dateOfBirth;
    if (bvnDob.includes('-') && bvnDob.length === 10) {
      const parts = bvnDob.split('-');
      if (parts[0].length !== 4) { // Convert DD-MM-YYYY to YYYY-MM-DD
        bvnDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    if (bvnDob !== dob) {
      console.error(`[DEBUG] DOB Mismatch. User entered: ${dob}, BVN returned: ${bvnDob}`);
      return NextResponse.json(
        { error: 'Date of Birth does not match BVN record.' }, { status: 400 }
      );
    }
    
    console.log("[DEBUG] DOB Match successful.");
    const finalNin = nin || bvn; // Your requested logic

    // --- 5. Return Success Data to Frontend ---
    // We send back the verified data. The client will send this to the *next* API.
    return NextResponse.json({ 
      message: "Verification Successful",
      firstName,
      lastName,
      finalNin,
      bvn
    }, { status: 200 });

  } catch (error: any) {
    console.error('[DEBUG] FINAL CATCH BLOCK (VERIFY):', error.message);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      { status: 400 } 
    );
  }
}
