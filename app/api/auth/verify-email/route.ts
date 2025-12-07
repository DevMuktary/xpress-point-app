import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
// --- THIS IS THE FIX ---
// We get the live URL from our environment variables
const APP_URL = process.env.APP_URL; 

export async function GET(request: Request) {
  if (!JWT_SECRET || !APP_URL) {
    console.error('Email verification error: Server environment is not set up.');
    // Show a generic error page
    return NextResponse.redirect(new URL('/login?error=config_error', APP_URL || request.url));
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=invalid_link', APP_URL));
  }

  try {
    // 1. Verify the token
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string, email: string };
    
    // 2. Update the user in the database
    // We now set BOTH isEmailVerified AND isIdentityVerified to true
    await prisma.user.update({
      where: { id: payload.userId },
      data: { 
        isEmailVerified: true,
        isIdentityVerified: true 
      },
    });

    // 3. Redirect to a success page
    // This will now redirect to: https://your-app.com/dashboard?email_verified=true
    return NextResponse.redirect(new URL('/dashboard?email_verified=true', APP_URL));

  } catch (error) {
    // Token is expired or invalid
    console.error("Email verification error:", error);
    return NextResponse.redirect(new URL('/login?error=expired_link', APP_URL));
  }
}
