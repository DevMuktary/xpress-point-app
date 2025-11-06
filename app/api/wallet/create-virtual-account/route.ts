import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';

// API credentials from your blueprint
const PAYVESSEL_API_KEY = process.env.PAYVESSEL_API_KEY;
const PAYVESSEL_API_SECRET = process.env.PAYVESSEL_API_SECRET;
const PAYVESSEL_BUSINESS_ID = process.env.PAYVESSEL_BUSINESS_ID;
const PAYVESSEL_ENDPOINT = 'https://api.payvessel.com/pms/api/external/request/customerReservedAccount/';

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
      phoneNumber: user.phoneNumber,
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
      throw new Error('Failed to create virtual accounts from provider.');
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
      { status: 500 }
    );
  }
}
