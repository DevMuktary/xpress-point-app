import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';

// --- CONFIGURATION ---
const BASE_URL = process.env.ZEPA_API_BASE_URL; 
const API_TOKEN = process.env.ZEPA_API_TOKEN;

// --- HELPER: Error Parser ---
function parseApiError(error: any): string {
  if (error.response) {
    console.error("--- [ZEPA API ERROR] ---");
    console.error("Status:", error.response.status);
    console.error("Body:", JSON.stringify(error.response.data, null, 2));
    const data = error.response.data;
    if (data.message) return typeof data.message === 'string' ? data.message : JSON.stringify(data.message);
    if (data.error) return data.error;
  }
  return error.message || 'An internal server error occurred.';
}

// --- HELPER: Format Date to DD-MM-YYYY ---
function formatDateToDMY(dateString: string) {
  // Input comes as YYYY-MM-DD from HTML input
  if (!dateString) return "";
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`; // Zepa likely wants DD-MM-YYYY
}

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user || !user.isIdentityVerified) {
    return NextResponse.json({ error: 'Unauthorized or identity not verified.' }, { status: 401 });
  }

  if (!BASE_URL || !API_TOKEN) {
    return NextResponse.json({ error: 'Service configuration error (Missing Zepa Creds).' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { firstname, lastname, middlename, gender, dateOfBirth } = body; 

    // Validate Input
    if (!firstname || !lastname || !gender || !dateOfBirth) {
      return NextResponse.json({ error: 'First Name, Last Name, Gender and DOB are required.' }, { status: 400 });
    }

    // --- 1. Get Service & Check Wallet ---
    const service = await prisma.service.findUnique({ where: { id: 'NIN_LOOKUP' } });
    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'This service is currently unavailable.' }, { status: 503 });
    }
    
    const price = new Decimal(service.defaultAgentPrice);
    
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: 'Insufficient funds for lookup.' }, { status: 402 });
    }

    // --- 2. Prepare Payload for Zepa ---
    // Format Date: YYYY-MM-DD -> DD-MM-YYYY
    const formattedDob = formatDateToDMY(dateOfBirth);
    
    // Normalize Gender: "female" -> "F", "male" -> "M" (Standard for many APIs)
    // If Zepa fails with M/F, we can revert to "Male"/"Female"
    // const formattedGender = gender.toLowerCase().startsWith('f') ? 'F' : 'M';
    
    // Actually, let's stick to the raw 'male'/'female' first, but Uppercase the names
    // If 422 persists, we will try the 'F'/'M' switch.
    
    const payload = {
        firstName: firstname.toUpperCase(),
        lastName: lastname.toUpperCase(),
        dob: formattedDob, // Sending 24-08-1989
        gender: gender.toLowerCase() // 'male' or 'female'
    };

    console.log(`[ZEPA] Verifying Demographic for user ${user.id}`, payload);

    // --- 3. Call Zepa API ---
    const response = await axios.post(
      `${BASE_URL}/api/v1/verify-demo`,
      payload,
      {
        headers: { 
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 60000, 
      }
    );

    const apiRes = response.data;
    console.log("ZEPA RESPONSE RAW:", JSON.stringify(apiRes, null, 2));

    // --- 4. Validate Response ---
    // Note: Some APIs return success:false but give 200 OK. 
    // We check both the status and the body flag if it exists.
    if (!apiRes) {
        throw new Error("Empty response from provider.");
    }

    // --- 5. Data Mapping ---
    // Handle cases where data might be nested in 'data' or at root
    const responseData = apiRes.data || apiRes;

    const mappedData = {
      // Essential Fields (Check logs for exact keys)
      photo: responseData.photo || responseData.image || "", 
      firstname: responseData.firstname || responseData.firstName,
      surname: responseData.surname || responseData.lastName,
      middlename: responseData.middlename || responseData.middleName || "",
      nin: responseData.nin || responseData.idNumber || responseData.id_number,
      
      // Meta
      trackingId: responseData.trackingId || `TRK-${Date.now()}`,
      birthdate: responseData.birthdate || responseData.dob,
      telephoneno: responseData.telephoneno || responseData.phone || responseData.mobile,
      gender: responseData.gender,
      
      // Address
      residence_AdressLine1: responseData.residence_AdressLine1 || responseData.address || responseData.residenceAddress,
      residence_lga: responseData.residence_lga || responseData.lga,
      residence_state: responseData.residence_state || responseData.state,
      
      // Store full raw data for debug
      ...responseData
    };

    if (!mappedData.nin) {
        // If success but no NIN, maybe it didn't find a match?
        console.error("Success response but NO NIN found in data:", responseData);
        throw new Error("No matching NIN record found for these details.");
    }

    // --- 6. Charge User & Save ---
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
          description: `NIN Demographic Lookup (${firstname} ${lastname})`,
          reference: `NIN-DEMO-${Date.now()}`,
          status: 'COMPLETED',
        },
      }),
    ]);

    // --- 7. Return Data ---
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
