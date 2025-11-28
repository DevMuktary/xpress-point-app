import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getUserFromSession();
  
  // Security: Admin Only
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { serviceId, isActive } = body; 

    if (!serviceId || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Update Service Status
    await prisma.service.update({
      where: { id: serviceId },
      data: { isActive: isActive }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Service marked as ${isActive ? 'Active' : 'Inactive'}` 
    });

  } catch (error: any) {
    console.error("Toggle Service Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

