import { NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';

// Get API credentials
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY; // 'Bearer sk_...'

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
    // --- "World-Class" API Call to Paystack ---
    const response = await axios.get(
      'https://api.paystack.co/bank?country=nigeria&use_cursor=false&perPage=100', // Get all banks
      {
        headers: { 
          'Authorization': PAYSTACK_SECRET_KEY,
        },
        timeout: 10000,
      }
    );

    const data = response.data;

    if (data.status !== true) {
      throw new Error('Failed to fetch bank list from Paystack.');
    }

    // Return the "stunning" list of banks
    return NextResponse.json({ banks: data.data });

  } catch (error: any) {
    console.error("Get Banks Error:", error.message);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
