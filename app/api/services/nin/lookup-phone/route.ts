import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';

// --- CONFIGURATION ---
const API_KEY = process.env.ROBOST_API_KEY || "dd1cd7d9e00b3565cbf8410f4662226d93f71daf18b904811cd98dcfd4296868";
const PHONE_VERIFY_ENDPOINT = 'https://robosttech.com/api/nin_phone';

if (!API_KEY) {
  console.error("CRITICAL: ROBOST_API_KEY is not set.");
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
    
    const price = new Decimal(service.defaultAgentPrice);
    
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: 'Insufficient funds for lookup.' }, { status: 402 });
    }

    // --- 2. Call RobostTech API ---
    // Ensure phone format is correct (usually 080...)
    
    const response = await axios.post(PHONE_VERIFY_ENDPOINT, 
      { 
        phone: phone 
      },
      {
        headers: { 
          'api-key': API_KEY, 
          'Content-Type': 'application/json' 
        },
        timeout: 60000,
      }
    );
    
    const apiRes = response.data;
    console.log("ROBOST PHONE RAW RESPONSE:", JSON.stringify(apiRes, null, 2));
    
    // --- 3. Handle Response ---
    if (apiRes.success && apiRes.data) {
      
      const responseData = apiRes.data;

      // --- 4. Data Mapping ---
      const mappedData = {
        photo: responseData.photo || "",
        firstname: responseData.firstname, 
        surname: responseData.surname,   
        middlename: responseData.middlename || "",
        birthdate: responseData.birthdate,
        nin: responseData.nin,
        trackingId: responseData.tracking_id || `TRK-${Date.now()}`,
        
        residence_AdressLine1: responseData.residence_AdressLine1 || responseData.residence_Town,
        residence_lga: responseData.residence_lga,
        residence_state: responseData.residence_state,
        
        telephoneno: responseData.telephoneno, 
        
        birthlga: responseData.birthLGA, // Note casing from example
        birthstate: responseData.birthState,
        
        gender: responseData.gender,
        maritalstatus: responseData.maritalstatus, // Example might not have it, safe to be undefined
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
            description: `NIN Lookup by Phone (${phone})`,
            reference: `NIN-PHONE-${Date.now()}`,
            status: 'COMPLETED',
          },
        }),
      ]);

      // --- 6. Return Success Data to Frontend ---
      const slipPrices = await prisma.service.findMany({
        where: { id: { in: ['NIN_SLIP_REGULAR', 'NIN_SLIP_STANDARD', 'NIN_SLIP_PREMIUM'] } },
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

    } else {
      const errorMessage = apiRes.message || "NIN verification failed.";
      return NextResponse.json({ error: `${errorMessage}` }, { status: 404 });
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
