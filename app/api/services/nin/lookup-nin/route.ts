import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';

// --- CONFIGURATION ---
const ZEPA_API_BASE_URL = process.env.ZEPA_API_BASE_URL; 
const ZEPA_API_TOKEN = process.env.ZEPA_API_TOKEN;

if (!ZEPA_API_BASE_URL || !ZEPA_API_TOKEN) {
  console.error("CRITICAL: ZEPA_API_BASE_URL or ZEPA_API_TOKEN is not set.");
}

// --- HELPER: Error Parser ---
function parseApiError(error: any): string {
  if (error.response) {
    console.error("--- [ZEPA API ERROR] ---");
    console.error("Status:", error.response.status);
    console.error("Body:", JSON.stringify(error.response.data, null, 2));
  } else {
    console.error("Request Error:", error.message);
  }

  if (error.code === 'ECONNABORTED') {
    return 'The verification service timed out. Please try again.';
  }

  if (error.response && error.response.data) {
    const data = error.response.data;
    if (data.message) return typeof data.message === 'string' ? data.message : JSON.stringify(data.message);
    if (data.error) return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
  }

  return error.message || 'An internal server error occurred.';
}

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user || !user.isIdentityVerified) {
    return NextResponse.json({ error: 'Unauthorized or identity not verified.' }, { status: 401 });
  }

  if (!ZEPA_API_BASE_URL || !ZEPA_API_TOKEN) {
    return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { nin } = body; 

    if (!nin) {
      return NextResponse.json({ error: 'NIN is required.' }, { status: 400 });
    }

    // --- 1. Get Service & Check Wallet ---
    const service = await prisma.service.findUnique({ where: { id: 'NIN_LOOKUP' } });
    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'This service is currently unavailable.' }, { status: 503 });
    }
    
    const price = new Decimal(service.defaultAgentPrice);
    
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: 'Insufficient funds for lookup.' }, { status: 402 });
    }

    // --- 2. Call ZEPA API (SWITCHED TO V2) ---
    console.log(`[ZEPA V2] Verifying NIN: ${nin} for user ${user.id}`);
    
    // Clean URL construction
    const baseUrl = ZEPA_API_BASE_URL.replace(/\/$/, ""); 
    
    // UPDATED: Now pointing to /v2
    const endpoint = `${baseUrl}/api/v1/verify-nin/v2`;

    const response = await axios.post(
      endpoint,
      { nin: nin },
      {
        headers: { 
          'Authorization': `Bearer ${ZEPA_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 60000, // V2 might take longer, increased to 60s
      }
    );

    const data = response.data;

    // --- CRITICAL DEBUGGING LOG ---
    // Watch this log to see if V2 returns the address!
    console.log("ZEPA V2 RAW RESPONSE:", JSON.stringify(data, null, 2));

    // --- 3. Validate Response ---
    const responseData = data.data || data; 

    if (!responseData) {
      throw new Error("API returned success but no data payload found.");
    }

    // --- 4. Data Mapping (With Telephone Fix & Expanded Address Fields) ---
    const mappedData = {
      // Photo
      photo: responseData.photo || responseData.image || responseData.picture || responseData.photo_base64 || "",
      
      // Names
      firstname: responseData.firstname || responseData.firstName || responseData.first_name || responseData.FirstName,
      surname: responseData.surname || responseData.lastName || responseData.last_name || responseData.Surname,
      middlename: responseData.middlename || responseData.middleName || responseData.middle_name || responseData.othername || responseData.otherName || "",
      
      // Dates
      birthdate: (responseData.birthdate || responseData.dateOfBirth || responseData.dob || responseData.birthDate || "").replace(/-/g, '-'),
      
      // NIN
      nin: responseData.nin || responseData.NIN || nin,
      
      trackingId: responseData.trackingId || responseData.tracking_id || `TRK-${Date.now()}`,
      
      // Address (Expanded for V2)
      residence_AdressLine1: responseData.residence_AdressLine1 || responseData.address || responseData.residenceAddress || responseData.residence_address || responseData.fullAddress || responseData.addressLine1 || responseData.residence_Town,
      
      // LGA & State
      residence_lga: responseData.residence_lga || responseData.lga || responseData.residenceLga || responseData.LGA,
      residence_state: responseData.residence_state || responseData.state || responseData.residenceState || responseData.stateOfResidence,
      
      // Phone (With Capital N fix)
      telephoneno: responseData.telephoneNo || responseData.telephoneno || responseData.phoneNumber || responseData.phone_number || responseData.phone || responseData.mobile || responseData.tel,
      
      // Gender
      gender: responseData.gender || responseData.sex,
      
      // Birth Details
      birthlga: responseData.birthlga || responseData.birthLga,
      birthstate: responseData.birthstate || responseData.birthState,
      
      // Other
      maritalstatus: responseData.maritalstatus || responseData.maritalStatus,
      profession: responseData.profession || responseData.occupation,
      religion: responseData.religion,
      signature: responseData.signature,
    };

    // --- 5. Charge User & Save Transaction ---
    const [_, verificationRecord] = await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: price } },
      }),
      prisma.ninVerification.create({
        data: {
          userId: user.id,
          data: mappedData as any,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          type: 'SERVICE_CHARGE',
          amount: price.negated(),
          description: `NIN Verification Lookup V2 (${nin})`,
          reference: `NIN-LOOKUP-${Date.now()}`,
          status: 'COMPLETED',
        },
      }),
    ]);

    // --- 6. Return Data ---
    const slipPrices = await prisma.service.findMany({
      where: {
        id: { in: ['NIN_SLIP_REGULAR', 'NIN_SLIP_STANDARD', 'NIN_SLIP_PREMIUM'] }
      },
      select: { id: true, defaultAgentPrice: true }
    });
    
    const getPrice = (id: string) => {
      const s = slipPrices.find(sp => sp.id === id);
      return s ? s.defaultAgentPrice : 0;
    };

    return NextResponse.json({
      message: 'Verification Successful',
      verificationId: verificationRecord.id,
      data: mappedData,
      slipPrices: {
        Regular: getPrice('NIN_SLIP_REGULAR'),
        Standard: getPrice('NIN_SLIP_STANDARD'),
        Premium: getPrice('NIN_SLIP_PREMIUM'),
      }
    });

  } catch (error: any) {
    const errorMessage = parseApiError(error);
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
