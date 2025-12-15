import nodemailer from 'nodemailer';

// --- Configuration ---
// These are pulled from your .env file
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.zeptomail.com'; // ZeptoMail Host
const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;
const SMTP_USER = process.env.SMTP_USER; // This will be 'emailapikey'
const SMTP_PASS = process.env.SMTP_PASS; // Your long API key
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'no-reply@xpresspoint.net'; // Must be a verified sender in ZeptoMail
const SENDER_NAME = 'Xpress Point Security';

// --- Create Transporter ---
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // True for 465 (SSL), False for 587 (TLS)
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// --- Generic Function to Send Any Email (HTML + Text) ---
export async function sendHtmlEmail(
  toEmail: string,
  toName: string,
  subject: string,
  htmlContent: string,
  textContent: string
) {
  if (!SMTP_USER || !SMTP_PASS) {
    console.error('CRITICAL: SMTP credentials are not set in environment variables.');
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`, 
      to: `"${toName}" <${toEmail}>`,             
      subject: subject,                           
      text: textContent,                          
      html: htmlContent,                          
    });

    console.log(`Email sent successfully to ${toEmail}. Message ID: ${info.messageId}`);
  } catch (error) {
    console.error('Error sending email via Nodemailer:', error);
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

  // 1. Plain Text Version
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
    body { margin: 0; padding: 0; background-color: #f4f4f7; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f4f4f7; padding-bottom: 40px; }
    .webkit { max-width: 600px; background-color: #ffffff; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .header { background-color: #0070f3; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px; }
    .content { padding: 40px 40px 20px 40px; text-align: left; line-height: 1.6; color: #333333; }
    .content h2 { margin-top: 0; color: #1a1a1a; font-size: 20px; }
    .content p { font-size: 16px; margin-bottom: 20px; color: #555555; }
    .button-container { text-align: center; margin: 30px 0; }
    .button { background-color: #0070f3; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s; }
    .button:hover { background-color: #005bb5; }
    .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee; }
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
        <p>To ensure the security of your account, please verify your email address by clicking the button below.</p>
        
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
        <p>&copy; ${currentYear} Xpress Point Services.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  await sendHtmlEmail(toEmail, toName, 'Action Required: Verify your email', htmlContent, textContent);
}
