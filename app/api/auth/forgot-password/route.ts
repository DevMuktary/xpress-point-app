import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOtpMessage } from '@/lib/whatsapp';
import { sendHtmlEmail } from '@/lib/email'; // Only importing the generic sender

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    console.log("1. Forgot Password Request for Email:", email);

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Find user by Email only
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      console.log("2. User NOT FOUND.");
      // Return success to prevent email enumeration attacks
      return NextResponse.json({ 
        message: 'If an account exists, an OTP has been sent.' 
      });
    }

    console.log("2. User Found:", user.id);

    // 3. Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // 4. Save to DB (Cleanup old tokens first)
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
        data: { userId: user.id, token: otpCode, expiresAt }
    });

    console.log("3. OTP Generated:", otpCode);

    let sentVia = [];

    // 5. Send via WhatsApp (if phone exists)
    if (user.phoneNumber) {
      try {
        console.log("4a. Attempting WhatsApp to:", user.phoneNumber);
        await sendOtpMessage(user.phoneNumber, otpCode);
        sentVia.push('WhatsApp');
      } catch (waError) {
        console.error("WhatsApp Send Failed:", waError);
      }
    }

    // 6. Send via Email (Always)
    // We ONLY use sendHtmlEmail here to avoid triggering the Welcome/Verification email
    try {
      console.log("4b. Attempting Email to:", user.email);
      
      const htmlContent = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #2563EB; text-align: center;">Password Reset Request</h2>
          <p style="font-size: 16px; color: #333;">Hello ${user.firstName},</p>
          <p style="font-size: 16px; color: #333;">Use the code below to reset your Xpress Point password:</p>
          
          <div style="background-color: #f0f9ff; padding: 15px; text-align: center; margin: 20px 0; border-radius: 8px;">
             <h1 style="letter-spacing: 8px; color: #2563EB; font-size: 32px; margin: 0;">${otpCode}</h1>
          </div>

          <p style="color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px; text-align: center;">If you did not request this, please ignore this email.</p>
        </div>
      `;
      
      await sendHtmlEmail(user.email, user.firstName, "Reset Your Password", htmlContent);
      sentVia.push('Email');

    } catch (emailError) {
       console.error("Email Send Failed:", emailError);
    }

    console.log(`5. Process Complete. Sent via: ${sentVia.join(', ')}`);

    return NextResponse.json({ message: `OTP sent via ${sentVia.join(' & ')}.` });

  } catch (error: any) {
    console.error("Forgot Password API Error:", error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
