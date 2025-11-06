import { NextResponse } from 'next/server';

/**
 * This file handles two things:
 * 1. GET requests: Used by Meta to *verify* your endpoint.
 * 2. POST requests: Used by Meta to send you *actual messages* (e.g., user replies).
 */

// --- This handles the one-time VERIFICATION from Meta ---
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Get the values Meta sends
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Get our secret token from Railway variables
  const myVerifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  // Check that all values are present AND the token matches
  if (
    mode === 'subscribe' &&
    token === myVerifyToken &&
    challenge
  ) {
    console.log("WhatsApp Webhook VERIFIED!");
    // Send the challenge back to Meta to confirm
    return new NextResponse(challenge, { status: 200 });
  } else {
    // If it fails, deny access
    console.error("WhatsApp Webhook verification failed.");
    return new NextResponse('Verification Failed', { status: 403 });
  }
}

// --- This handles INCOMING MESSAGES from users ---
export async function POST(request: Request) {
  const body = await request.json();

  // Log the incoming message payload
  console.log(JSON.stringify(body, null, 2));

  // TODO: Add logic here later to handle user replies (e.g., "STOP")

  // Meta requires a 200 OK response, or it will think it failed
  return NextResponse.json({ status: 'received' }, { status: 200 });
}
