// 1. Get the API Key from Railway/Env
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDER_EMAIL = 'otp@xpresspoint.net'; // Ensure this sender is authenticated in Brevo
const SENDER_NAME = 'XPRESSPOINT CUSTOMER SUCCESS';

// --- Generic Function to Send Any HTML Email ---
// This is what you use for Admin Broadcasts, OTPs, etc.
export async function sendHtmlEmail(
  toEmail: string,
  toName: string,
  subject: string,
  htmlContent: string
) {
  if (!BREVO_API_KEY) {
    console.error('CRITICAL: BREVO_API_KEY is not set in environment variables.');
    return;
  }

  const payload = {
    sender: {
      email: SENDER_EMAIL,
      name: SENDER_NAME,
    },
    to: [
      { email: toEmail, name: toName }
    ],
    subject: subject,
    htmlContent: htmlContent,
  };

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Brevo API error');
    }
    console.log(`Email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error('Error sending email via Brevo:', error);
  }
}

// --- Specific Function for Account Verification ---
export async function sendVerificationEmail(
  toEmail: string, 
  toName: string, 
  verificationToken: string
) {
  const domain = process.env.APP_URL; // e.g., https://xpresspoint.net or http://localhost:3000
  if (!domain) {
    console.error("CRITICAL: APP_URL is not set. Email links will be broken.");
    return;
  }
  
  const verificationLink = `${domain}/api/auth/verify-email?token=${verificationToken}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #0070f3;">Welcome to Xpress Point, ${toName}!</h2>
      <p>Thank you for registering. To unlock all services and secure your account, please verify your email address.</p>
      
      <div style="margin: 30px 0;">
        <a 
          href="${verificationLink}" 
          style="display: inline-block; padding: 12px 24px; font-size: 16px; color: #ffffff; background-color: #0070f3; text-decoration: none; border-radius: 8px; font-weight: bold;"
        >
          Click to Verify Your Email
        </a>
      </div>

      <p style="font-size: 14px; color: #666;">
        Or copy and paste this link into your browser:<br/>
        <a href="${verificationLink}" style="color: #0070f3;">${verificationLink}</a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999;">If you did not create this account, please ignore this email.</p>
    </div>
  `;

  await sendHtmlEmail(toEmail, toName, 'Verify Your Xpress Point Email Address', htmlContent);
}
