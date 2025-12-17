import axios from 'axios';
import { prisma } from '@/lib/prisma';
import { sendHtmlEmail } from '@/lib/email';

const WHATSAPP_API_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_FROM_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_API_URL = `https://graph.facebook.com/v19.0/${WHATSAPP_FROM_PHONE_ID}/messages`;

// --- Helper: Format Phone Number for Meta ---
function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  let clean = phone.replace(/\D/g, ''); 
  if (clean.startsWith('0')) {
    clean = '234' + clean.substring(1);
  }
  return clean;
}

// --- 1. OTP FUNCTION (Stays on WhatsApp) ---
export async function sendOtpMessage(to: string, otpCode: string) {
  if (!WHATSAPP_API_TOKEN || !WHATSAPP_FROM_PHONE_ID) {
    console.error("WhatsApp Config Missing");
    return;
  }
  
  const formattedTo = formatPhoneNumber(to);

  const payload = {
    messaging_product: 'whatsapp',
    to: formattedTo,
    type: 'template',
    template: {
      name: 'otp_verification',
      language: { code: 'en_GB' },
      components: [
        {
          type: 'body',
          parameters: [{ type: 'text', text: otpCode }],
        },
        {
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [{ type: 'text', text: otpCode }],
        },
      ],
    },
  };

  try {
    await axios.post(WHATSAPP_API_URL, payload, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`WhatsApp OTP sent to: ${formattedTo}`);
  } catch (error: any) {
    console.error("WhatsApp OTP Error:", JSON.stringify(error.response?.data || error.message, null, 2));
  }
}

// --- 2. STATUS NOTIFICATION (Switched to Email) ---
export async function sendStatusNotification(to: string, serviceName: string, newStatus: string) {
  try {
    console.log(`[Notification Switch] converting WhatsApp call for ${to} to Email...`);

    // A. Find the user's email using the phone number
    // We try multiple formats to ensure we find the user
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { phoneNumber: to },
          { phoneNumber: formatPhoneNumber(to) }, // Try 234 format
          { phoneNumber: '0' + to.replace(/^234/, '') } // Try 080 format
        ]
      },
      select: { email: true, firstName: true }
    });

    if (!user || !user.email) {
      console.warn(`[Notification Failed] Could not find email for phone number: ${to}`);
      return;
    }

    // B. Determine Color based on status text
    const isSuccess = newStatus.toLowerCase().includes('success') || newStatus.toLowerCase().includes('completed') || newStatus.toLowerCase().includes('approved');
    const isFailure = newStatus.toLowerCase().includes('fail') || newStatus.toLowerCase().includes('reject');
    
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
            <p style="margin: 5px 0 0 0; font-size: 18px; color: ${color}; text-transform: uppercase;">${newStatus}</p>
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
${newStatus}

Please login to your dashboard for more details.
    `.trim();

    // D. Send the Email
    await sendHtmlEmail(user.email, user.firstName, subject, htmlContent, textContent);
    console.log(`[Notification Switch] Email sent successfully to ${user.email}`);

  } catch (error) {
    console.error("Failed to process notification switch:", error);
  }
}
