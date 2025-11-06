import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendWhatsAppMessage } from '@/lib/whatsapp'; // <-- Import our new function

/**
 * Generates a 6-digit numeric OTP.
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      businessName,
      address,
      email,
      phoneNumber,
      password,
    } = body;

    // --- Validation ---
    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // --- Check for existing user ---
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 }
      );
    }

    const existingUserByPhone = await prisma.user.findUnique({
      where: { phoneNumber },
    });
    if (existingUserByPhone) {
      return NextResponse.json(
        { error: 'Phone number already in use' },
        { status: 409 }
      );
    }

    // --- Hash Password ---
    const passwordHash = await bcrypt.hash(password, 10);

    // --- Create User in Database ---
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        businessName,
        address,
        email: email.toLowerCase(),
        phoneNumber,
        passwordHash,
      },
      select: {
        id: true,
        phoneNumber: true,
      },
    });

    // --- NEW: Generate and Send WhatsApp OTP ---
    const otpCode = generateOTP();
    const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    // 1. Save the OTP to our new 'otps' table
    await prisma.otp.create({
      data: {
        code: otpCode,
        userId: user.id,
        expiresAt: tenMinutesFromNow,
      },
    });

    // 2. Send the OTP via WhatsApp
    // IMPORTANT: You must create a template in your Meta account named 'otp_verification'
    // This template should look like: "Your Xpress Point verification code is {{1}}."
    await sendWhatsAppMessage(user.phoneNumber, 'otp_verification', otpCode);
    
    // ------------------------------------------

    return NextResponse.json(
      { message: 'User registered successfully. OTP sent.', userId: user.id },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
