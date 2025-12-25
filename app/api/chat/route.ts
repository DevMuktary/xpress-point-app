import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';

// GET: Fetch latest messages AND Lock Status
export async function GET() {
  try {
    const lockSetting = await prisma.systemSetting.findUnique({
      where: { key: 'CHAT_LOCKED' }
    });
    const isLocked = lockSetting?.value === 'true';

    const messages = await prisma.chatMessage.findMany({
      where: { isDeleted: false },
      take: 500,
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            businessName: true,
            role: true,
            email: true, 
            agentCode: true,
            isChatBlocked: true 
          }
        },
        // --- INCLUDE REPLY DETAILS ---
        replyTo: {
          select: {
            id: true,
            message: true,
            user: {
              select: {
                firstName: true,
                businessName: true,
                role: true
              }
            }
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

  if (user.role !== 'ADMIN') {
    const lockSetting = await prisma.systemSetting.findUnique({ where: { key: 'CHAT_LOCKED' } });
    if (lockSetting?.value === 'true') {
      return NextResponse.json({ error: 'Chat is currently locked.' }, { status: 403 });
    }
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }});
  if (dbUser?.isChatBlocked) {
    return NextResponse.json({ error: 'You are blocked.' }, { status: 403 });
  }

  try {
    // Extract replyToId from body
    const { message, replyToId } = await request.json(); 
    if (!message) return NextResponse.json({ error: 'Message empty' }, { status: 400 });

    const newMessage = await prisma.chatMessage.create({
      data: {
        userId: user.id,
        message: message,
        isAdmin: user.role === 'ADMIN',
        replyToId: replyToId || null // Save the link
      },
      include: {
        user: {
           select: { 
             id: true, firstName: true, lastName: true, businessName: true, 
             role: true, email: true, agentCode: true, isChatBlocked: true 
            }
        },
        replyTo: {
          select: {
            id: true, message: true,
            user: { select: { firstName: true, businessName: true, role: true } }
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
