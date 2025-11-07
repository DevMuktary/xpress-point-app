import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request: Request) {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not set.');
    // Show a generic error page
    return NextResponse.redirect(new URL('/error', request.url));
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/error?code=invalid_link', request.url));
  }

  try {
    // 1. Verify the token
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string, email: string };
    
    // 2. Update the user in the database
    await prisma.user.update({
      where: { id: payload.userId },
      data: { isEmailVerified: true },
    });

    // 3. Redirect to a success page
    // This will take them to their dashboard with a "success" message
    return NextResponse.redirect(new URL('/dashboard?email_verified=true', request.url));

  } catch (error) {
    // Token is expired or invalid
    console.error("Email verification error:", error);
    return NextResponse.redirect(new URL('/error?code=expired_link', request.url));
  }
}
