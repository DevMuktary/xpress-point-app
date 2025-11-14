import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// --- THIS IS THE "WORLD-CLASS" FIX (Part 1) ---
// We import from your "stunning" whatsapp.ts file, not the "rubbish" sms.ts
import { sendOtpMessage } from '@/lib/whatsapp'; 
// ---------------------------------------------

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      password,
      aggregatorId 
    } = body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'All fields are required' }, { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' }, { status: 400 }
      );
    }

    // 1. Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { phoneNumber: phone }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email or phone number already exists.' },
        { status: 409 } // 409 Conflict
      );
    }
    
    if (aggregatorId) {
      const aggregatorExists = await prisma.user.findFirst({
        where: { id: aggregatorId, role: 'AGGREGATOR' }
      });
      if (!aggregatorExists) {
        return NextResponse.json(
          { error: 'Invalid referral link. Aggregator not found.' }, { status: 400 }
        );
      }
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        phoneNumber: phone,
        passwordHash,
        role: 'AGENT',
        aggregatorId: aggregatorId || null,
      }
    });
    
    // 4. Create and send OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otp.create({
      data: {
        code: otpCode,
        userId: user.id,
        expiresAt: expiresAt,
      },
    });

    // --- THIS IS THE "WORLD-CLASS" FIX (Part 2) ---
    // We call your "stunning" WhatsApp function
    await sendOtpMessage(phone, otpCode);
    // ---------------------------------------------
    
    return NextResponse.json(
      { message: 'Registration successful. OTP sent.' },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Registration Error:', error);
    if (error.code === 'P2002') { 
      return NextResponse.json(
        { error: 'An account with this email or phone number already exists.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
