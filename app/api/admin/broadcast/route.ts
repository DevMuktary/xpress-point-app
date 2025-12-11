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

    // 1. Fetch all users
    const users = await prisma.user.findMany({
      select: { email: true, firstName: true, lastName: true }
    });

    // 2. Generate Plain Text Version (Strip HTML tags)
    // This is required for the new spam-proof email sender
    const textContent = htmlMessage.replace(/<[^>]+>/g, '');

    // 3. Send emails
    let sentCount = 0;
    
    const emailPromises = users.map(u => {
      const fullName = `${u.firstName} ${u.lastName}`;
      
      // We now pass 5 arguments: textContent is the last one
      return sendHtmlEmail(u.email, fullName, subject, htmlMessage, textContent)
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
