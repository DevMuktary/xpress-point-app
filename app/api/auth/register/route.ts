import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendOtpMessage } from '@/lib/whatsapp'; 
import { generateUniqueAgentCode } from '@/lib/agentCode';

export async function POST(request: Request) {
  // -------------------------------------------------------------------------
  // ⛔ EMERGENCY LOCK: DISABLE REGISTRATION
  // -------------------------------------------------------------------------
  return NextResponse.json(
    { error: "We are currently working to bring back the registration. Please check back later." }, 
    { status: 503 } // 503 Service Unavailable
  );
  // -------------------------------------------------------------------------

  // ... (The rest of your existing code stays below here, but won't run) ...
  try {
    const body = await request.json();
    // ...
