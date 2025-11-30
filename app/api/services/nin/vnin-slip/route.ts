import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { nin } = await request.json();

    if (!nin || nin.length !== 11) {
      return NextResponse.json({ error: 'Invalid NIN provided' }, { status: 400 });
    }

    const SERVICE_ID = 'VNIN_SLIP';

    // 1. Fetch Service & Price
    const service = await prisma.service.findUnique({ where: { id: SERVICE_ID } });
    if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    if (!service.isActive) return NextResponse.json({ error: 'Service is currently unavailable' }, { status: 503 });

    const amount = service.defaultAgentPrice;

    // 2. Check Wallet Balance
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(amount)) {
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
    }

    // 3. Deduct Funds & Initialize Request (Atomic Transaction)
    const { vninRequest, transaction } = await prisma.$transaction(async (tx) => {
      // Deduct
      await tx.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: amount } }
      });

      // Create Transaction Log
      const newTx = await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'SERVICE_CHARGE',
          amount: amount.negated(),
          description: `Charge for VNIN Slip: ${nin}`,
          reference: `VNIN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          status: 'COMPLETED',
          serviceId: SERVICE_ID
        }
      });

      // Create Request Record
      const newReq = await tx.vninRequest.create({
        data: {
          userId: user.id,
          serviceId: SERVICE_ID,
          nin: nin,
          status: 'PROCESSING',
          statusMessage: 'Initiated'
        }
      });

      return { vninRequest: newReq, transaction: newTx };
    });

    // 4. Call External API (DataVerify)
    const apiKey = process.env.DATAVERIFY_API_KEY;
    if (!apiKey) {
      throw new Error("Server Config Error: API Key missing");
    }

    const externalResponse = await axios.post('https://dataverify.com.ng/developers/nin_slips/vnin_slip.php', {
      api_key: apiKey,
      nin: nin
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const apiData = externalResponse.data;

    // 5. Handle Success
    if (apiData.status === 'success' && apiData.pdf_base64) {
      
      // Update DB to Completed
      await prisma.vninRequest.update({
        where: { id: vninRequest.id },
        data: {
          status: 'COMPLETED',
          statusMessage: 'Slip Generated Successfully'
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Slip Generated',
        pdfBase64: apiData.pdf_base64 
      });
    } 
    
    // 6. Handle Failure & Refund
    else {
      const errorMsg = apiData.message || 'External API Failed';

      await prisma.$transaction(async (tx) => {
        // Mark Request Failed
        await tx.vninRequest.update({
          where: { id: vninRequest.id },
          data: { status: 'FAILED', statusMessage: errorMsg }
        });

        // Refund Wallet
        await tx.wallet.update({
          where: { userId: user.id },
          data: { balance: { increment: amount } }
        });

        // Log Refund
        await tx.transaction.create({
          data: {
            userId: user.id,
            type: 'REFUND',
            amount: amount,
            description: `Refund: VNIN Slip Failed (${nin})`,
            reference: `REF-${transaction.reference}`,
            status: 'COMPLETED'
          }
        });
      });

      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

  } catch (error: any) {
    console.error("VNIN Slip API Error:", error);
    return NextResponse.json({ error: "System error occurred. Please try again." }, { status: 500 });
  }
}
