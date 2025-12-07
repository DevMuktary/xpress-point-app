import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
// We get the live URL from our environment variables
const APP_URL = process.env.APP_URL; 

export async function GET(request: Request) {
  if (!JWT_SECRET || !APP_URL) {
    console.error('Email verification error: Server environment is not set up.');
    return NextResponse.redirect(new URL('/login?error=Server+configuration+error', APP_URL || request.url));
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=Invalid+verification+link', APP_URL));
  }

  try {
    // 1. Verify the token
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string, email: string };
    
    // 2. Update the user in the database
    // We set BOTH isEmailVerified AND isIdentityVerified to true
    await prisma.user.update({
      where: { id: payload.userId },
      data: { 
        isEmailVerified: true,
        isIdentityVerified: true 
      },
    });

    // 3. Redirect to LOGIN with Success Message
    return NextResponse.redirect(new URL('/login?success=Email+verified+successfully.+Please+login.', APP_URL));

  } catch (error) {
    console.error("Email verification error:", error);
    // Redirect to LOGIN with Error Message
    return NextResponse.redirect(new URL('/login?error=Verification+link+expired+or+invalid', APP_URL));
  }
}
