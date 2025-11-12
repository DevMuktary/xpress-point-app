import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// This is the "world-class," secure way to log out.
// It is a POST request to prevent "prefetch" bugs.
export async function POST(request: Request) {
  try {
    // --- THIS IS THE FIX ---
    // Clear the authentication cookie
    cookies().set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: -1, // Tell the browser to delete it immediately
      path: '/',
    });
    // -----------------------

    // Redirect the user back to the login page
    return NextResponse.redirect(new URL('/login', request.url), {
      status: 302, // 302 Found (standard redirect)
    });

  } catch (error) {
    console.error('Logout Error:', error);
    // If something fails, still try to redirect
    return NextResponse.redirect(new URL('/login?error=logout_failed', request.url), {
      status: 302,
    });
  }
}
