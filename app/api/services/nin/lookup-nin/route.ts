import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';

// --- THIS IS THE FIX ---
// Using our existing Raudah key and the NEW Raudah NIN endpoint
const RAUDAH_API_KEY = process.env.RAUDAH_API_KEY;
const NIN_VERIFY_ENDPOINT = 'https://raudah.com.ng/api/nin/v3';

if (!RAUDAH_API_KEY) {
  console.error("CRITICAL: RAUDAH_API_KEY is not set.");
}

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user || !user.isIdentityVerified) {
    return NextResponse.json({ error: 'Unauthorized or identity not verified.' }, { status: 401 });
  }

  if (!RAUDAH_API_KEY) {
    return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { nin } = body; 

    if (!nin) {
      return NextResponse.json({ error: 'NIN is required.' }, { status: 400 });
    }

    // --- 1. Get Price & Check Wallet ---
    const service = await prisma.service.findUnique({ where: { id: 'NIN_LOOKUP' } });
    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'This service is currently unavailable.' }, { status: 503 });
    }
    const price = user.role === 'AGGREGATOR' ? service.aggregatorPrice : service.agentPrice;
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });

    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: 'Insufficient funds for lookup.' }, { status: 402 });
    }

    // --- 2. Call External API (Raudah) ---
    const response = await axios.post(NIN_VERIFY_ENDPOINT, 
      { 
        value: nin, // Use 'value' as per Raudah docs
        ref: `XPRESSPOINT_NIN_${user.id}_${Date.now()}`
      },
      {
        headers: { 
          'Authorization': RAUDAH_API_KEY, // Use 'Authorization'
          'Content-Type': 'application/json' 
        },
        timeout: 15000,
      }
    );

    const data = response.data;

    // --- 3. Handle Raudah Response ---
    // We'll use the same robust parsing from our BVN API
    if (data.status === false || data.success === false) {
      let errorMessage = data.message && typeof data.message === 'object' ? data.message['0'] : data.message;
      throw new Error(errorMessage || "NIN verification failed.");
    }
    
    // The data payload from Raudah might be in `data.data` or `data.data.data`
    const responseData = data.data?.data || data.data; 

    if (!responseData || responseData.status === 'not_found' || !responseData.firstname) {
      return NextResponse.json({ error: 'Sorry 😢 no record found.' }, { status: 404 });
    }

    // --- 4. Charge User & Save Transaction ---
    const [_, verificationRecord] = await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: price } },
      }),
      prisma.ninVerification.create({
        data: {
          userId: user.id,
          data: responseData, // Save the actual data object
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

    // --- 5. Return Success Data to Frontend ---
    const slipPrices = await prisma.service.findMany({
      where: { id: { in: ['NIN_SLIP_REGULAR', 'NIN_SLIP_STANDARD', 'NIN_SLIP_PREMIUM'] } },
      select: { id: true, agentPrice: true, aggregatorPrice: true }
    });
    
    const getPrice = (id: string) => {
      const s = slipPrices.find(sp => sp.id === id);
      if (!s) return 0;
      return user.role === 'AGGREGATOR' ? s.aggregatorPrice : s.agentPrice;
    };

    return NextResponse.json({
      message: 'Verification Successful',
      verificationId: verificationRecord.id,
      data: responseData,
      slipPrices: {
        Regular: getPrice('NIN_SLIP_REGULAR'),
        Standard: getPrice('NIN_SLIP_STANDARD'),
        Premium: getPrice('NIN_SLIP_PREMIUM'),
      }
    });

  } catch (error: any) {
    console.error(`NIN Lookup (NIN) Error:`, error.message);
    if (error.code === 'ECONNABORTED') {
      return NextResponse.json({ error: 'The verification service timed out. Please try again.' }, { status: 504 });
    }
    return NextResponse.json(
      { error: error.response?.data?.message || error.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
