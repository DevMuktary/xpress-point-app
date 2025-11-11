import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';

// API credentials
const RAUDAH_API_KEY = process.env.RAUDAH_API_KEY;
const PHONE_VERIFY_ENDPOINT = 'https://raudah.com.ng/api/nin/phone2';

if (!RAUDAH_API_KEY) {
  console.error("CRITICAL: RAUDAH_API_KEY is not set.");
}

// Helper function to parse API errors
function parseApiError(error: any): string {
  if (error.code === 'ECONNABORTED') {
    return 'The verification service timed out. Please try again.';
  }
  if (error.response && error.response.data) {
    const data = error.response.data;
    if (data.message && data.response_code === "01") {
      return `Sorry 😢 ${data.message}`;
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
    const { phone } = body; 

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

    // --- 2. Call External API (Raudah) ---
    let data: any;
    try {
      const response = await axios.post(PHONE_VERIFY_ENDPOINT, 
        { 
          value: phone,
          ref: `XPRESSPOINT_PHN_${user.id}_${Date.now()}`
        },
        {
          headers: { 
            'Authorization': RAUDAH_API_KEY,
            'Content-Type': 'application/json' 
          },
          timeout: 15000,
        }
      );
      data = response.data;
    } catch (error: any) {
      if (error.response && error.response.data && (error.response.data.success === true || error.response.data.status === true)) {
        console.log("Raudah Phone API (Warning): Treating error-status payload as success.");
        data = error.response.data;
      } else {
        throw error; // This is a real network/auth error
      }
    }
    
    // --- 3. Handle Raudah Response (Based on your new log) ---
    if (data.success === true && data.statusCode === 200 && data.data) {
      // This is a SUCCESS
      
      const responseData = data.data; // This is the correct data path
      
      // --- 4. "World-Class" Data Mapping (Fixing field names) ---
      // We map their API names to our standard `NinData` names
      const mappedData = {
        photo: responseData.image,
        firstname: responseData.firstName,
        surname: responseData.lastName,
        middlename: responseData.middleName,
        birthdate: responseData.dateOfBirth, // This is YYYY-MM-DD
        nin: responseData.nin || responseData.idNumber, // Use 'idNumber' if 'nin' is null
        trackingId: 'N/A', // Not provided by this endpoint
        residence_AdressLine1: responseData.addressLine,
        birthlga: 'N/A', // Not provided
        gender: responseData.gender,
        residence_lga: responseData.lga,
        residence_state: responseData.state,
        telephoneno: responseData.mobile,
        birthstate: 'N/A', // Not provided
        maritalstatus: 'N/A', // Not provided
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
            data: mappedData as any, // Save the *mapped* data
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            serviceId: service.id,
            type: 'SERVICE_CHARGE',
            amount: price.negated(),
            description: `NIN Lookup by Phone (${phone})`,
            reference: `NIN-PHONE-${Date.now()}`,
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
        data: mappedData, // <-- Send the mapped data
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
    console.error(`NIN Lookup (Phone) Error:`, errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
