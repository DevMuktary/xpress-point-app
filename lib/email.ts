// 1. Get the API Key from Railway
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDER_EMAIL = 'no-reply@xpresspoint.net';
const SENDER_NAME = 'Xpress Point';

// --- Generic Function to Send Any HTML Email ---
export async function sendHtmlEmail(
  toEmail: string,
  toName: string,
  subject: string,
  htmlContent: string
) {
  if (!BREVO_API_KEY) {
    console.error('CRITICAL: BREVO_API_KEY is not set.');
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
    console.log(`Email sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending email via Brevo:', error);
  }
}

// --- Specific Function for Verification (Uses the generic one) ---
export async function sendVerificationEmail(
  toEmail: string, 
  toName: string, 
  verificationToken: string
) {
  const domain = process.env.APP_URL;
  if (!domain) {
    console.error("CRITICAL: APP_URL is not set.");
    return;
  }
  
  const verificationLink = `${domain}/api/auth/verify-email?token=${verificationToken}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #0070f3;">Welcome to Xpress Point, ${toName}!</h2>
      <p>Thank you for registering. Please verify your email address to unlock all services.</p>
      <a 
        href="${verificationLink}" 
        style="display: inline-block; padding: 12px 24px; margin: 20px 0; font-size: 16px; color: #ffffff; background-color: #0070f3; text-decoration: none; border-radius: 8px;"
      >
        Click to Verify Your Email
      </a>
      <p>If you did not create this account, please ignore this email.</p>
    </div>
  `;

  await sendHtmlEmail(toEmail, toName, 'Verify Your Xpress Point Email Address', htmlContent);
}
