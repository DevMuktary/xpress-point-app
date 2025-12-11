// 1. Get the API Key from Railway/Env
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDER_EMAIL = 'otp@xpresspoint.net'; // Ensure this sender is authenticated in Brevo
const SENDER_NAME = 'XpressPoint Security'; // Changed from "CUSTOMER SUCCESS" to be more specific/trustworthy

// --- Generic Function to Send Any Email (HTML + Text) ---
export async function sendHtmlEmail(
  toEmail: string,
  toName: string,
  subject: string,
  htmlContent: string,
  textContent: string // <--- NEW: Plain text version is CRITICAL for spam prevention
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
    textContent: textContent, // <--- Sent along with HTML
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
  const domain = process.env.APP_URL; 
  if (!domain) {
    console.error("CRITICAL: APP_URL is not set. Email links will be broken.");
    return;
  }
  
  const verificationLink = `${domain}/api/auth/verify-email?token=${verificationToken}`;
  const currentYear = new Date().getFullYear();

  // 1. Plain Text Version (Displayed by Apple Watch, old phones, or spam filters)
  const textContent = `
Welcome to Xpress Point, ${toName}!

Thank you for joining us. To activate your account and start using our services, please verify your email address by visiting the link below:

${verificationLink}

If you did not create this account, please ignore this message.

Xpress Point Team
Lagos, Nigeria
  `.trim();

  // 2. Professional HTML Template
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <style>
    /* Reset styles */
    body { margin: 0; padding: 0; background-color: #f4f4f7; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    table { border-spacing: 0; }
    td { padding: 0; }
    img { border: 0; }
    
    /* Container */
    .wrapper { width: 100%; table-layout: fixed; background-color: #f4f4f7; padding-bottom: 40px; }
    .webkit { max-width: 600px; background-color: #ffffff; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    
    /* Header */
    .header { background-color: #0070f3; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px; }
    
    /* Content */
    .content { padding: 40px 40px 20px 40px; text-align: left; line-height: 1.6; color: #333333; }
    .content h2 { margin-top: 0; color: #1a1a1a; font-size: 20px; }
    .content p { font-size: 16px; margin-bottom: 20px; color: #555555; }
    
    /* Button */
    .button-container { text-align: center; margin: 30px 0; }
    .button { background-color: #0070f3; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s; }
    .button:hover { background-color: #005bb5; }
    
    /* Footer */
    .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee; }
    .footer a { color: #999999; text-decoration: underline; }
    
    /* Responsive */
    @media screen and (max-width: 600px) {
      .content { padding: 20px; }
      .header { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="webkit">
      <div class="header">
        <h1>XPRESS POINT</h1>
      </div>
      
      <div class="content">
        <h2>Hello ${toName},</h2>
        <p>Thanks for registering with Xpress Point. We are excited to have you on board!</p>
        <p>To ensure the security of your account and access all our agency banking features, please verify your email address by clicking the button below.</p>
        
        <div class="button-container">
          <a href="${verificationLink}" class="button">Verify My Account</a>
        </div>
        
        <p style="font-size: 14px; margin-top: 30px;">
          Or copy this link into your browser:<br>
          <a href="${verificationLink}" style="color: #0070f3; word-break: break-all;">${verificationLink}</a>
        </p>
      </div>
      
      <div class="footer">
        <p>You received this email because you signed up for an Xpress Point account.</p>
        <p>
          &copy; ${currentYear} Xpress Point Services.<br>
          United, Nations.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  await sendHtmlEmail(toEmail, toName, 'Action Required: Verify your email', htmlContent, textContent);
}
