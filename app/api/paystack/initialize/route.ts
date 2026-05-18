import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, amount } = await req.json();
    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

    if (!PAYSTACK_SECRET) {
      return NextResponse.json({ error: 'Paystack is not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Paystack expects the amount in Kobo
        // We will send users back to the wallet page after payment
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/fund-wallet`,
      }),
    });

    const data = await response.json();

    if (data.status) {
      return NextResponse.json({ authorization_url: data.data.authorization_url });
    }

    return NextResponse.json({ error: data.message }, { status: 400 });
  } catch (error: any) {
    console.error('Paystack Init Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
