import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';

// Get API credentials
const RAUDAH_API_KEY = process.env.RAUDAH_API_KEY;
const SUBMIT_ENDPOINT = 'https://raudah.com.ng/api/nin/instantvalidation';
const REFUND_CODES = ["404", "405", "406", "407", "409"];

if (!RAUDAH_API_KEY) {
  console.error("CRITICAL: RAUDAH_API_KEY is not set.");
}

function parseApiError(error: any): string {
  if (error.code === 'ECONNABORTED') {
    return 'The service timed out. Please try again.';
  }
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An internal server error occurred.';
}

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user || !user.isIdentityVerified) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (!RAUDAH_API_KEY) {
    return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { nin, scode } = body; 

    if (!nin || !scode) {
      return NextResponse.json({ error: 'NIN and Reason Code (scode) are required.' }, { status: 400 });
    }
    
    const serviceId = `NIN_VALIDATION_${scode}`;

    // --- 1. Get Service & Price (Standardized) ---
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'This service is currently unavailable.' }, { status: 503 });
    }
    
    // PRICE FIX: Use Default Agent Price for everyone
    const price = new Decimal(service.defaultAgentPrice);

    // Check Wallet
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: `Insufficient funds. This service costs ₦${price}.` }, { status: 402 });
    }

    // --- 2. Check for Duplicates ---
    const existingRequest = await prisma.validationRequest.findFirst({
      where: { userId: user.id, nin: nin, scode: scode }
    });
    if (existingRequest && existingRequest.status !== 'FAILED') {
      return NextResponse.json({ error: 'You have already submitted this validation request.' }, { status: 409 });
    }

    // --- 3. Calculate Commission (Prep) ---
    // We calculate this now, but only pay it if the API call succeeds later.
    let commissionAmount = new Decimal(0);
    let aggregatorWalletId = null;

    if (user.role === 'AGENT' && user.aggregatorId) {
      const aggregatorPrice = await prisma.aggregatorPrice.findUnique({
        where: {
          aggregatorId_serviceId: {
            aggregatorId: user.aggregatorId,
            serviceId: serviceId
          }
        }
      });

      if (aggregatorPrice) {
        commissionAmount = new Decimal(aggregatorPrice.commission);
        aggregatorWalletId = user.aggregatorId;
      }
    }

    // --- 4. Call External API (Raudah) ---
    // API Call happens BEFORE charging to support Auto-Refund logic safely
    const response = await axios.post(SUBMIT_ENDPOINT, 
      { 
        nin: nin,
        scode: scode,
        ref: `XPRESSPOINT_VAL_${user.id}_${Date.now()}`
      },
      {
        headers: { 
          'Authorization': RAUDAH_API_KEY,
          'Content-Type': 'application/json' 
        },
        timeout: 15000,
      }
    );

    const data = response.data;
    
    // --- 5. Auto-Refund Logic ---
    if (data.response_code && REFUND_CODES.includes(data.response_code)) {
      console.log(`NIN Validation Auto-Refund: ${data.message}`);
      return NextResponse.json({ error: `Sorry 😞 ${data.message}` }, { status: 400 });
    }
    
    if (data.response_code !== "00" || data.transactionStatus !== "SUCCESSFUL") {
      throw new Error(data.message || "Submission failed. Please check the NIN and Reason.");
    }

    // --- 6. Execute Transaction ---
    const priceAsString = price.toString();
    const commissionAsString = commissionAmount.toString();

    await prisma.$transaction(async (tx) => {
      // a) Charge User Wallet
      await tx.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: priceAsString } },
      });

      // b) Credit Aggregator (The new logic)
      if (aggregatorWalletId && commissionAmount.greaterThan(0)) {
        await tx.wallet.update({
          where: { userId: aggregatorWalletId },
          data: { commissionBalance: { increment: commissionAsString } }
        });
      }

      // c) Upsert Request
      await tx.validationRequest.upsert({
        where: {
          userId_nin_scode: {
            userId: user.id,
            nin: nin,
            scode: scode
          }
        },
        update: {
          status: 'PROCESSING',
          statusMessage: 'Submitted. Awaiting completion.'
        },
        create: {
          userId: user.id,
          nin: nin,
          scode: scode,
          status: 'PROCESSING',
          statusMessage: 'Submitted. Awaiting completion.'
        },
      });

      // d) Log Transaction
      await tx.transaction.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          type: 'SERVICE_CHARGE',
          amount: price.negated(),
          description: `NIN Validation (${nin} - ${scode})`,
          reference: data.transactionReference || `NIN-VAL-${Date.now()}`,
          status: 'COMPLETED',
        },
      });
    });

    return NextResponse.json(
      { message: 'Request submitted successfully! You can check the status shortly.' },
      { status: 200 }
    );

  } catch (error: any) {
    const errorMessage = parseApiError(error);
    console.error(`NIN Validation (Submit) Error:`, errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
