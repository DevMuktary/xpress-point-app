import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';
// import { processCommission } from '@/lib/commission'; // <--- DELETE or COMMENT OUT THIS IMPORT

// ... (Keep Fee Constants & calculateFee helper exactly as they are) ...

// --- Fee Constants ---
const DOB_GAP_FEE_MEDIUM = new Decimal(35000); 
const DOB_GAP_FEE_HIGH = new Decimal(45000);   
const NO_DOB_GAP_BANKS = ['FCMB', 'First Bank', 'Keystone Bank'];

async function calculateFee(serviceId: string, oldDob: string, newDob: string): Promise<Decimal> {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) throw new Error('Service not found.');
  let price = new Decimal(service.defaultAgentPrice);

  if (serviceId.includes('NIN_MOD_DOB') && oldDob && newDob) {
    try {
      const oldDate = new Date(oldDob);
      const newDate = new Date(newDob);
      const diffTime = Math.abs(newDate.getTime() - oldDate.getTime());
      const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
      
      if (diffYears > 5) {
        if (diffYears > 10) {
          price = price.plus(DOB_GAP_FEE_HIGH);
        } else {
          price = price.plus(DOB_GAP_FEE_MEDIUM);
        }
      }
    } catch {
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
    const { serviceId, bankType, formData, attestationUrl, passportUrl } = body; 

    if (!serviceId || !formData) {
      return NextResponse.json({ error: 'Service ID and Form Data are required.' }, { status: 400 });
    }

    const price = await calculateFee(serviceId, formData.oldDob, formData.newDob);
    
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: `Insufficient funds. This service costs ₦${price.toString()}.` }, { status: 402 });
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new Error("Service not found");

    const priceAsString = price.toString();
    const negatedPriceAsString = price.negated().toString();
    
    await prisma.$transaction(async (tx) => {
      // a) Charge User Wallet
      await tx.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: priceAsString } },
      });

      // NOTE: processCommission IS REMOVED FROM HERE.
      // We wait until Admin completes the job.

      // b) Create Modification Request
      await tx.modificationRequest.create({
        data: {
          userId: user.id,
          serviceId: serviceId,
          status: 'PENDING',
          statusMessage: 'Request submitted. Awaiting admin review.',
          formData: formData as any,
          attestationUrl: attestationUrl || null,
          uploadedSlipUrl: passportUrl || null,
        },
      });

      // c) Log Transaction
      await tx.transaction.create({
        data: {
          userId: user.id,
          serviceId: serviceId,
          type: 'SERVICE_CHARGE',
          amount: negatedPriceAsString,
          description: `${service?.name || 'NIN Mod'} (${formData.nin})`,
          reference: `NIN-MOD-${Date.now()}`,
          status: 'COMPLETED',
        },
      });
    });

    return NextResponse.json(
      { message: 'Request submitted! Please go to the NIN Modification History page to monitor your status.' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error(`NIN Mod (Submit) Error:`, error.message);
    return NextResponse.json(
      { error: error.message || "An internal server error occurred." },
      { status: 500 }
    );
  }
}
