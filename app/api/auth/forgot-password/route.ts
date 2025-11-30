import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOtpMessage } from '@/lib/whatsapp';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { identifier } = await request.json();
    if (!identifier) {
      return NextResponse.json({ error: 'Email or Phone is required' }, { status: 400 });
    }

    // 1. Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { phoneNumber: identifier }
        ]
      }
    });

    if (!user) {
      // Security: Don't reveal if user exists
      return NextResponse.json({ message: 'If an account exists, an OTP has been sent.' });
    }

    // 2. Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now

    // 3. Save to DB (Delete old tokens first to keep it clean)
    await prisma.passwordResetToken.deleteMany({ 
      where: { userId: user.id } 
    });
    
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: otpCode,
        expiresAt
      }
    });

    // 4. Send via WhatsApp first, fall back to Email
    try {
      // Assuming user.phoneNumber is stored as '080...' or '+234...'
      await sendOtpMessage(user.phoneNumber, otpCode);
    } catch (waError) {
      console.error("WhatsApp Failed, attempting Email...", waError);
      // Fallback
      await sendVerificationEmail(user.email, user.firstName, otpCode);
    }

    return NextResponse.json({ message: 'OTP sent successfully.' });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
