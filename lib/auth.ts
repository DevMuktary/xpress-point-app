import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import { Role } from '@prisma/client'; // Import Role

// Define the shape of our token
interface UserPayload {
  userId: string;
  email: string;
  role: Role;
}

// This is the function to get the user from their cookie
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
      // --- THIS IS THE "WORLD-CLASS" FIX ---
      // We must select all the new fields we added to the schema.
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
        hasAgreedToModificationTerms: true,
        subdomain: true,          // <-- THE MISSING LINE
        businessName: true,       // <-- THE MISSING LINE
        accountName: true,        // <-- Added for future tools
        accountNumber: true,      // <-- Added for future tools
        bankName: true,           // <-- Added for future tools
      }
      // ------------------------------------
    });

    return user;

  } catch (error) {
    // Invalid token
    return null;
  }
}
