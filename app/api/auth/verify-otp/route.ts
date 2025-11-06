import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken'; // For creating login tokens
import { cookies } from 'next/headers'; // For setting the cookie

// Get the secret from Railway variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1d'; // Login expires in 1 day

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    // 1. Find the OTP in the database
    const otpRecord = await prisma.otp.findFirst({
      where: {
        code: otp,
        user: { phoneNumber: phone },
        expiresAt: { gt: new Date() }, // Check if it's not expired
      },
      include: {
        user: true, // Include the user data
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP.' },
        { status: 400 }
      );
    }

    // --- OTP is valid! ---
    const user = otpRecord.user;

    // 2. Mark the user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { isPhoneVerified: true },
    });

    // 3. Delete the OTP so it can't be used again
    await prisma.otp.delete({
      where: { id: otpRecord.id },
    });

    // 4. Create a login token (JWT)
    
    // --- THIS IS THE FIX ---
    // We must check for JWT_SECRET *inside* the function.
    // This proves to TypeScript that it is a string before we use it.
    if (!JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set.');
      throw new Error('Server configuration error.');
    }
    // ----------------------

    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET, // TypeScript now knows this is a string
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 5. Set the token in a secure, httpOnly cookie to log the user in
    cookies().set('auth_token', token, {
      httpOnly: true, // Prevents access from client-side script
      secure: process.env.NODE_ENV === 'production', // Only on HTTPS
      sameSite: 'strict', // Protects against CSRF
      maxAge: 24 * 60 * 60, // 1 day in seconds
      path: '/', // Available to the whole site
    });

    return NextResponse.json(
      { message: 'Verification successful. User logged in.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('OTP Verification Error:', error);
    // Don't leak server errors to the client
    if (error instanceof Error && error.message.includes('Server configuration error')) {
      return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
