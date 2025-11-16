import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';

// ConfirmIdent API for NIN
const CONFIRMIDENT_API_KEY = process.env.CONFIRMIDENT_API_KEY;
const NIN_VERIFY_ENDPOINT = 'https://confirmident.com.ng/api/nin_search'; // This is the vNIN endpoint

if (!CONFIRMIDENT_API_KEY) {
  console.error("CRITICAL: CONFIRMIDENT_API_KEY is not set.");
}

// Helper to parse NIN data
function parseNinData(data: any): {
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  nin: string | null;
} {
  console.log("--- DEBUG: Parsing ConfirmIdent NIN Data ---");
  const coreData = data.data; 
  console.log("Core Data:", JSON.stringify(coreData));
  
  const firstName = coreData?.firs_tname || coreData?.firstname || null;
  const lastName = coreData?.last_name || coreData?.surname || null;
  const dateOfBirth = coreData?.date_of_birth || coreData?.birthdate || null;
  const nin = coreData?.nin || coreData?.NIN || null;

  return { firstName, lastName, dateOfBirth, nin };
}

export async function POST(request: Request) {
  console.log("\n--- [DEBUG] NEW NIN VERIFICATION REQUEST ---");
  
  const user = await getUserFromSession();
  if (!user) {
    console.error("[DEBUG] Auth check failed. User not found.");
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { nin, dob } = body; 

    if (!nin || !dob) {
      return NextResponse.json({ error: 'NIN and Date of Birth are required' }, { status: 400 });
    }

    // --- 1. Call ConfirmIdent NIN API ---
    const userReference = `XPS-NIN-${user.id.substring(0, 5)}-${Date.now()}`;
    const confirmIdentPayload = {
      nin: nin,
      ref: userReference
    };
    
    console.log("--- [DEBUG] Sending to ConfirmIdent (NIN) ---");
    console.log("Payload:", JSON.stringify(confirmIdentPayload));

    let data: any;
    try {
      const apiResponse = await axios.post(
        NIN_VERIFY_ENDPOINT, 
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
      throw new Error("The NIN verification service is currently unavailable.");
    }

    // --- 2. Handle ConfirmIdent Error Response ---
    if (!data.data) {
      throw new Error(data.message || "NIN verification failed.");
    }
    
    // --- 3. Parse and Validate ---
    const { firstName, lastName, dateOfBirth, nin: verifiedNin } = parseNinData(data);

    if (!firstName || !lastName || !dateOfBirth) {
      throw new Error("NIN record not found or response was incomplete.");
    }

    let ninDob = dateOfBirth; // e.g., "01-01-2000"
    if (ninDob.includes('-') && ninDob.length === 10) {
      const parts = ninDob.split('-');
      if (parts[0].length === 2) { // Convert DD-MM-YYYY
        ninDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    if (ninDob !== dob) {
      console.error(`[DEBUG] DOB Mismatch. User entered: ${dob}, NIN returned: ${ninDob}`);
      return NextResponse.json(
        { error: 'Date of Birth does not match NIN record.' }, { status: 400 }
      );
    }
    
    console.log("[DEBUG] DOB Match successful.");

    // --- 4. Update User in Database (This is a free verification) ---
    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: firstName,
        lastName: lastName,
        nin: verifiedNin, // Save the verified NIN
        bvn: verifiedNin, // Save NIN to BVN field as requested
        isIdentityVerified: true,
      },
    });
    
    console.log("[DEBUG] User identity verified successfully.");

    // --- 5. Return Success Data to Frontend ---
    return NextResponse.json({ 
      message: "Verification Successful",
    }, { status: 200 });

  } catch (error: any) {
    console.error('[DEBUG] FINAL CATCH BLOCK (NIN-VERIFY):', error.message);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      { status: 400 } 
    );
  }
}
