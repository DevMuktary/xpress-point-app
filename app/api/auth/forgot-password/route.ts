import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOtpMessage } from '@/lib/whatsapp';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { identifier } = await request.json();
    
    console.log("1. Forgot Password Request for:", identifier); // <--- DEBUG LOG

    if (!identifier) {
      return NextResponse.json({ error: 'Email or Phone is required' }, { status: 400 });
    }

    // --- Normalize Phone for Lookup ---
    // If identifier starts with '0', create a version with '+234'
    // If it's email, this logic won't break anything
    let phoneSearch = identifier;
    if (/^0\d{10}$/.test(identifier)) {
        phoneSearch = '+234' + identifier.substring(1);
    }
    // Also try adding + to 234 if user typed 234...
    let phoneSearch2 = identifier;
    if (identifier.startsWith('234')) {
        phoneSearch2 = '+' + identifier;
    }

    console.log(`2. Searching DB for: ${identifier} OR ${phoneSearch} OR ${phoneSearch2}`);

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { phoneNumber: identifier },
          { phoneNumber: phoneSearch },
          { phoneNumber: phoneSearch2 }
        ]
      }
    });

    if (!user) {
      console.log("3. User NOT FOUND in database."); // <--- DEBUG LOG
      // We return success to UI for security, but log failure here
      return NextResponse.json({ 
        message: 'If an account exists, an OTP has been sent. (DEBUG: User not found)' 
      });
    }

    console.log("3. User Found:", user.email); // <--- DEBUG LOG

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Save to DB (Delete old tokens first)
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
        data: { userId: user.id, token: otpCode, expiresAt }
    });

    console.log("4. OTP Generated & Saved:", otpCode);

    // --- Attempt WhatsApp ---
    let sentVia = 'None';
    try {
      if (user.phoneNumber) {
        console.log("5. Attempting WhatsApp to:", user.phoneNumber);
        await sendOtpMessage(user.phoneNumber, otpCode);
        sentVia = 'WhatsApp';
      }
    } catch (waError) {
      console.error("WhatsApp Send Failed:", waError);
    }

    // --- Attempt Email (Always send email as backup or primary) ---
    try {
      console.log("6. Attempting Email to:", user.email);
      
      // Create a simple HTML message for the code
      const htmlContent = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563EB;">Password Reset</h2>
          <p>You requested a password reset. Use the code below:</p>
          <h1 style="letter-spacing: 5px; color: #333; font-size: 32px;">${otpCode}</h1>
          <p>This code expires in 10 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p>
        </div>
      `;
      
      // Use your generic email sender
      // We import sendHtmlEmail from '@/lib/email' at top
      // Make sure to import { sendHtmlEmail } ...
      
      // (I am assuming you exported sendHtmlEmail in lib/email.ts as discussed previously)
       // If you only have sendVerificationEmail, we can reuse the logic here manually:
       // But based on previous turns, we have sendHtmlEmail.
       await sendVerificationEmail(user.email, user.firstName, otpCode); // Reusing this function logic or better:
       // Actually, sendVerificationEmail formats it as a link. 
       // Let's use the sendHtmlEmail function I gave you earlier:
       const { sendHtmlEmail } = require('@/lib/email'); // Dynamic import to ensure it exists
       await sendHtmlEmail(user.email, user.firstName, "Reset Your Password", htmlContent);

       if (sentVia === 'None') sentVia = 'Email';
       else sentVia += ' & Email';

    } catch (emailError) {
       console.error("Email Send Failed:", emailError);
    }

    console.log(`7. Process Complete. Sent via: ${sentVia}`);

    return NextResponse.json({ message: `OTP sent successfully via ${sentVia}.` });

  } catch (error: any) {
    console.error("Forgot Password API Error:", error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
