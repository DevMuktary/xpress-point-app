import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: Request) {
  console.log("\n--- [DEBUG] NEW ADMIN LOGIN REQUEST ---");

  if (!JWT_SECRET) {
    console.error("[DEBUG] CRITICAL: JWT_SECRET is not set.");
    throw new Error('JWT_SECRET environment variable is not set.');
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      console.error("[DEBUG] Email or password missing.");
      return NextResponse.json(
        { error: 'Email and password are required' }, { status: 400 }
      );
    }
    console.log(`[DEBUG] Attempting login for: ${email}`);

    // 1. Find the user
    console.log("[DEBUG] Step 1: Finding user in database...");
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.error("[DEBUG] User not found in database.");
      return NextResponse.json(
        { error: 'Invalid credentials' }, { status: 401 }
      );
    }
    console.log("[DEBUG] Step 1 Success: User found.");

    // 2. Check if the user is an ADMIN
    console.log(`[DEBUG] Step 2: Checking role. User role is: ${user.role}`);
    if (user.role !== Role.ADMIN) {
      console.error("[DEBUG] Role check failed: User is not an ADMIN.");
      return NextResponse.json(
        { error: 'Access Denied: This login is for administrators only.' }, 
        { status: 403 } // 403 Forbidden
      );
    }
    console.log("[DEBUG] Step 2 Success: User is ADMIN.");

    // 3. Check password
    console.log("[DEBUG] Step 3: Comparing password hash...");
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      console.error("[DEBUG] Password check failed: Invalid password.");
      return NextResponse.json(
        { error: 'Invalid credentials' }, { status: 401 }
      );
    }
    console.log("[DEBUG] Step 3 Success: Password is valid.");

    // 4. Create session token (JWT)
    console.log("[DEBUG] Step 4: Creating JWT token...");
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' } // Admin session lasts 1 day
    );
    console.log("[DEBUG] Step 4 Success: JWT token created.");

    // 5. Set the cookie
    console.log("[DEBUG] Step 5: Setting auth cookie...");
    cookies().set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 1, // 1 day
      path: '/',
    });
    console.log("[DEBUG] Step 5 Success: Cookie set.");

    return NextResponse.json(
      { message: 'Login successful' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('--- [DEBUG] FINAL CATCH BLOCK (Admin Login) ---');
    console.error('Admin Login Error:', error.message);
    console.error('Error Stack:', error.stack);
    
    // This will catch the Prisma error if it happens again
    if (error.message.includes("The string did not match the expected pattern")) {
      console.error("--- [DEBUG] PRISMA DECIMAL BUG DETECTED IN LOGIN ---");
    }
    
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
