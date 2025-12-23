// app/api/fix-identity/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ---------------------------------------------------------
// CONFIGURATION
// Add ?key=verify_identities_now to the URL to run this
const SECRET_KEY = "verify_identities_now"; 
// ---------------------------------------------------------

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  // 1. Security Check
  if (key !== SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized. Wrong key." }, { status: 401 });
  }

  try {
    // 2. Update Database: Mark isIdentityVerified = true for ALL Agents
    const updateResult = await prisma.user.updateMany({
      where: {
        role: "AGENT", // Targeting agents specifically
      },
      data: {
        isIdentityVerified: true, // <--- The specific field you requested
        // You can add others here if needed (e.g., isPhoneVerified: true)
      },
    });

    console.log(`[DB UPDATE] Successfully verified identity for ${updateResult.count} agents.`);

    // 3. Return Success Report
    return NextResponse.json({
      success: true,
      message: "Database updated successfully",
      records_updated: updateResult.count,
    });

  } catch (error: any) {
    console.error("Identity Fix Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
