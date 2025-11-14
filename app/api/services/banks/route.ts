import { NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
  console.error("CRITICAL: PAYSTACK_SECRET_KEY is not set.");
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
    const response = await axios.get(
      'https://api.paystack.co/bank?country=nigeria&use_cursor=false&perPage=100',
      {
        headers: { 'Authorization': PAYSTACK_SECRET_KEY },
        timeout: 10000,
      }
    );
    if (response.data.status !== true) {
      throw new Error('Failed to fetch bank list from Paystack.');
    }
    return NextResponse.json({ banks: response.data.data });

  } catch (error: any) {
    console.error("Get Banks Error:", error.message);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
