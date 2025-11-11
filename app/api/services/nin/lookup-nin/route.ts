import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';

// --- THIS IS THE FIX (Part 1) ---
// Using the 'nin-search3' endpoint from your new documentation
const WORKBYTE_API_TOKEN = process.env.WORKBYTE_API_TOKEN;
const NIN_VERIFY_ENDPOINT = 'https://workbyte.com.ng/api/nin-search3/'; // <-- Corrected

if (!WORKBYTE_API_TOKEN) {
  console.error("CRITICAL: WORKBYTE_API_TOKEN is not set.");
}

// Helper to parse Workbyte's various error messages
function parseApiError(error: any): string {
  if (error.code === 'ECONNABORTED') {
    return 'The verification service timed out. Please try again.';
  }
  if (error.response && error.response.data) {
    const data = error.response.data;
    // Handle specific codes from your doc
    if (data.code === 401) return "Access denied: API key is invalid.";
    if (data.code === 403) return "Permission denied. Please contact support.";
    if (data.code === 402) return "Insufficient balance with API provider.";
    // Handle general messages
    if (data.message && typeof data.message === 'string') {
      return data.message;
    }
    if (data.detail && typeof data.detail === 'string') {
      return data.detail; // Sometimes they use 'detail'
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

  if (!WORKBYTE_API_TOKEN) {
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

    // --- 2. Call External API (Workbyte) ---
    const response = await axios.post(NIN_VERIFY_ENDPOINT, 
      { nin: nin },
      {
        headers: { 
          'Authorization': WORKBYTE_API_TOKEN,
          'Content-Type': 'application/json' 
        },
        timeout: 15000,
      }
    );

    const data = response.data;
    
    // --- 3. Handle Workbyte Response (Based on your new docs) ---
    // This is the "world-class" stable structure: data.data
    if (data.status === true && data.code === 200 && data.data?.status === 'found' && data.data?.data) {
      
      const responseData = data.data.data; // This is the correct data path
      
      // --- 4. "World-Class" Data Mapping (Fixes apostrophe bug) ---
      const mappedData = {
        photo: responseData.image.replace('data:image/jpg;base64,', ''), // Clean base64
        firstname: responseData.firstName,
        surname: responseData.lastName,
        middlename: responseData.middleName,
        birthdate: responseData.dateOfBirth.replace(/-/g, '-'), // API sends 1-1-2000, we'll keep it
        nin: responseData.nin,
        trackingId: responseData.trackingId,
        residence_AdressLine1: responseData.address?.addressLine, // Safe access
        birthlga: responseData.birthlga,
        gender: responseData.gender,
        residence_lga: responseData.address?.lga, // Safe access
        residence_state: responseData.address?.state, // Safe access
        telephoneno: responseData.mobile,
        birthstate: responseData.birthstate,
        maritalstatus: responseData.maritalstatus,
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
            description: `NIN Verification Lookup (${nin})`,
            reference: data.transaction_id || `NIN-LOOKUP-${Date.now()}`,
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
        data: mappedData, // Send our clean, mapped data
        slipPrices: {
          Regular: getPrice('NIN_SLIP_REGULAR'),
          Standard: getPrice('NIN_SLIP_STANDARD'),
          Premium: getPrice('NIN_SLIP_PREMIUM'),
        }
      });
      
    } else {
      // This is a "No record found" or other known error
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
