import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1d'; // The token *inside* the cookie is valid for 1 day

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { loginIdentifier, password } = body;

    if (!loginIdentifier || !password) {
      return NextResponse.json(
        { error: 'Email/Phone and password are required' },
        { status: 400 }
      );
    }

    // 1. Find the user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginIdentifier.toLowerCase() },
          { phoneNumber: loginIdentifier }
        ]
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials. Please try again.' },
        { status: 401 }
      );
    }

    // 2. Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials. Please try again.' },
        { status: 401 }
      );
    }

    // 3. Create a login token
    if (!JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set.');
      throw new Error('Server configuration error.');
    }

    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // --- THIS IS THE FIX ---
    // We set the "session cookie"
    cookies().set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      // 'maxAge' is REMOVED. The cookie is now a session cookie.
      path: '/',
    });
    // -----------------------

    return NextResponse.json(
      { message: 'Login successful' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Login Error:', error);
    if (error instanceof Error && error.message.includes('Server configuration error')) {
      return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
