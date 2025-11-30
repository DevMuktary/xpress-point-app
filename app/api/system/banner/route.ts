import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';

// GET: Retrieve Banner
export async function GET() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'dashboard_banner' }
    });
    return NextResponse.json({ content: setting?.value || '' });
  } catch (error) {
    return NextResponse.json({ content: '' });
  }
}

// POST: Update Banner (Admin Only)
export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { content } = await request.json();
    
    await prisma.systemSetting.upsert({
      where: { key: 'dashboard_banner' },
      update: { value: content },
      create: { key: 'dashboard_banner', value: content }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save banner' }, { status: 500 });
  }
}
