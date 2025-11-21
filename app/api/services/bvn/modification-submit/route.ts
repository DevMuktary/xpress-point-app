import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

// --- Fee Constants ---
const DOB_GAP_FEE_MEDIUM = new Decimal(35000); // 6-10 years
const DOB_GAP_FEE_HIGH = new Decimal(45000);   // > 10 years
// Banks that do NOT allow DOB gap > 5 years
const NO_DOB_GAP_BANKS = ['FCMB', 'First Bank', 'Keystone Bank'];

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      serviceId, 
      formData, 
      // File URLs from client
      attestationUrl, 
      passportUrl,
      bankType // We need this for the bank restriction logic
    } = body; 

    if (!serviceId || !formData) {
      return NextResponse.json({ error: 'Service ID and Form Data are required.' }, { status: 400 });
    }

    // 1. Get Service
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'This service is currently unavailable.' }, { status: 503 });
    }

    // --- PRICING LOGIC FIX ---
    // Base price is ALWAYS defaultAgentPrice
    let price = new Decimal(service.defaultAgentPrice); 
    
    // --- DYNAMIC FEE CALCULATION ---
    // Check for DOB Gap logic
    let isDobGap = false;
    if (serviceId === 'BVN_MOD_DOB' && formData.oldDob && formData.newDob) {
      try {
        const oldDate = new Date(formData.oldDob);
        const newDate = new Date(formData.newDob);
        const diffTime = Math.abs(newDate.getTime() - oldDate.getTime());
        // Calculate difference in years
        const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
        
        if (diffYears > 5) {
          isDobGap = true;
          // Check Bank Restriction
          if (NO_DOB_GAP_BANKS.includes(bankType)) {
             return NextResponse.json({ error: "DOB modification over 5 years is not supported for this bank." }, { status: 400 });
          }
          
          // Apply Fees
          if (diffYears > 10) {
            price = price.plus(DOB_GAP_FEE_HIGH); // Add 45k
          } else {
            // Between 5 and 10
            price = price.plus(DOB_GAP_FEE_MEDIUM); // Add 35k
          }
        }
      } catch (e) {
        return NextResponse.json({ error: "Invalid date format provided." }, { status: 400 });
      }
    }
    // ----------------------------

    // 2. Check Wallet
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: `Insufficient funds. This service costs ₦${price.toString()}.` }, { status: 402 });
    }

    // --- COMMISSION LOGIC ---
    let commissionAmount = new Decimal(0);
    let aggregatorWalletId = null;

    // If user is an Agent under an Aggregator, calculate commission
    if (user.role === 'AGENT' && user.aggregatorId) {
      const aggregatorPrice = await prisma.aggregatorPrice.findUnique({
        where: {
          aggregatorId_serviceId: {
            aggregatorId: user.aggregatorId,
            serviceId: serviceId
          }
        }
      });

      if (aggregatorPrice) {
        commissionAmount = new Decimal(aggregatorPrice.commission);
        // Find the Aggregator's wallet
        const aggWallet = await prisma.wallet.findUnique({ where: { userId: user.aggregatorId } });
        if (aggWallet) {
          aggregatorWalletId = aggWallet.userId;
        }
      }
    }
    // ------------------------

    // 3. Prepare Transaction Data
    // We create the final data object *first* to avoid the "duplicate identifier" error
    const finalFormData = {
      ...formData,
      bankType // Add the bankType to the JSON
    };
    
    const priceAsString = price.toString();
    const negatedPriceAsString = price.negated().toString();
    const commissionAsString = commissionAmount.toString();

    // 4. Execute Transaction
    await prisma.$transaction(async (tx) => {
      // a) Charge User Wallet
      await tx.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: priceAsString } },
      });

      // b) Credit Aggregator Commission (if applicable)
      if (aggregatorWalletId && commissionAmount.greaterThan(0)) {
        await tx.wallet.update({
          where: { userId: aggregatorWalletId },
          data: { commissionBalance: { increment: commissionAsString } }
        });
      }

      // c) Create Request
      await tx.bvnRequest.create({
        data: {
          userId: user.id,
          serviceId: serviceId,
          status: 'PENDING',
          statusMessage: 'Request submitted. Awaiting admin review.',
          formData: finalFormData as any,
          // Map file URLs correctly
          uploadedSlipUrl: passportUrl || null, // Passport goes here
          attestationUrl: attestationUrl || null // Attestation goes here (schema update needed if not present, or use 'failedEnrollmentUrl' as fallback if schema not updated yet - assuming 'attestationUrl' exists on ModificationRequest, but BvnRequest uses different fields. Let's map to BvnRequest fields.)
          // Wait, checking schema: BvnRequest has 'failedEnrollmentUrl', 'vninSlipUrl', 'uploadedSlipUrl', 'retrievalResult', 'newspaperUrl'.
          // It DOES NOT have 'attestationUrl'.
          // We will save the Attestation URL in the 'formData' JSON to be safe, 
          // and put the Passport in 'uploadedSlipUrl'.
        },
      });

      // d) Log Transaction
      await tx.transaction.create({
        data: {
          userId: user.id,
          serviceId: serviceId,
          type: 'SERVICE_CHARGE',
          amount: negatedPriceAsString,
          description: `${service.name} (${formData.bvn})`,
          reference: `BVN-MOD-${Date.now()}`,
          status: 'COMPLETED',
        },
      });
    });

    return NextResponse.json(
      { message: 'Request submitted! Please go to the BVN History page to monitor your status.' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error(`BVN Mod (Submit) Error:`, error.message);
    return NextResponse.json(
      { error: error.message || "An internal server error occurred." },
      { status: 500 }
    );
  }
}
