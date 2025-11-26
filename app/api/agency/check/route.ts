import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Clean whitespace from the input code
    const agentCode = body.agentCode?.trim();

    if (!agentCode) {
      return NextResponse.json({ error: 'Agent Code is required.' }, { status: 400 });
    }

    // 1. Search the Uploaded Results Table directly
    // We do NOT check the User table anymore. We check if this code exists in the uploaded reports.
    const results = await prisma.bvnEnrollmentResult.findMany({
      where: { agentCode: agentCode },
      orderBy: { updatedAt: 'desc' }, // Show most recent updates first
      take: 100,
    });

    if (results.length === 0) {
      return NextResponse.json({ error: 'No records found for this Agent Code. Please check the code or check back later.' }, { status: 404 });
    }

    // 2. Extract Agent Info from the file data itself
    // Since all rows for this code *should* belong to the same agent, we pick the first one.
    const identityRow = results[0];
    
    const agentInfo = {
      name: identityRow.agentName || 'Unknown Agent', 
      business: identityRow.institutionName || 'NIBSS Agent' 
    };

    // 3. Serialize Dates for the frontend
    const serializedResults = results.map(r => ({
      id: r.id,
      ticketNumber: r.ticketNumber,
      bvn: r.bvn,
      status: r.status,
      message: r.message,
      updatedAt: r.updatedAt.toISOString(),
      // Pass these along just in case we want to show them per row
      institutionName: r.institutionName,
      agentName: r.agentName,
      agentCode: r.agentCode,
      bmsImportId: r.bmsImportId
    }));

    return NextResponse.json({ 
      agent: agentInfo,
      results: serializedResults 
    });

  } catch (error: any) {
    console.error("Agency Check Error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}


