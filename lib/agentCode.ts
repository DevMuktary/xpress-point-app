import { prisma } from '@/lib/prisma';

export function generateRandomSixDigits(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to generate a unique agent code
export async function generateUniqueAgentCode(): Promise<string> {
  let code = generateRandomSixDigits();
  let isUnique = false;

  while (!isUnique) {
    const existingUser = await prisma.user.findUnique({
      where: { agentCode: code },
    });
    if (!existingUser) {
      isUnique = true;
    } else {
      code = generateRandomSixDigits(); // Try again
    }
  }
  return code;
}
