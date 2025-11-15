import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user || user.role !== 'AGGREGATOR') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { newBankName, newAccountNumber, newAccountName } = body;

    if (!newBankName || !newAccountNumber || !newAccountName) {
      return NextResponse.json({ error: 'All new account fields are required.' }, { status: 400 });
    }
    
    // Use "upsert" to create or update the pending request
    await prisma.pendingAccountChange.upsert({
      where: {
        userId: user.id
      },
      update: {
        newBankName: newBankName,
        newAccountNumber: newAccountNumber,
        newAccountName: newAccountName,
        createdAt: new Date() // Reset the creation time
      },
      create: {
        userId: user.id,
        newBankName: newBankName,
        newAccountNumber: newAccountNumber,
        newAccountName: newAccountName
      }
    });

    return NextResponse.json(
      { 
        message: 'Your account change request has been submitted for admin approval.'
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error(`Account Change Request Error:`, error.message);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
