import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Using your existing Prisma client

// Force the route to fetch fresh data every time (no caching)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch ONLY the phone numbers from the database
    const users = await prisma.user.findMany({
      select: {
        phoneNumber: true,
      },
      where: {
        phoneNumber: {
          not: "", // Skip any empty records
        }
      }
    });

    // 2. Set up the CSV header
    let csvContent = "PhoneNumber\n";

    // 3. Loop through users and format them into CSV rows
    users.forEach((user) => {
      if (user.phoneNumber) {
        // Wrapping in quotes is a safe CSV practice
        csvContent += `"${user.phoneNumber}"\n`;
      }
    });

    // 4. Return the response as a downloadable CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="xpress_phone_numbers.csv"',
      },
    });

  } catch (error) {
    console.error("❌ Error exporting contacts:", error);
    return new NextResponse("Failed to export contacts", { status: 500 });
  }
}
