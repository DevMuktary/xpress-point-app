import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    // Set the flag in the database
    await prisma.user.update({
      where: { id: user.id },
      data: { hasAgreedToModificationTerms: true },
    });

    return NextResponse.json({ message: 'Agreement saved.' }, { status: 200 });

  } catch (error: any) {
    console.error("Agree to Terms Error:", error.message);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
