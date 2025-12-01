import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';

// API credentials
const CONFIRMIDENT_API_KEY = process.env.CONFIRMIDENT_API_KEY;
const NIN_VERIFY_ENDPOINT = 'https://confirmident.com.ng/api/nin_search';

if (!CONFIRMIDENT_API_KEY) {
  console.error("CRITICAL: CONFIRMIDENT_API_KEY is not set.");
}

// --- HELPER: Enhanced Error Logger ---
function parseApiError(error: any): string {
  // 1. Log the RAW response to your server console so you can see the real issue
  if (error.response) {
    console.error("--- [PROVIDER ERROR START] ---");
    console.error("Status Code:", error.response.status);
    console.error("Full Error Body:", JSON.stringify(error.response.data, null, 2));
    console.error("--- [PROVIDER ERROR END] ---");
  } else {
    console.error("Request Error:", error.message);
  }

  // 2. Timeout handling
  if (error.code === 'ECONNABORTED') {
    return 'The verification service timed out. Please try again.';
  }

  // 3. Extract message from response safely
  if (error.response && error.response.data) {
    const data = error.response.data;

    // Check for "message" object (Laravel/PHP style)
    if (data.message && typeof data.message === 'object' && data.message['0']) {
      return data.message['0'];
    }
    // Check for "message" string
    if (data.message && typeof data.message === 'string') {
      return data.message;
    }
    // Check for "error" string
    if (data.error && typeof data.error === 'string') {
      return data.error;
    }
  }

  // 4. Fallback
  if (error.message) {
    return error.message;
  }
  return 'An internal server error occurred.';
}

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user || !user.isIdentityVerified) {
    return NextResponse.json({ error: 'Unauthorized or identity not verified.' }, { status: 401 });
  }

  if (!CONFIRMIDENT_API_KEY) {
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
    
    // Using defaultAgentPrice for everyone
    const price = new Decimal(service.defaultAgentPrice);
    
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: 'Insufficient funds for lookup.' }, { status: 402 });
    }

    // --- 2. Call External API (ConfirmIdent) ---
    // Note: We intentionally call the API *before* charging to avoid refund logic on failure.
    // This is safe for lookups, but not for vending products.
    console.log(`Attempting NIN Lookup for user ${user.id}...`);

    const response = await axios.post(NIN_VERIFY_ENDPOINT, 
      { 
        nin: nin,
        ref: `XPRESSPOINT_NIN_${user.id}_${Date.now()}` // Unique Ref
      },
      {
        headers: { 
          'api-key': CONFIRMIDENT_API_KEY,
          'Content-Type': 'application/json' 
        },
        timeout: 25000, // Increased timeout to 25s
      }
    );

    const data = response.data;
    
    // --- 3. Handle ConfirmIdent Response ---
    if (data.success !== true || !data.data) {
      // Force throw to go to catch block if success is false but status was 200
      const errorMessage = data.message || "NIN verification failed.";
      throw { response: { data: data, status: 200 } }; 
    }
    
    const responseData = data.data;

    // --- 4. Data Mapping (Defensive Coding) ---
    // Checks multiple casing variations (e.g. firstname, Firstname, firs_tname)
    const mappedData = {
      photo: responseData.photo,
      
      firstname: responseData.firstname || responseData.first_name || responseData.firs_tname || responseData.FirstName,
      surname: responseData.surname || responseData.last_name || responseData.Surname,
      middlename: responseData.middlename || responseData.middle_name || responseData.MiddleName || "",
      
      birthdate: responseData.birthdate ? responseData.birthdate.replace(/-/g, '-') : "",
      nin: responseData.nin || responseData.NIN, 
      trackingId: responseData.trackingId || responseData.tracking_id,
      
      residence_AdressLine1: responseData.residence_AdressLine1 || responseData.address,
      birthlga: responseData.birthlga,
      gender: responseData.gender,
      residence_lga: responseData.residence_lga,
      residence_state: responseData.residence_state,
      
      telephoneno: responseData.telephoneno || responseData.phone_number || responseData.phone,
      
      birthstate: responseData.birthstate,
      maritalstatus: responseData.maritalstatus,
      profession: responseData.profession,
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
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          type: 'SERVICE_CHARGE',
          amount: price.negated(),
          description: `NIN Verification Lookup (${nin})`,
          reference: `NIN-LOOKUP-${Date.now()}`,
          status: 'COMPLETED',
        },
      }),
    ]);

    // --- 6. Return Success Data to Frontend ---
    const slipPrices = await prisma.service.findMany({
      where: {
        id: { in: ['NIN_SLIP_REGULAR', 'NIN_SLIP_STANDARD', 'NIN_SLIP_PREMIUM'] }
      },
      select: {
        id: true,
        defaultAgentPrice: true, 
      }
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
    // This calls our new logger
    const errorMessage = parseApiError(error);
    
    // Return the specific error message to the frontend
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
