import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';
import { processCommission } from '@/lib/commission'; // <--- 1. IMPORT THIS

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // We declare these outside the try block so they are accessible in catch for refunds
  let vninRequest: any = null;
  let amount: any = null;
  let transactionRef: string | null = null;

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

    amount = service.defaultAgentPrice;

    // 2. Check Wallet Balance
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(amount)) {
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
    }

    // 3. Deduct Funds & Initialize Request (Atomic Transaction)
    const initResult = await prisma.$transaction(async (tx) => {
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

    // Capture these for the error handler
    vninRequest = initResult.vninRequest;
    transactionRef = initResult.transaction.reference;

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
      
      // Update DB to Completed AND Process Commission
      await prisma.$transaction(async (tx) => {
        await tx.vninRequest.update({
          where: { id: vninRequest.id },
          data: {
            status: 'COMPLETED',
            statusMessage: 'Slip Generated Successfully'
          }
        });

        // <--- 2. COMMISSION ADDED HERE
        // This ensures the aggregator gets paid only on success
        await processCommission(tx, user.id, SERVICE_ID);
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Slip Generated',
        pdfBase64: apiData.pdf_base64 
      });
    } 
    
    // 6. Handle Known API Failure
    else {
      const errorMsg = apiData.message || 'External API Failed';
      // Throwing an error here sends us to the catch block, which now handles ALL refunds
      throw new Error(errorMsg); 
    }

  } catch (error: any) {
    console.error("VNIN Slip API Error:", error.message);

    // <--- 3. ROBUST REFUND LOGIC
    // If we have a request ID and amount, it means money was deducted. We MUST refund.
    if (vninRequest && amount) {
       try {
         await prisma.$transaction(async (tx) => {
            // Mark Request Failed
            await tx.vninRequest.update({
              where: { id: vninRequest.id },
              data: { status: 'FAILED', statusMessage: error.message || "Failed" }
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
                description: `Refund: VNIN Slip Failed (${error.message})`,
                reference: `REF-${transactionRef || Date.now()}`,
                status: 'COMPLETED'
              }
            });
         });
         console.log("Auto-refund processed successfully.");
       } catch (refundError) {
         console.error("CRITICAL: Failed to process refund!", refundError);
       }
    }

    // Return a friendly error message
    // If it's a "No Record" error, tell the user explicitly that they were refunded
    const isNoRecord = error.message?.toLowerCase().includes('no record') || error.message?.toLowerCase().includes('not found');
    const clientError = isNoRecord 
      ? "No Record Found. Your wallet has been refunded." 
      : (error.message || "An internal server error occurred");

    return NextResponse.json({ error: clientError }, { status: isNoRecord ? 404 : 500 });
  }
}
