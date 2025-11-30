import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { sendHtmlEmail } from '@/lib/email';

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { subject, htmlMessage } = await request.json();

    if (!subject || !htmlMessage) {
      return NextResponse.json({ error: 'Subject and Message are required' }, { status: 400 });
    }

    // 1. Fetch all users (You might want to filter active users only)
    const users = await prisma.user.findMany({
      select: { email: true, firstName: true, lastName: true }
    });

    // 2. Send emails (In production, this should be a background job/queue)
    // For now, we loop. Note: Vercel/Railway might timeout if list is huge.
    let sentCount = 0;
    
    // We process in chunks or just fire promises to speed it up
    const emailPromises = users.map(u => {
      const fullName = `${u.firstName} ${u.lastName}`;
      return sendHtmlEmail(u.email, fullName, subject, htmlMessage)
        .then(() => sentCount++)
        .catch(err => console.error(`Failed to send to ${u.email}`, err));
    });

    await Promise.all(emailPromises);

    return NextResponse.json({ 
      success: true, 
      message: `Broadcast initiated for ${users.length} users.` 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
