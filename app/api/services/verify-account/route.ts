import { NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';
import { URL } from 'url';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
  console.error("CRITICAL: PAYSTACK_SECRET_KEY is not set.");
}

function parsePaystackError(error: any): string {
  if (error.code === 'ECONNABORTED') return 'The verification service timed out.';
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  return 'An internal server error occurred.';
}

export async function GET(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  if (!PAYSTACK_SECRET_KEY) {
    return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
  }

  try {
    const url = new URL(request.url);
    const accountNumber = url.searchParams.get('account_number');
    const bankCode = url.searchParams.get('bank_code');

    if (!accountNumber || !bankCode) {
      return NextResponse.json({ error: 'Account Number and Bank Code are required.' }, { status: 400 });
    }

    const response = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: { 'Authorization': PAYSTACK_SECRET_KEY },
        timeout: 10000,
      }
    );

    const data = response.data;
    if (data.status !== true) {
      throw new Error(data.message || 'Could not resolve account.');
    }

    return NextResponse.json({ 
      message: 'Account resolved successfully',
      accountName: data.data.account_name 
    });

  } catch (error: any) {
    const errorMessage = parsePaystackError(error);
    console.error("Verify Account Error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
