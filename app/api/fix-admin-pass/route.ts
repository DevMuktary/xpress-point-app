import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// !! IMPORTANT !!
// 1. Change this email to your *exact* admin email
// 2. Change this password to the new password you want
const ADMIN_EMAIL = "admin@xpresspoint.net";
const NEW_PASSWORD = "Mkolodart2002";
// !!!!!!!!!!!!!!!!!!!

export async function GET(request: Request) {
  try {
    // 1. Hash the new password
    const passwordHash = await bcrypt.hash(NEW_PASSWORD, 10);
    
    console.log("--- [DEBUG] Password Fix ---");
    console.log("Email:", ADMIN_EMAIL);
    console.log("New Hash:", passwordHash);

    // 2. Find and update your user
    const user = await prisma.user.update({
      where: {
        email: ADMIN_EMAIL.toLowerCase(),
      },
      data: {
        passwordHash: passwordHash,
        role: 'ADMIN' // Also ensure you are an ADMIN
      }
    });
    
    console.log("--- [DEBUG] Success! ---");
    console.log("User updated:", user.email);

    return NextResponse.json(
      { message: `Success! Admin ${user.email} password has been updated.` },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Admin Password Fix Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to update admin password. Is the ADMIN_EMAIL correct?' },
      { status: 500 }
    );
  }
}
