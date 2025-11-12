import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { sendVerificationEmail } from '@/lib/email';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1d';

export async function POST(request: Request) {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set.');
    throw new Error('Server configuration error.');
  }

  try {
    const body = await request.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' }, { status: 400 }
      );
    }

    // 1. Find the OTP
    const otpRecord = await prisma.otp.findFirst({
      where: {
        code: otp,
        user: { phoneNumber: phone },
        expiresAt: { gt: new Date() }, 
      },
      include: {
        user: true,
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP.' }, { status: 400 }
      );
    }

    const user = otpRecord.user;

    // 2. Mark user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { isPhoneVerified: true },
    });

    // 3. Delete the used OTP
    await prisma.otp.delete({
      where: { id: otpRecord.id },
    });

    // 4. Create the *login* token
    const loginToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, firstName: user.firstName },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // --- THIS IS THE FIX ---
    // We set the "session cookie"
    cookies().set('auth_token', loginToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      // 'maxAge' is REMOVED.
      path: '/',
    });
    // -----------------------
    
    // 6. Send the Verification Email
    const emailVerifyToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    await sendVerificationEmail(user.email, user.firstName, emailVerifyToken);
    
    return NextResponse.json(
      { message: 'Verification successful. User logged in.' }, { status: 200 }
    );

  } catch (error) {
    console.error('OTP Verification Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred' }, { status: 500 }
    );
  }
}
