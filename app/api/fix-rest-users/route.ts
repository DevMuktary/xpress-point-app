// app/api/fix-rest-users/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendHtmlEmail } from "@/lib/email"; 

const prisma = new PrismaClient();

const SECRET_KEY = "finish_rest_users"; // Use this key
const LOGIN_URL = "https://www.xpresspoint.net/login";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key !== SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    // 1. FILTER: Only find agents who are NOT verified yet
    // This ensures we do not email people we have already fixed.
    const usersToFix = await prisma.user.findMany({
      where: {
        role: "AGENT",
        isPhoneVerified: false, // <--- This prevents duplicates
      },
      take: 50, // Process 50 at a time to prevent timeout. Refresh to do more.
    });

    if (usersToFix.length === 0) {
      return NextResponse.json({ message: "Everyone is already verified! No emails sent." });
    }

    console.log(`Found ${usersToFix.length} unverified users. Processing...`);

    const currentYear = new Date().getFullYear();
    const subject = "Important: Your Account is Active - Login Now";

    // Text Content
    const textContent = `
Hello,
We apologize for the technical glitch regarding our WhatsApp delivery service. 
We have manually verified your account. You can now login immediately.
Login here: ${LOGIN_URL}
    `.trim();

    // HTML Content Generator
    const generateHtml = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; background-color: #f4f4f7; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; }
    .btn { background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;}
  </style>
</head>
<body>
  <div class="container">
    <h2>Hello ${name},</h2>
    <p>We apologize for the glitch regarding our WhatsApp delivery service.</p>
    <p>We have manually marked your account as <strong>VERIFIED</strong>.</p>
    <a href="${LOGIN_URL}" class="btn">Login Now</a>
    <p style="margin-top:20px; color:#999; font-size:12px;">&copy; ${currentYear} Xpress Point.</p>
  </div>
</body>
</html>
    `;

    let successCount = 0;
    let errorCount = 0;

    // 2. LOOP: Process one by one
    for (const user of usersToFix) {
      try {
        // A. Send Email First
        await sendHtmlEmail(
          user.email,
          user.firstName,
          subject,
          generateHtml(user.firstName),
          textContent
        );

        // B. Update Database ONLY if email didn't crash
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isPhoneVerified: true,
            isEmailVerified: true,
          },
        });

        successCount++;
      } catch (err) {
        console.error(`Failed to process ${user.email}`, err);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: successCount,
      failed: errorCount,
      note: "If there are more users, refresh this page to continue the next batch."
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
