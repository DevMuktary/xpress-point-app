import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

// Define the shape of our token
interface UserPayload {
  userId: string;
  email: string;
  role: string;
}

export async function getUserFromSession() {
  const token = cookies().get('auth_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
    
    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      // --- THIS IS THE FIX ---
      // We must select all the fields we need, including bvn and phoneNumber
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
        isIdentityVerified: true,
        bvn: true,              // <-- ADDED
        phoneNumber: true       // <-- ADDED
      }
    });

    return user;

  } catch (error) {
    // Invalid token
    return null;
  }
}
