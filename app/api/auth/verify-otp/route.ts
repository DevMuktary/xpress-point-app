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
    const { phone } = body; // Removed 'otp' requirement

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' }, { status: 400 }
      );
    }

    // --- BYPASS LOGIC START ---
    // Instead of checking the OTP table, we find the user directly.
    const user = await prisma.user.findFirst({
      where: { phoneNumber: phone },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' }, { status: 404 }
      );
    }

    // 2. Mark user as phone verified (Auto-verify)
    await prisma.user.update({
      where: { id: user.id },
      data: { isPhoneVerified: true },
    });

    // Optional: Delete any pending OTPs for this user to keep DB clean
    await prisma.otp.deleteMany({
      where: { userId: user.id }
    });
    // --- BYPASS LOGIC END ---

    // 4. Create the *login* token
    const loginToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, firstName: user.firstName },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 5. Set the "session cookie"
    cookies().set('auth_token', loginToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    
    // 6. Send the Verification Email
    const emailVerifyToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Wrap in try-catch so email failure doesn't block login
    try {
        await sendVerificationEmail(user.email, user.firstName, emailVerifyToken);
    } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
    }
    
    return NextResponse.json(
      { message: 'Verification successful. User logged in.' }, { status: 200 }
    );

  } catch (error) {
    console.error('OTP Bypass Verification Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred' }, { status: 500 }
    );
  }
}
