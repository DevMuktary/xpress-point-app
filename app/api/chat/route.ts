import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';

// GET: Fetch latest messages
export async function GET() {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { isDeleted: false },
      take: 50, // Last 50 messages
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            businessName: true,
            role: true,
            email: true, // Only Admin UI will display this
            agentCode: true
          }
        }
      }
    });
    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 });
  }
}

// POST: Send a message
export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check if blocked
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
           select: { firstName: true, lastName: true, businessName: true, role: true, email: true, agentCode: true }
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
