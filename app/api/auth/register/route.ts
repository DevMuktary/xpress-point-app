import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendOtpSms } from '@/lib/sms';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      password,
      aggregatorId // <-- "World-Class" Refurbish
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
    
    // --- "World-Class" Aggregator Check ---
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
    // ------------------------------------

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
        role: 'AGENT', // All new signups are AGENTs
        aggregatorId: aggregatorId || null, // <-- "World-Class" Refurbish
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

    await sendOtpSms(phone, otpCode);
    
    return NextResponse.json(
      { message: 'Registration successful. OTP sent.' },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Registration Error:', error);
    if (error.code === 'P2002') { // Prisma unique constraint error
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
