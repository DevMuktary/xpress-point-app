import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';

// Using the new, stable ConfirmIdent provider
const CONFIRMIDENT_API_KEY = process.env.CONFIRMIDENT_API_KEY;
const PHONE_VERIFY_ENDPOINT = 'https://confirmident.com.ng/api/nin_phone';

if (!CONFIRMIDENT_API_KEY) {
  console.error("CRITICAL: CONFIRMIDENT_API_KEY is not set.");
}

function parseApiError(error: any): string {
  if (error.code === 'ECONNABORTED') {
    return 'The verification service timed out. Please try again.';
  }
  if (error.response && error.response.data) {
    const data = error.response.data;
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
    const { phone } = body; // This is the 11-digit number from your frontend

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
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

    // --- 2. Call External API (ConfirmIdent) ---
    // --- THIS IS THE FIX ---
    // The API expects a 10-digit number, so we strip the leading '0'
    const phoneToSend = phone.startsWith('0') ? phone.substring(1) : phone;

    const response = await axios.post(PHONE_VERIFY_ENDPOINT, 
      { 
        phone: phoneToSend // Key is 'phone' and value is 10-digits
      },
      {
        headers: { 
          'api-key': CONFIRMIDENT_API_KEY, 
          'Content-Type': 'application/json' 
        },
        timeout: 15000,
      }
    );
    // ------------------------
    
    const data = response.data;
    
    // --- 3. Handle ConfirmIdent Response ---
    if (data.success === true && data.data) {
      
      const responseData = data.data;

      // --- 4. "World-Class" Data Mapping (FIXED) ---
      const mappedData = {
        photo: responseData.photo,
        firstname: responseData.firstname, 
        surname: responseData.surname,   
        middlename: responseData.middlename,
        birthdate: responseData.birthdate.replace(/-/g, '-'),
        nin: responseData.NIN,
        trackingId: responseData.trackingId,
        residence_AdressLine1: responseData.residence_AdressLine1,
        birthlga: responseData.birthlga,
        gender: responseData.gender,
        residence_lga: responseData.residence_lga,
        residence_state: responseData.residence_state,
        telephoneno: responseData.telephoneno, 
        birthstate: responseData.birthstate,
        maritalstatus: responseData.maritalstatus,
        profession: responseData.profession,
        religion: responseData.religion,
        signature: responseData.signature,
      };
      // -----------------------------------------------------

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
            description: `NIN Lookup by Phone (${phone})`, // Log the original 11-digit
            reference: data.transaction_id || `NIN-PHONE-${Date.now()}`,
            status: 'COMPLETED',
          },
        }),
      ]);

      // --- 6. Return Success Data to Frontend ---
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
        data: mappedData,
        slipPrices: {
          Regular: getPrice('NIN_SLIP_REGULAR'),
          Standard: getPrice('NIN_SLIP_STANDARD'),
          Premium: getPrice('NIN_SLIP_PREMIUM'),
        }
      });

    } else {
      const errorMessage = data.message || "NIN verification failed.";
      return NextResponse.json({ error: `Sorry 😢 ${errorMessage}` }, { status: 404 });
    }

  } catch (error: any) {
    const errorMessage = parseApiError(error);
    console.error(`NIN Lookup (Phone) Error:`, errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
