]]import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';

// --- CONFIGURATION ---
// STRICTLY read from Environment Variables
const API_KEY = process.env.ROBOST_API_KEY; 
const ENDPOINT = "https://robosttech.com/api/nin_verify";

if (!API_KEY) {
  console.error("CRITICAL: ROBOST_API_KEY is not set in environment variables.");
}

// --- HELPER: Error Parser ---
function parseApiError(error: any): string {
  if (error.response) {
    console.error("--- [ROBOST API ERROR] ---");
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
  }

  return error.message || 'An internal server error occurred.';
}

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user || !user.isIdentityVerified) {
    return NextResponse.json({ error: 'Unauthorized or identity not verified.' }, { status: 401 });
  }

  // 1. Critical Check for API Key
  if (!API_KEY) {
    console.error("Service Error: ROBOST_API_KEY missing.");
    return NextResponse.json({ error: 'Service configuration error. Please contact support.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { nin } = body; 

    if (!nin) {
      return NextResponse.json({ error: 'NIN is required.' }, { status: 400 });
    }

    // --- 2. Get Service & Check Wallet ---
    const service = await prisma.service.findUnique({ where: { id: 'NIN_LOOKUP' } });
    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'This service is currently unavailable.' }, { status: 503 });
    }
    
    const price = new Decimal(service.defaultAgentPrice);
    
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: 'Insufficient funds for lookup.' }, { status: 402 });
    }

    // --- 3. Call RobostTech API ---
    console.log(`[ROBOST] Verifying NIN: ${nin} for user ${user.id}`);

    const response = await axios.post(
      ENDPOINT,
      { nin: nin },
      {
        headers: { 
          'api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 60000, 
      }
    );

    const apiRes = response.data;
    console.log("ROBOST RAW RESPONSE:", JSON.stringify(apiRes, null, 2));

    if (!apiRes.success || !apiRes.data) {
        throw new Error(apiRes.message || "Verification failed");
    }

    const responseData = apiRes.data;

    // --- 4. Data Mapping ---
    const mappedData = {
      photo: responseData.photo || "",
      firstname: responseData.firstname,
      surname: responseData.surname,
      middlename: responseData.middlename || "",
      birthdate: responseData.birthdate,
      nin: responseData.nin,
      trackingId: responseData.trackingId || `TRK-${Date.now()}`,
      residence_AdressLine1: responseData.residence_AdressLine1 || responseData.residence_Town,
      residence_lga: responseData.residence_lga,
      residence_state: responseData.residence_state,
      telephoneno: responseData.telephoneno,
      gender: responseData.gender,
      birthlga: responseData.birthlga,
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
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
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
