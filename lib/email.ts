// 1. Get the API Key from Railway
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// 2. Define the email function
export async function sendVerificationEmail(
  toEmail: string, 
  toName: string, 
  verificationToken: string
) {
  if (!BREVO_API_KEY) {
    console.error('CRITICAL: BREVO_API_KEY is not set in environment variables.');
    return; // Do not attempt to send
  }

  // 3. Create the verification link
  const domain = process.env.APP_URL; // Uses the variable from our last step
  if (!domain) {
    console.error("CRITICAL: APP_URL is not set. Email links will be broken.");
    return; // Stop if the URL is missing
  }
  const verificationLink = `${domain}/api/auth/verify-email?token=${verificationToken}`;

  // 4. Create the HTML for the email
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

  // 5. Create the Brevo API payload
  const payload = {
    sender: {
      email: 'no-reply@xpresspoint.net', // Your "from" email
      name: 'Xpress Point',
    },
    to: [
      { email: toEmail, name: toName }
    ],
    subject: 'Verify Your Xpress Point Email Address',
    htmlContent: htmlContent,
  };

  // 6. Send the email using fetch
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
      // If Brevo sends an error
      const errorData = await response.json();
      throw new Error(errorData.message || 'Brevo API error');
    }

    console.log(`Email verification sent to ${toEmail}`);

  } catch (error) {
    console.error('Error sending email via Brevo:', error);
  }
}
