import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email'; // Import our Brevo helper
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: Request) {
  // 1. Get the user from their login cookie
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Check if they are already verified
  if (user.isEmailVerified) {
    return NextResponse.json(
      { error: 'Email is already verified.' },
      { status: 400 }
    );
  }

  if (!JWT_SECRET) {
    console.error('Resend Email Error: JWT_SECRET is not set.');
    return NextResponse.json(
      { error: 'Server configuration error.' },
      { status: 500 }
    );
  }

  try {
    // 3. Create a new 1-hour verification token
    const emailVerifyToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // 4. Send the new email
    await sendVerificationEmail(user.email, user.firstName, emailVerifyToken);

    return NextResponse.json(
      { message: 'Verification email sent successfully.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Resend Email Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
