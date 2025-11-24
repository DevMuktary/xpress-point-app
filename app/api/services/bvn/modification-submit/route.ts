import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';
import { processCommission } from '@/lib/commission'; // <--- THE FIX

// --- Fee Constants ---
const DOB_GAP_FEE_MEDIUM = new Decimal(35000); // 6-10 years
const DOB_GAP_FEE_HIGH = new Decimal(45000);   // > 10 years
const NO_DOB_GAP_BANKS = ['FCMB', 'First Bank', 'Keystone Bank'];

// Helper function to calculate the fee securely
async function calculateFee(userRole: string, serviceId: string, bankType: string, oldDob: string, newDob: string): Promise<Decimal> {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) throw new Error('Service not found.');

  // 1. Base Price (Everyone pays defaultAgentPrice)
  let price = new Decimal(service.defaultAgentPrice);

  // 2. Dynamic Fee Logic
  if (serviceId.includes('DOB') && oldDob && newDob) {
    try {
      const oldDate = new Date(oldDob);
      const newDate = new Date(newDob);
      const diffTime = Math.abs(newDate.getTime() - oldDate.getTime());
      // Calculate difference in years (approximate)
      const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
      
      if (diffYears > 5) {
        // Check Bank Restriction
        if (NO_DOB_GAP_BANKS.includes(bankType)) {
          throw new Error("DOB modification over 5 years is not supported for this bank.");
        } 
        
        // Apply New Fees
        if (diffYears > 10) {
          price = price.plus(DOB_GAP_FEE_HIGH); // Add 45k
        } else {
          // Between 5 and 10 years
          price = price.plus(DOB_GAP_FEE_MEDIUM); // Add 35k
        }
      }
    } catch (e: any) {
      if (e.message.includes("not supported")) throw e;
      throw new Error("Invalid date format provided for DOB.");
    }
  }
  return price;
}

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      serviceId, 
      bankType, 
      formData, 
      // File URLs from Client
      passportUrl, 
      attestationUrl
    } = body; 

    if (!serviceId || !formData || !bankType) {
      return NextResponse.json({ error: 'Service ID, Bank Type, and Form Data are required.' }, { status: 400 });
    }

    // --- 1. Securely Calculate Price ---
    const price = await calculateFee(
      user.role, 
      serviceId, 
      bankType, 
      formData.oldDob, 
      formData.newDob
    );
    
    // --- 2. Check Wallet ---
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: `Insufficient funds. This service costs ₦${price.toString()}.` }, { status: 402 });
    }

    // --- 3. Prepare Data ---
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    const finalFormData = {
      ...formData,
      bankType,
      attestationUrl // Save attestation URL in JSON as backup
    };
    
    const priceAsString = price.toString();
    const negatedPriceAsString = price.negated().toString();

    // --- 4. Execute Transaction ---
    await prisma.$transaction(async (tx) => {
      // a) Charge User Wallet
      await tx.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: priceAsString } },
      });

      // b) PAY THE AGGREGATOR (The Definite Fix)
      // This will check for specific overrides, fall back to global default, and credit wallet instantly.
      await processCommission(tx, user.id, serviceId);

      // c) Create Request
      await tx.bvnRequest.create({
        data: {
          userId: user.id,
          serviceId: serviceId,
          status: 'PENDING',
          statusMessage: 'Request submitted. Awaiting admin review.',
          formData: finalFormData as any,
          
          // Map the files
          uploadedSlipUrl: passportUrl || null, // Passport goes here
          newspaperUrl: body.newspaperUrl || null // Map newspaper if present
        },
      });

      // d) Log Transaction
      await tx.transaction.create({
        data: {
          userId: user.id,
          serviceId: serviceId,
          type: 'SERVICE_CHARGE',
          amount: negatedPriceAsString,
          description: `${service?.name || 'BVN Mod'} (${formData.bvn})`,
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
