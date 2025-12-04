import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getUserFromSession();
  
  // Only Admins can lock/unlock
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { locked } = await request.json(); // boolean true/false
    
    // Save to System Settings
    await prisma.systemSetting.upsert({
      where: { key: 'CHAT_LOCKED' },
      update: { value: String(locked) },
      create: { key: 'CHAT_LOCKED', value: String(locked) }
    });

    return NextResponse.json({ success: true, locked });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update lock status' }, { status: 500 });
  }
}
