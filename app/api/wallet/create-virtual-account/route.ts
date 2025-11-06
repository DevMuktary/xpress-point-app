import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';

// API credentials from your blueprint
const PAYVESSEL_API_KEY = process.env.PAYVESSEL_API_KEY;
const PAYVESSEL_API_SECRET = process.env.PAYVESSEL_API_SECRET;
const PAYVESSEL_BUSINESS_ID = process.env.PAYVESSEL_BUSINESS_ID;
const PAYVESSEL_ENDPOINT = 'https://api.payvessel.com/pms/api/external/request/customerReservedAccount/';

/**
 * --- THIS IS THE FIX ---
 * Converts a '+234...' number to an '0...' number.
 * e.g., "+2348012345678" -> "08012345678"
 */
function formatPhoneForPayvessel(internationalPhone: string): string {
  if (internationalPhone.startsWith('+234')) {
    return '0' + internationalPhone.substring(4);
  }
  return internationalPhone; // Fallback
}

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user || !user.isIdentityVerified) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { nin } = body; // The verified NIN

    if (!nin) {
      return NextResponse.json({ error: 'NIN is required' }, { status: 400 });
    }
    if (!user.bvn || !user.email || !user.phoneNumber) {
      return NextResponse.json({ error: 'User profile is incomplete' }, { status: 400 });
    }

    // --- 1. Call Payvessel API ---
    const payload = {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      // --- THIS IS THE FIX ---
      phoneNumber: formatPhoneForPayvessel(user.phoneNumber), // Use the formatted number
      bankcode: ["999991", "120001"], // PalmPay, 9Payment
      account_type: "STATIC",
      businessid: PAYVESSEL_BUSINESS_ID,
      bvn: user.bvn,
      nin: nin,
    };

    const response = await axios.post(
      PAYVESSEL_ENDPOINT,
      payload,
      {
        headers: {
          'api-key': PAYVESSEL_API_KEY,
          'api-secret': `Bearer ${PAYVESSEL_API_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data;

    if (!data.status || !data.banks || data.banks.length === 0) {
      // This will catch any errors from Payvessel
      throw new Error(data.message || 'Failed to create virtual accounts from provider.');
    }

    // --- 2. Save Accounts to Database ---
    const accountData = data.banks.map((bank: any) => ({
      userId: user.id,
      bankName: bank.bankName,
      accountNumber: bank.accountNumber,
      accountName: bank.accountName,
      accountType: bank.account_type,
      reference: bank.trackingReference,
    }));

    await prisma.virtualAccount.createMany({
      data: accountData,
    });

    return NextResponse.json({ banks: data.banks }, { status: 200 });

  } catch (error: any) {
    console.error('Create Account Error:', error.response ? error.response.data : error.message);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      // Send a 400 (Bad Request) so the frontend can display the error
      { status: 400 }
    );
  }
}
