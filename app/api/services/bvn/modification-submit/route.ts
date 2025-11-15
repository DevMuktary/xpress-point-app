import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

// --- Fee Constants (Your Design) ---
const DOB_GAP_FEE_STANDARD = new Decimal(2000);
const DOB_GAP_FEE_SPECIAL = new Decimal(4000);
const SPECIAL_BANKS = ['Agency BVN', 'B.O.A', 'NIBSS Microfinance', 'Enterprise Bank', 'Heritage Bank'];
const NO_DOB_GAP_BANKS = ['FCMB', 'First Bank', 'Keystone Bank'];
// ------------------------------------

// "World-class" helper to calculate the fee securely
async function calculateFee(userRole: string, serviceId: string, bankType: string, oldDob: string, newDob: string): Promise<Decimal> {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) throw new Error('Service not found.');

  let price = userRole === 'AGGREGATOR' 
    ? service.platformPrice 
    : service.defaultAgentPrice;

  // --- "World-Class" Dynamic Fee Logic (Secure) ---
  if (serviceId.includes('DOB') && oldDob && newDob) {
    try {
      const oldDate = new Date(oldDob);
      const newDate = new Date(newDob);
      const diffTime = Math.abs(newDate.getTime() - oldDate.getTime());
      const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
      
      if (diffYears > 5) {
        if (NO_DOB_GAP_BANKS.includes(bankType)) {
          throw new Error("DOB modification over 5 years is not supported for this bank.");
        } else if (SPECIAL_BANKS.includes(bankType)) {
          price = price.plus(DOB_GAP_FEE_SPECIAL); // Add ₦4000
        } else {
          price = price.plus(DOB_GAP_FEE_STANDARD); // Add ₦2000
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
    const { serviceId, bankType, formData } = body; 

    if (!serviceId || !formData || !bankType) {
      return NextResponse.json({ error: 'Service ID, Bank Type, and Form Data are required.' }, { status: 400 });
    }

    // --- 1. Securely Calculate Price & Check Wallet ---
    const price = await calculateFee(
      user.role, 
      serviceId, 
      bankType, 
      formData.oldDob, 
      formData.newDob
    );
    
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: `Insufficient funds. This service costs ₦${price}.` }, { status: 402 });
    }

    // --- 2. Charge User & Save as PENDING ---
    const service = await prisma.service.findUnique({ where: { id: serviceId } }); // Get service name
    
    await prisma.$transaction([
      // a) Charge wallet
      prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: price } },
      }),
      // b) Create the new request
      prisma.bvnRequest.create({
        data: {
          userId: user.id,
          serviceId: serviceId,
          status: 'PENDING',
          statusMessage: 'Request submitted. Awaiting admin review.',
          formData: formData as any,
          // We add the bankType to the formData JSON for the Admin
          ...{ formData: { ...formData, bankType } }
        },
      }),
      // c) Log the transaction
      prisma.transaction.create({
        data: {
          userId: user.id,
          serviceId: serviceId,
          type: 'SERVICE_CHARGE',
          amount: price.negated(), // Charge the FINAL dynamic price
          description: `${service?.name || 'BVN Mod'} (${formData.bvn})`,
          reference: `BVN-MOD-${Date.now()}`,
          status: 'COMPLETED',
        },
      }),
    ]);

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
