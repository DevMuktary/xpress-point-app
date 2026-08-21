import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Keeping the curly braces so Railway doesn't crash!

// Force the route to fetch fresh data every time (no caching)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch ONLY the emails from the database
    const users = await prisma.user.findMany({
      select: {
        email: true,
      },
      where: {
        email: {
          not: "", // Skip any empty records just in case
        }
      }
    });

    // 2. Set up the CSV header
    let csvContent = "Email\n";

    // 3. Loop through users and format them into CSV rows
    users.forEach((user) => {
      if (user.email) {
        // Wrapping in quotes is a safe CSV practice
        csvContent += `"${user.email}"\n`;
      }
    });

    // 4. Return the response as a downloadable CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="xpress_emails.csv"',
      },
    });

  } catch (error) {
    console.error("❌ Error exporting emails:", error);
    return new NextResponse("Failed to export emails", { status: 500 });
  }
}
