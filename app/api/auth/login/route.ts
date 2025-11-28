import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // --- ROBUST INPUT CHECK ---
    // We look for 'email', 'phone', or 'identifier' in the request body
    // This fixes the "missing field" error if frontend sends { phone: "..." }
    const loginId = body.email || body.phone || body.identifier || body.phoneNumber;
    const { password } = body;

    if (!loginId || !password) {
      return NextResponse.json({ error: 'Email/Phone and password are required' }, { status: 400 });
    }

    // 1. Find User by Email OR Phone Number
    // We search for the loginId in both fields
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginId.toLowerCase() }, 
          { phoneNumber: loginId }          
        ]
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // --- 2. CHECK BLOCK STATUS ---
    if (user.isBlocked) {
      return NextResponse.json(
        { error: 'Your account has been suspended. Please contact support.' }, 
        { status: 403 } 
      );
    }

    // 3. Check Password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 4. Generate Token
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 5. Set Cookie
    cookies().set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json(
      { message: 'Login successful', user: { id: user.id, role: user.role } },
      { status: 200 }
    );

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
