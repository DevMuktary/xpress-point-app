import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// --- THIS IS THE FIX (Part 1) ---
// We get the "world-class" URL from your Railway variables
const APP_URL = process.env.APP_URL;

if (!APP_URL) {
  console.error("CRITICAL: APP_URL is not set in environment variables!");
}
// ------------------------------

export async function POST(request: Request) {
  try {
    // 1. Clear the authentication cookie
    cookies().set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: -1, // Delete it immediately
      path: '/',
    });

    // --- THIS IS THE FIX (Part 2) ---
    // We redirect to YOUR URL, not "localhost"
    return NextResponse.redirect(new URL('/login', APP_URL), {
      status: 302,
    });
    // ------------------------------

  } catch (error) {
    console.error('Logout Error:', error);
    // If something fails, still try to redirect to the correct login page
    return NextResponse.redirect(new URL('/login?error=logout_failed', APP_URL || request.url), {
      status: 302,
    });
  }
}
