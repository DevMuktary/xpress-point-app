import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';

// Get API credentials
const ROBOSTTECH_API_KEY = process.env.ROBOSTTECH_API_KEY;
const NIN_VERIFY_ENDPOINT = 'https://robosttech.com/api/nin_verify';
const PHONE_VERIFY_ENDPOINT = 'https://robosttech.com/api/nin_phone';

if (!ROBOSTTECH_API_KEY) {
  console.error("CRITICAL: ROBOSTTECH_API_KEY is not set.");
}

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user || !user.isIdentityVerified) {
    return NextResponse.json({ error: 'Unauthorized or identity not verified.' }, { status: 401 });
  }

  if (!ROBOSTTECH_API_KEY) {
    return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { type, value } = body; 

    if (!type || !value) {
      return NextResponse.json({ error: 'Type and value are required.' }, { status: 400 });
    }

    // --- 1. GET PRICE FROM DATABASE ---
    const service = await prisma.service.findUnique({
      where: { id: 'NIN_LOOKUP' },
    });

    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'This service is currently unavailable.' }, { status: 503 });
    }

    // Get the correct price based on the user's role
    const price = user.role === 'AGGREGATOR' ? service.aggregatorPrice : service.agentPrice;

    // --- 2. Check User Wallet ---
    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
    });

    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: 'Insufficient funds for lookup.' }, { status: 402 });
    }

    // --- 3. Call External API ---
    const endpoint = type === 'NIN' ? NIN_VERIFY_ENDPOINT : PHONE_VERIFY_ENDPOINT;
    const payload = type === 'NIN' ? { nin: value } : { phone: value };

    const response = await axios.post(endpoint, payload, {
      headers: {
        'api-key': ROBOSTTECH_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const data = response.data;

    if (data.success === false || (data.data && data.data.status === 'not_found')) {
      return NextResponse.json({ error: data.message || 'No match found.' }, { status: 404 });
    }

    // --- 4. Charge User & Save Transaction ---
    const [updatedWallet, verificationRecord] = await prisma.$transaction([
      // a) Deduct from wallet
      prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: price } },
      }),
      // b) Save the lookup data for 24 hours
      prisma.ninVerification.create({
        data: {
          userId: user.id,
          data: data.data,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      }),
      // c) Log the transaction
      prisma.transaction.create({
        data: {
          userId: user.id,
          serviceId: service.id, // <-- Link the transaction to the service
          type: 'SERVICE_CHARGE',
          amount: price.negated(), // Charge the dynamic price
          description: `NIN Verification Lookup (${value})`,
          reference: `NIN-LOOKUP-${Date.now()}`,
          status: 'COMPLETED',
        },
      }),
    ]);

    // --- 5. Return Success Data to Frontend ---
    return NextResponse.json({
      message: 'Verification Successful',
      verificationId: verificationRecord.id,
      data: data.data,
      // Send the prices for the next step to the frontend
      slipPrices: {
        regular: (await prisma.service.findUnique({ where: { id: 'NIN_SLIP_REGULAR' } }))?.agentPrice,
        standard: (await prisma.service.findUnique({ where: { id: 'NIN_SLIP_STANDARD' } }))?.agentPrice,
        premium: (await prisma.service.findUnique({ where: { id: 'NIN_SLIP_PREMIUM' } }))?.agentPrice,
      }
    });

  } catch (error: any) {
    console.error("NIN Lookup Error:", error.response ? error.response.data : error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || error.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
