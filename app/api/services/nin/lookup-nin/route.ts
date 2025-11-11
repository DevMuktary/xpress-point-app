import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';

// API credentials
const RAUDAH_API_KEY = process.env.RAUDAH_API_KEY;
const NIN_VERIFY_ENDPOINT = 'https://raudah.com.ng/api/nin/v3';

if (!RAUDAH_API_KEY) {
  console.error("CRITICAL: RAUDAH_API_KEY is not set.");
}

function parseApiError(error: any): string {
  if (error.code === 'ECONNABORTED') {
    return 'The verification service timed out. Please try again.';
  }
  if (error.response && error.response.data) {
    const data = error.response.data;
    if (data.message && data.response_code === "01") {
      return `Sorry 😢 ${data.message}`; // "Record not found..."
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

  if (!RAUDAH_API_KEY) {
    return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { nin } = body; 

    if (!nin) {
      return NextResponse.json({ error: 'NIN is required.' }, { status: 400 });
    }

    const service = await prisma.service.findUnique({ where: { id: 'NIN_LOOKUP' } });
    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'This service is currently unavailable.' }, { status: 503 });
    }
    const price = user.role === 'AGGREGATOR' ? service.aggregatorPrice : service.agentPrice;
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });

    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: 'Insufficient funds for lookup.' }, { status: 402 });
    }

    // --- 1. Call External API (Raudah) ---
    let data: any;
    try {
      const response = await axios.post(NIN_VERIFY_ENDPOINT, 
        { value: nin, ref: `XPRESSPOINT_NIN_${user.id}_${Date.now()}` },
        {
          headers: { 'Authorization': RAUDAH_API_KEY, 'Content-Type': 'application/json' },
          timeout: 15000,
        }
      );
      data = response.data; // This is the "happy path"
    } catch (error: any) {
      // This is the "buggy success" path
      if (error.response && error.response.data && error.response.data.status === true) {
        console.log("Raudah NIN API (Warning): Treating error-status payload as success.");
        data = error.response.data;
      } else {
        // This is a *real* error
        throw error;
      }
    }

    // --- 2. Handle Raudah Response (Based on your logs) ---
    if (data.status === true && data.response_code === "00" && data.nin_data) {
      
      const responseData = data.nin_data; // This is the correct data path

      // --- 3. Charge User & Save Transaction ---
      const [_, verificationRecord] = await prisma.$transaction([
        prisma.wallet.update({
          where: { userId: user.id },
          data: { balance: { decrement: price } },
        }),
        prisma.ninVerification.create({
          data: {
            userId: user.id,
            data: responseData, // Save the nin_data object
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

      // --- 4. Return Success Data to Frontend ---
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
      
    } else {
      // This is a "Record not found" or other known error
      const errorMessage = data.message || "NIN verification failed.";
      return NextResponse.json({ error: `Sorry 😢 ${errorMessage}` }, { status: 404 });
    }

  } catch (error: any) {
    const errorMessage = parseApiError(error);
    console.error(`NIN Lookup (NIN) Error:`, errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
