import * as Brevo from '@getbrevo/brevo';

// 1. Initialize the Brevo API client
const apiInstance = new Brevo.TransactionalEmailsApi();
const BREVO_API_KEY = process.env.BREVO_API_KEY;

if (!BREVO_API_KEY) {
  console.error("CRITICAL: BREVO_API_KEY is not set.");
} else {
  apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey, 
    BREVO_API_KEY
  );
}

// 2. Define the email function
export async function sendVerificationEmail(
  toEmail: string, 
  toName: string, 
  verificationToken: string
) {
  // --- THIS IS THE FIX ---
  // We use APP_URL, which is a server-side variable
  const domain = process.env.APP_URL; 
  if (!domain) {
    console.error("CRITICAL: APP_URL is not set. Email links will be broken.");
    return; // Stop if the URL is missing
  }
  // -----------------------

  const sender = {
    email: 'verify@xpresspoint.net', // Your "from" email
    name: 'Xpress Point',
  };
  
  const recipient = [{ email: toEmail, name: toName }];
  
  // 3. Create the verification link
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

  // 5. Send the email
  try {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.sender = sender;
    sendSmtpEmail.to = recipient;
    sendSmtpEmail.subject = 'Verify Your Xpress Point Email Address';
    sendSmtpEmail.htmlContent = htmlContent;
    
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Email verification sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending email via Brevo:', error);
  }
}
