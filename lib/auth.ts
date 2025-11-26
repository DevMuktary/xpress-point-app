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
        bvn: true,
        nin: true,
        agentCode: true, // <--- ADD THIS
        hasAgreedToModificationTerms: true,
        subdomain: true,
        businessName: true,
        accountName: true,
        accountNumber: true,
        bankName: true,
        aggregatorId: true,
      }
    });

    return user;

  } catch (error) {
    return null;
  }
}
