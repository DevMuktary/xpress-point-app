import { NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';

// --- ConfirmIdent API for BVN ---
const CONFIRMIDENT_API_KEY = process.env.CONFIRMIDENT_API_KEY;
const BVN_VERIFY_ENDPOINT = 'https://confirmident.com.ng/api/bvn_search';

if (!CONFIRMIDENT_API_KEY) {
  console.error("CRITICAL: CONFIRMIDENT_API_KEY is not set.");
}

// --- THIS IS THE "WORLD-CLASS" FIX (Part 1) ---
// We "refurbish" this function to *exactly* match your "stunning" log file
function parseBvnData(data: any): {
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  nin: string | null;
} {
  console.log("--- DEBUG: Parsing ConfirmIdent Data ---");
  // The "data.data" object is the *only* "world-class" source of truth
  const coreData = data.data; 
  console.log("Core Data:", JSON.stringify(coreData));
  
  // "Refurbished" to use the *exact* field names from your log
  const firstName = coreData?.firstName || coreData?.firs_tname || null;
  const lastName = coreData?.lastName || coreData?.last_name || null;
  const dateOfBirth = coreData?.dateOfBirth || coreData?.date_of_birth || null;
  const nin = coreData?.nin || null;

  console.log("Parsed Name:", `${firstName} ${lastName}`);
  console.log("Parsed DOB:", dateOfBirth);
  console.log("Parsed NIN:", nin);
  return { firstName, lastName, dateOfBirth, nin };
}
// --------------------------------------------------

export async function POST(request: Request) {
  console.log("\n--- [DEBUG] NEW BVN VERIFICATION REQUEST ---");
  
  const user = await getUserFromSession();
  if (!user) {
    console.error("[DEBUG] Auth check failed. User not found.");
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { bvn, dob } = body; 

    if (!bvn || !dob) {
      return NextResponse.json({ error: 'BVN and Date of Birth are required' }, { status: 400 });
    }

    // --- 2. Call ConfirmIdent BVN API ---
    const userReference = `XPS-BVN-${user.id.substring(0, 5)}-${Date.now()}`;
    const confirmIdentPayload = {
      bvn: bvn,
      ref: userReference
    };
    
    console.log("--- [DEBUG] Sending to ConfirmIdent ---");
    console.log("Payload:", JSON.stringify(confirmIdentPayload));

    let data: any;
    try {
      const apiResponse = await axios.post(
        BVN_VERIFY_ENDPOINT, 
        confirmIdentPayload,
        { 
          headers: {
            'api-key': CONFIRMIDENT_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      data = apiResponse.data; 
      console.log("--- [DEBUG] Received from ConfirmIdent (Success) ---");
      console.log("Data:", JSON.stringify(data));
      
    } catch (apiError: any) {
      console.error("--- [DEBUG] Received from ConfirmIdent (ERROR) ---", apiError.response?.data);
      throw new Error("The BVN verification service is currently unavailable.");
    }

    // --- 3. Handle ConfirmIdent Response ---
    // We check for the 'data' object, not 'success: true'.
    if (data.data) {
      console.log("[DEBUG] data.data object exists. Proceeding...");
    } else {
      throw new Error(data.message || "BVN verification failed.");
    }
    
    // --- 4. Parse and Validate ---
    const { firstName, lastName, dateOfBirth, nin } = parseBvnData(data);

    if (!firstName || !lastName || !dateOfBirth) {
      throw new Error("BVN record not found or response was incomplete.");
    }

    // --- THIS IS THE "WORLD-CLASS" FIX (Part 2) ---
    // Handle ConfirmIdent's "01-01-2001" format
    let bvnDob = dateOfBirth; // e.g., "01-01-2001" (from your log)
    if (bvnDob.includes('-') && bvnDob.length === 10) {
      const parts = bvnDob.split('-');
      // Convert DD-MM-YYYY to YYYY-MM-DD
      if (parts[0].length === 2) {
        bvnDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    // ---------------------------------

    if (bvnDob !== dob) {
      console.error(`[DEBUG] DOB Mismatch. User entered: ${dob}, BVN returned: ${bvnDob}`);
      return NextResponse.json(
        { error: 'Date of Birth does not match BVN record.' }, { status: 400 }
      );
    }
    
    console.log("[DEBUG] DOB Match successful.");
    const finalNin = nin || bvn; // Your requested logic

    // --- 5. Return Success Data to Frontend ---
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
