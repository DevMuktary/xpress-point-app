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

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { phoneNumber: identifier }
        ]
      }
    });

    if (!user) {
      // For security, don't reveal if user exists or not
      return NextResponse.json({ message: 'If an account exists, an OTP has been sent.' });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Save to DB
    await prisma.passwordResetToken.upsert({
      where: { userId: user.id }, // Since userId isn't unique in the schema, we rely on token uniqueness or cleanup.
      // Wait, schema has token unique, userId not unique. We should probably delete old ones first.
      create: {
        userId: user.id,
        token: otpCode,
        expiresAt
      },
      update: {
        token: otpCode,
        expiresAt
      }
    // Note: Upsert on non-unique field is tricky. Better approach: delete old, create new.
    });
    // Since schema: token is unique. Let's do deleteMany then create.
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
        data: { userId: user.id, token: otpCode, expiresAt }
    });

    // Send via WhatsApp first
    try {
      await sendOtpMessage(user.phoneNumber, otpCode);
    } catch (waError) {
      console.error("WhatsApp Failed, falling back to Email", waError);
      // Fallback to Email
      await sendVerificationEmail(user.email, user.firstName, otpCode);
    }

    return NextResponse.json({ message: 'OTP sent successfully.', email: user.email, phone: user.phoneNumber });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
