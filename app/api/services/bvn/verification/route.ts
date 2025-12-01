import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';

// --- Configuration ---
const DATAVERIFY_API_KEY = process.env.DATAVERIFY_API_KEY;

// Endpoints
const URL_PREMIUM = 'https://dataverify.com.ng/developers/bvn_slip/bvn_premium.php';
const URL_STANDARD = 'https://dataverify.com.ng/developers/bvn_slip/bvn_premium.php'; // Standard endpoint pattern

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!DATAVERIFY_API_KEY) {
    return NextResponse.json({ error: 'Server configuration error (API Key).' }, { status: 500 });
  }

  try {
    const { bvn, type } = await request.json(); // type = 'PREMIUM' | 'STANDARD'

    if (!bvn || bvn.length !== 11) {
      return NextResponse.json({ error: 'Invalid BVN provided' }, { status: 400 });
    }

    // 1. Determine Service ID & URL
    let serviceId = '';
    let apiUrl = '';

    if (type === 'PREMIUM') {
      serviceId = 'BVN_VERIFY_PREMIUM';
      apiUrl = URL_PREMIUM;
    } else {
      serviceId = 'BVN_VERIFY_SLIP'; // Standard
      apiUrl = URL_STANDARD;
    }

    // 2. Get Service & Price
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'Service is currently unavailable' }, { status: 503 });
    }

    const amount = service.defaultAgentPrice;

    // 3. Check Wallet Balance
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(amount)) {
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
    }

    // 4. Deduct Funds & Initialize Request (Atomic)
    const { bvnRequest, transaction } = await prisma.$transaction(async (tx) => {
      // Deduct
      await tx.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: amount } }
      });

      // Log Transaction
      const newTx = await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'SERVICE_CHARGE',
          amount: amount.negated(),
          description: `BVN Verification (${type}) - ${bvn}`,
          reference: `BVN-${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          status: 'COMPLETED',
          serviceId: serviceId
        }
      });

      // Create Request Record
      const newReq = await tx.bvnRequest.create({
        data: {
          userId: user.id,
          serviceId: serviceId,
          status: 'PROCESSING',
          statusMessage: 'Initiated',
          formData: { bvn, type } // Store input details
        }
      });

      return { bvnRequest: newReq, transaction: newTx };
    });

    // 5. Call External API
    const externalResponse = await axios.post(apiUrl, {
      api_key: DATAVERIFY_API_KEY,
      bvn: bvn
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const apiData = externalResponse.data;

    // 6. Handle Success
    // The API returns status: 'success' and pdf_base64 on success
    if (apiData.status === 'success' && apiData.pdf_base64) {
      
      // Update DB to Completed
      await prisma.bvnRequest.update({
        where: { id: bvnRequest.id },
        data: {
          status: 'COMPLETED',
          statusMessage: 'Slip Generated Successfully',
          // We don't store base64 in DB to save space, but we could store 'success'
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Slip Generated',
        pdfBase64: apiData.pdf_base64,
        userData: apiData.user_data // Optional: Send back preview data if needed
      });
    } 
    
    // 7. Handle Failure & Refund
    else {
      const errorMsg = apiData.message || 'External API Failed';

      await prisma.$transaction(async (tx) => {
        // Mark Failed
        await tx.bvnRequest.update({
          where: { id: bvnRequest.id },
          data: { status: 'FAILED', statusMessage: errorMsg }
        });

        // Refund
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
            description: `Refund: BVN Verify Failed (${bvn})`,
            reference: `REF-${transaction.reference}`,
            status: 'COMPLETED'
          }
        });
      });

      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

  } catch (error: any) {
    console.error("BVN Verify API Error:", error);
    return NextResponse.json({ error: "No Record Found, Please check and try again." }, { status: 500 });
  }
}
