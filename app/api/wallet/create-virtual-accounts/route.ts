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
    // 3. Check if user already has accounts
    const existingAccounts = await prisma.virtualAccount.count({
      where: { userId: user.id }
    });

    if (existingAccounts > 0) {
      console.log("[DEBUG] User already has virtual accounts. Aborting.");
      return NextResponse.json({ error: 'Virtual accounts already generated.' }, { status: 409 });
    }

    // 4. Call Payment Point API
    const payload = {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      phoneNumber: formatPhone(user.phoneNumber),
      bankCode: ["20946", "20897"], // Palmpay, OPay
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
          'Authorization': API_SECRET, // This includes "Bearer"
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data;
    console.log("--- [DEBUG] Received from Payment Point ---", JSON.stringify(data));

    if (data.status !== 'success' || !data.bankAccounts || data.bankAccounts.length === 0) {
      throw new Error(data.message || 'Failed to create virtual accounts.');
    }

    // 5. Save Accounts to Database
    const accountData = data.bankAccounts.map((bank: any) => ({
      userId: user.id,
      bankName: bank.bankName,
      accountNumber: bank.accountNumber,
      accountName: bank.accountName,
      accountType: bank.account_type || "STATIC",
      reference: bank.Reserved_Account_Id || bank.accountNumber, // Use Reserved_Account_Id
    }));

    await prisma.virtualAccount.createMany({
      data: accountData,
    });
    console.log("[DEBUG] Virtual accounts saved.");

    // 6. Send Success Response
    return NextResponse.json({ 
      message: "Virtual accounts created successfully!",
      banks: data.bankAccounts 
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
