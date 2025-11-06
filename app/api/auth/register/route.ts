import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Our Prisma client
import bcrypt from 'bcryptjs';

// We'll create this file next - it's a placeholder for the WhatsApp API
// import { sendWhatsAppOTP } from '@/lib/whatsapp'; 

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
      // We only select the ID to send back, for security.
      select: {
        id: true, 
        phoneNumber: true
      }
    });

    // --- Send WhatsApp OTP ---
    // TODO: We will build this logic next.
    // For now, we simulate success.
    // const otp = "123456"; // A real OTP would be generated
    // await sendWhatsAppOTP(user.phoneNumber, otp);

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
