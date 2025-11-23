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

function parseApiError(error: any): string {
  if (error.code === 'ECONNABORTED') {
    return 'The verification service timed out. Please try again.';
  }
  if (error.response && error.response.data) {
    const data = error.response.data;
    if (data.message && typeof data.message === 'object' && data.message['0']) {
      return data.message['0'];
    }
    if (data.message && typeof data.message === 'string') {
      return data.message;
    }
  }
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
    
    // --- PRICE CHANGE ONLY (No Commission) ---
    // Using defaultAgentPrice for everyone
    const price = new Decimal(service.defaultAgentPrice);
    
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: 'Insufficient funds for lookup.' }, { status: 402 });
    }

    // --- 2. Call External API (ConfirmIdent) ---
    // We call API *before* charging to prevent charging for failed lookups (safe for lookups)
    const response = await axios.post(NIN_VERIFY_ENDPOINT, 
      { 
        nin: nin,
        ref: `XPRESSPOINT_NIN_${user.id}_${Date.now()}`
      },
      {
        headers: { 
          'api-key': CONFIRMIDENT_API_KEY,
          'Content-Type': 'application/json' 
        },
        timeout: 15000,
      }
    );

    const data = response.data;
    
    // --- 3. Handle ConfirmIdent Response ---
    if (data.success !== true || !data.data) {
      const errorMessage = data.message || "NIN verification failed.";
      return NextResponse.json({ error: `Sorry 😢 ${errorMessage}` }, { status: 404 });
    }
    
    const responseData = data.data;

    // --- 4. Data Mapping ---
    const mappedData = {
      photo: responseData.photo,
      firstname: responseData.firs_tname, 
      surname: responseData.last_name,
      middlename: responseData.middlename,
      birthdate: responseData.birthdate.replace(/-/g, '-'),
      nin: responseData.NIN,
      trackingId: responseData.trackingId,
      residence_AdressLine1: responseData.residence_AdressLine1,
      birthlga: responseData.birthlga,
      gender: responseData.gender,
      residence_lga: responseData.residence_lga,
      residence_state: responseData.residence_state,
      telephoneno: responseData.phone_number,
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
      // We now display defaultAgentPrice to everyone because that is what they will be charged
      // when they try to print the slip (based on the previous file we updated).
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
    console.error(`NIN Lookup (NIN) Error:`, errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
