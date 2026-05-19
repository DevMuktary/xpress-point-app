import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, amount } = await req.json();
    const rawSecret = process.env.PAYSTACK_SECRET_KEY;

    if (!rawSecret) {
      return NextResponse.json({ error: 'Paystack is not configured' }, { status: 500 });
    }

    const authHeader = rawSecret.trim().startsWith('Bearer') 
      ? rawSecret.trim() 
      : `Bearer ${rawSecret.trim()}`;

    // ENFORCE THE LIVE URL: Prevents any localhost fallback issues
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://xpresspoint.net';

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, 
        callback_url: `${baseUrl}/dashboard`,
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
