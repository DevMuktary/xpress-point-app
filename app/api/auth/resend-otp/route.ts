import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/lib/whatsapp'; // Import our WhatsApp function

/**
 * Generates a 6-digit numeric OTP.
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // 1. Find the user by their phone number
    const user = await prisma.user.findUnique({
      where: { phoneNumber: phone },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      );
    }

    // 2. Delete all old OTPs for this user to prevent conflicts
    await prisma.otp.deleteMany({
      where: { userId: user.id },
    });

    // 3. Generate and save a new OTP
    const otpCode = generateOTP();
    const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

    await prisma.otp.create({
      data: {
        code: otpCode,
        userId: user.id,
        expiresAt: tenMinutesFromNow,
      },
    });

    // 4. Send the new OTP via WhatsApp
    // (Ensure your 'otp_verification' template in Meta is approved)
    await sendWhatsAppMessage(user.phoneNumber, 'otp_verification', otpCode);
    
    return NextResponse.json(
      { message: 'A new OTP has been sent.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Resend OTP Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
