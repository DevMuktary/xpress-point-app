import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import { Role } from '@prisma/client';

interface UserPayload {
  userId: string;
  email: string;
  role: Role;
}

export async function getUserFromSession() {
  const token = cookies().get('auth_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        isEmailVerified: true,
        isIdentityVerified: true,
        isBlocked: true, // <--- Fetch this field
        bvn: true,
        nin: true,
        agentCode: true,
        hasAgreedToModificationTerms: true,
        subdomain: true,
        businessName: true,
        accountName: true,
        accountNumber: true,
        bankName: true,
        aggregatorId: true,
      }
    });

    // --- THE BLOCK LOGIC ---
    // If user doesn't exist OR is blocked, return null.
    // This effectively logs them out immediately.
    if (!user || user.isBlocked) {
      return null;
    }

    return user;

  } catch (error) {
    return null;
  }
}
