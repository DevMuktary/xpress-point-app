import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';

// GET: Fetch latest messages AND Lock Status
export async function GET() {
  try {
    // 1. Check if chat is locked (Global System Setting)
    const lockSetting = await prisma.systemSetting.findUnique({
      where: { key: 'CHAT_LOCKED' }
    });
    const isLocked = lockSetting?.value === 'true';

    // 2. Fetch Messages
    const messages = await prisma.chatMessage.findMany({
      where: { isDeleted: false },
      take: 50, // Last 50 messages
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true, // <--- REQUIRED for Block button to work
            firstName: true,
            lastName: true,
            businessName: true,
            role: true,
            email: true, 
            agentCode: true
          }
        }
      }
    });
    
    return NextResponse.json({ messages, isLocked });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 });
  }
}

// POST: Send a message
export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 1. Check Global Lock (Admins bypass this)
  if (user.role !== 'ADMIN') {
    const lockSetting = await prisma.systemSetting.findUnique({
      where: { key: 'CHAT_LOCKED' }
    });
    if (lockSetting?.value === 'true') {
      return NextResponse.json({ error: 'Chat is currently locked by Admin.' }, { status: 403 });
    }
  }

  // 2. Check if User is Individually Blocked
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }});
  if (dbUser?.isChatBlocked) {
    return NextResponse.json({ error: 'You are blocked from the community chat.' }, { status: 403 });
  }

  try {
    const { message } = await request.json();
    if (!message) return NextResponse.json({ error: 'Message empty' }, { status: 400 });

    const newMessage = await prisma.chatMessage.create({
      data: {
        userId: user.id,
        message: message,
        isAdmin: user.role === 'ADMIN'
      },
      include: {
        user: {
           select: { 
             id: true, 
             firstName: true, 
             lastName: true, 
             businessName: true, 
             role: true, 
             email: true, 
             agentCode: true 
            }
        }
      }
    });

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

// DELETE: Admin deletes message
export async function DELETE(request: Request) {
  const user = await getUserFromSession();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { messageId } = await request.json();
    await prisma.chatMessage.update({
      where: { id: messageId },
      data: { isDeleted: true }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
