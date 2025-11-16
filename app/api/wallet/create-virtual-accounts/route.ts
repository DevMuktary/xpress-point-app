import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';

// --- Payment Point Credentials ---
const API_KEY = process.env.PAYMENTPOINT_API_KEY;
const API_SECRET = process.env.PAYMENTPOINT_API_SECRET; // This is the "Bearer" token
const BUSINESS_ID = process.env.PAYMENTPOINT_BUSINESS_ID;
const ENDPOINT = 'https://api.paymentpoint.co/api/v1/createVirtualAccount';

if (!API_KEY || !API_SECRET || !BUSINESS_ID) {
  console.error("CRITICAL: Missing one or more Payment Point API keys.");
}

function formatPhone(internationalPhone: string): string {
  if (internationalPhone.startsWith('+234')) {
    return '0' + internationalPhone.substring(4);
  }
  return internationalPhone;
}

export async function POST(request: Request) {
  console.log("\n--- [DEBUG] NEW VIRTUAL ACCOUNT REQUEST ---");
  
  // 1. Get User
  const user = await getUserFromSession();
  if (!user || !user.isIdentityVerified) {
    console.error("[DEBUG] Auth check failed. User is not identity verified.");
    return NextResponse.json({ error: 'Unauthorized. Please verify your identity first.' }, { status: 401 });
  }

  // 2. Check for missing API keys
  if (!API_KEY || !API_SECRET || !BUSINESS_ID) {
    return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
  }

  try {
    // --- THIS IS THE FIX (Part 1) ---
    // We now get the *specific* bankCode from the client
    const body = await request.json();
    const { bankCode } = body; // e.g., "20946"

    if (!bankCode) {
      return NextResponse.json({ error: 'Bank Code is required.' }, { status: 400 });
    }
    // ---------------------------------

    // 3. Call Payment Point API
    const payload = {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      phoneNumber: formatPhone(user.phoneNumber),
      bankCode: [bankCode], // <-- Pass only the single bank code
      account_type: "STATIC",
      businessId: BUSINESS_ID,
      bvn: user.bvn, // This is the NIN we saved in the BVN field
      nin: user.nin,
    };
    
    console.log("--- [DEBUG] Sending to Payment Point ---");
    console.log("Payload:", JSON.stringify(payload));

    const response = await axios.post(
      ENDPOINT,
      payload,
      {
        headers: {
          'api-key': API_KEY,
          'Authorization': API_SECRET,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data;
    console.log("--- [DEBUG] Received from Payment Point ---", JSON.stringify(data));

    if (data.status !== 'success' || !data.bankAccounts || data.bankAccounts.length === 0) {
      throw new Error(data.message || 'Failed to create virtual account.');
    }

    // 4. Save the *single* new account
    const newAccount = data.bankAccounts[0];
    const accountData = {
      userId: user.id,
      bankName: newAccount.bankName,
      accountNumber: newAccount.accountNumber,
      accountName: newAccount.accountName,
      accountType: newAccount.account_type || "STATIC",
      reference: newAccount.Reserved_Account_Id || newAccount.accountNumber,
    };

    await prisma.virtualAccount.create({
      data: accountData,
    });
    console.log("[DEBUG] Virtual account saved.");

    // 5. Send Success Response
    return NextResponse.json({ 
      message: "Virtual account created successfully!",
      bank: accountData 
    }, { status: 200 });

  } catch (error: any) {
    console.error('--- [DEBUG] FINAL CATCH BLOCK (CREATE ACCOUNTS) ---');
    console.error('Create Virtual Account Error:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || error.message || 'An internal server error occurred.' },
      { status: 400 } 
    );
  }
}
