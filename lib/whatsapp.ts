import { prisma } from '@/lib/prisma';
import { sendHtmlEmail } from '@/lib/email'; 

// --- 1. OTP FUNCTION (Kept on WhatsApp for now) ---
// If you want this on email too, we can switch it easily.
export async function sendOtpMessage(phone: string, otp: string) {
  const WHATSAPP_API_URL = 'https://api.waping.io/v1/send'; // Or your specific provider
  const API_KEY = process.env.WHATSAPP_API_KEY;

  if (!API_KEY) {
    console.error("WhatsApp API Key missing");
    return;
  }

  try {
    // Basic formatting to ensure international format if needed
    const formattedPhone = phone.startsWith('0') ? '234' + phone.slice(1) : phone;

    await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        phone: formattedPhone,
        message: `Your Xpress Point OTP is: *${otp}*\n\nValid for 10 minutes. Do not share this code.`
      })
    });
    console.log(`OTP sent via WhatsApp to ${phone}`);
  } catch (error) {
    console.error("Failed to send WhatsApp OTP:", error);
  }
}

// --- 2. STATUS NOTIFICATION (Switched to EMAIL) ---
// This function name is kept the same so you don't have to edit other files.
// It effectively "hijacks" the call and sends an email instead.
export async function sendStatusNotification(phone: string, serviceName: string, statusMessage: string) {
  try {
    console.log(`[Notification Switch] converting WhatsApp call for ${phone} to Email...`);

    // A. Find the user's email using the phone number
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { phoneNumber: phone },
          // Handle cases where phone might be stored with or without +234
          { phoneNumber: phone.replace('+234', '0') },
          { phoneNumber: '0' + phone.slice(3) }
        ]
      },
      select: { email: true, firstName: true }
    });

    if (!user || !user.email) {
      console.warn(`[Notification Failed] Could not find email for phone number: ${phone}`);
      return;
    }

    // B. Determine Color based on status text
    const isSuccess = statusMessage.toLowerCase().includes('success') || statusMessage.toLowerCase().includes('completed');
    const isFailure = statusMessage.toLowerCase().includes('fail') || statusMessage.toLowerCase().includes('reject');
    
    let color = '#2563EB'; // Blue (Default/Processing)
    if (isSuccess) color = '#16A34A'; // Green
    if (isFailure) color = '#DC2626'; // Red

    // C. Prepare Email Content
    const subject = `Update: ${serviceName}`;
    
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <div style="background-color: ${color}; padding: 20px; text-align: center; color: white;">
          <h2 style="margin: 0;">Status Update</h2>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #333;">Hello ${user.firstName},</p>
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            There is an update regarding your request for <strong>${serviceName}</strong>.
          </p>
          
          <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid ${color}; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #333;">Current Status:</p>
            <p style="margin: 5px 0 0 0; font-size: 18px; color: ${color};">${statusMessage}</p>
          </div>

          <p style="font-size: 14px; color: #777;">
            Login to your dashboard to view full details or download any relevant documents.
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://xpresspoint.net/login" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
          </div>
        </div>
        <div style="background-color: #f1f3f4; padding: 15px; text-align: center; font-size: 12px; color: #888;">
          &copy; ${new Date().getFullYear()} Xpress Point Services.
        </div>
      </div>
    `;

    const textContent = `
Hello ${user.firstName},

Update for ${serviceName}:
${statusMessage}

Please login to your dashboard for more details.
    `.trim();

    // D. Send the Email
    await sendHtmlEmail(user.email, user.firstName, subject, htmlContent, textContent);
    console.log(`[Notification Switch] Email sent successfully to ${user.email}`);

  } catch (error) {
    console.error("Failed to process notification switch:", error);
  }
}
