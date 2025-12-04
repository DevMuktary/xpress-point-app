import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

// --- Fee Constants ---
const DOB_GAP_FEE_MEDIUM = new Decimal(35000);
const DOB_GAP_FEE_HIGH = new Decimal(45000);   
const NO_DOB_GAP_BANKS = ['FCMB', 'First Bank', 'Keystone Bank'];

// --- NEW: Special Bank Fee ---
const SPECIAL_BANK_FEE = new Decimal(1000);
const SPECIAL_BANKS = ['FCMB', 'Keystone Bank'];

async function calculateFee(serviceId: string, bankType: string, oldDob: string, newDob: string): Promise<Decimal> {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) throw new Error('Service not found.');
  
  let price = new Decimal(service.defaultAgentPrice);

  // 1. Apply Special Bank Fee (FCMB / Keystone)
  if (SPECIAL_BANKS.includes(bankType)) {
    price = price.plus(SPECIAL_BANK_FEE);
  }

  // 2. Apply DOB Gap Fee
  if (serviceId.includes('DOB') && oldDob && newDob) {
    try {
      const oldDate = new Date(oldDob);
      const newDate = new Date(newDob);
      const diffTime = Math.abs(newDate.getTime() - oldDate.getTime());
      const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
      
      if (diffYears > 5) {
        if (NO_DOB_GAP_BANKS.includes(bankType)) {
          throw new Error("DOB modification over 5 years is not supported for this bank.");
        } 
        if (diffYears > 10) {
          price = price.plus(DOB_GAP_FEE_HIGH);
        } else {
          price = price.plus(DOB_GAP_FEE_MEDIUM);
        }
      }
    } catch (e: any) {
      if (e.message.includes("not supported")) throw e;
      // If date parsing fails, we ignore DOB logic (assumed valid dates checked elsewhere or manual entry)
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
    const { serviceId, bankType, formData, passportUrl } = body; 

    if (!serviceId || !formData) {
      return NextResponse.json({ error: 'Required fields missing.' }, { status: 400 });
    }

    // 1. Calculate Price
    const price = await calculateFee(serviceId, bankType, formData.oldDob, formData.newDob);
    
    // 2. Check Wallet
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: `Insufficient funds. Cost: ₦${price.toString()}.` }, { status: 402 });
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new Error("Service not found");

    const priceAsString = price.toString();
    const negatedPriceAsString = price.negated().toString();

    // 3. Transaction
    await prisma.$transaction(async (tx) => {
      // a) Charge User
      await tx.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: priceAsString } },
      });

      // b) Create Request
      await tx.bvnRequest.create({
        data: {
          userId: user.id,
          serviceId: serviceId,
          status: 'PENDING',
          statusMessage: 'Request submitted. Awaiting admin review.',
          formData: { ...formData, bankType } as any,
          uploadedSlipUrl: passportUrl || null,
          newspaperUrl: body.newspaperUrl || null
        },
      });

      // c) Log Transaction
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
