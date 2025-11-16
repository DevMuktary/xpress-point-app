import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: Request) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set.');
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' }, { status: 400 }
      );
    }

    // 1. Find the user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' }, { status: 401 }
      );
    }

    // --- THIS IS THE CRITICAL SECURITY CHECK ---
    // 2. Check if the user is an ADMIN
    if (user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Access Denied: This login is for administrators only.' }, 
        { status: 403 } // 403 Forbidden
      );
    }
    // ------------------------------------------

    // 3. Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' }, { status: 401 }
      );
    }

    // 4. Create session token (JWT)
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' } // Admin session lasts 1 day
    );

    // 5. Set the cookie
    cookies().set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 1, // 1 day
      path: '/',
    });

    return NextResponse.json(
      { message: 'Login successful' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Admin Login Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
