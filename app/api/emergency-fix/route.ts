// app/api/emergency-fix/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendHtmlEmail } from "@/lib/email"; // Adjust path if your lib is elsewhere

const prisma = new PrismaClient();

// ---------------------------------------------------------
// CONFIGURATION
// ---------------------------------------------------------
// You must add ?key=xpress_fix_2025 to the URL to run this
const SECRET_KEY = "xpress_fix_2025"; 
const LOGIN_URL = "https://www.xpresspoint.net/login"; // Ensure this link is correct
// ---------------------------------------------------------

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  // 1. Security Check
  if (key !== SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized. Wrong key." }, { status: 401 });
  }

  try {
    // 2. Update Database: Mark all AGENTS as verified
    // We update isPhoneVerified and isEmailVerified to true
    const updateResult = await prisma.user.updateMany({
      where: {
        role: "AGENT", // Targeting agents as requested
      },
      data: {
        isPhoneVerified: true,
        isEmailVerified: true,
      },
    });

    console.log(`[DB UPDATE] Updated ${updateResult.count} users to verified status.`);

    // 3. Fetch all Agents to send the email
    // We fetch only the fields we need to save memory
    const users = await prisma.user.findMany({
      where: {
        role: "AGENT",
      },
      select: {
        email: true,
        firstName: true,
      },
    });

    console.log(`[EMAIL] preparing to send emails to ${users.length} users.`);

    // 4. Define the Email Content
    const currentYear = new Date().getFullYear();
    const subject = "Important: Your Account is Active - Login Now";

    // Text Version
    const textContent = `
Hello,

We apologize for the technical glitch regarding our WhatsApp delivery service. 

We have manually verified your account. You can now login immediately with your password and start using our services.

Login here: ${LOGIN_URL}

Thank you for choosing Xpress Point.
`.trim();

    // HTML Version
    const generateHtml = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; }
    .header { background-color: #0070f3; padding: 20px; text-align: center; color: #ffffff; }
    .content { padding: 30px; color: #333; line-height: 1.6; }
    .btn { display: inline-block; background-color: #0070f3; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold; margin-top: 20px; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Account Update</h1>
    </div>
    <div class="content">
      <h2>Hello ${name},</h2>
      <p>We sincerely apologize for the recent technical glitch regarding our WhatsApp delivery service.</p>
      <p><strong>Good news:</strong> We have manually marked your phone number and email as <strong>VERIFIED</strong>.</p>
      <p>You can now login with your password and start using Xpress Point services immediately.</p>
      
      <div style="text-align: center;">
        <a href="${LOGIN_URL}" class="btn">Login to Dashboard</a>
      </div>
      
      <p style="margin-top: 30px;">Thank you for your patience and understanding.</p>
    </div>
    <div class="footer">
      &copy; ${currentYear} Xpress Point Security.
    </div>
  </div>
</body>
</html>
    `;

    // 5. Send Emails (Loop)
    // We use a loop to send them one by one.
    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        await sendHtmlEmail(
          user.email,
          user.firstName,
          subject,
          generateHtml(user.firstName),
          textContent
        );
        successCount++;
      } catch (err) {
        console.error(`Failed to send to ${user.email}`, err);
        errorCount++;
      }
    }

    // 6. Return Success Report
    return NextResponse.json({
      success: true,
      database_updated_count: updateResult.count,
      emails_attempted: users.length,
      emails_sent_successfully: successCount,
      emails_failed: errorCount,
    });

  } catch (error: any) {
    console.error("Emergency Fix Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
