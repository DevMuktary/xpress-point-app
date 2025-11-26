import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentCode } = body;

    if (!agentCode || agentCode.length !== 6) {
      return NextResponse.json({ error: 'Invalid Agent Code.' }, { status: 400 });
    }

    // 1. Verify Agent Code Exists
    const agent = await prisma.user.findUnique({
      where: { agentCode: agentCode },
      select: { 
        firstName: true, 
        lastName: true, 
        businessName: true 
      }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent Code not found.' }, { status: 404 });
    }

    // 2. Fetch Results
    // We fetch the last 100 records for this agent
    const results = await prisma.bvnEnrollmentResult.findMany({
      where: { agentCode: agentCode },
      orderBy: { updatedAt: 'desc' },
      take: 100,
      select: {
        id: true,
        ticketNumber: true,
        bvn: true,
        status: true,
        message: true,
        updatedAt: true,
        agentName: true // Just in case the CSV name differs slightly
      }
    });

    // 3. Serialize Dates
    const serializedResults = results.map(r => ({
      ...r,
      updatedAt: r.updatedAt.toISOString()
    }));

    return NextResponse.json({ 
      agent: {
        name: `${agent.firstName} ${agent.lastName}`,
        business: agent.businessName
      },
      results: serializedResults 
    });

  } catch (error: any) {
    console.error("Agency Check Error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
