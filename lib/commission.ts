import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function processCommission(
  tx: any, // The Prisma Transaction Client
  userId: string,
  serviceId: string
) {
  console.log(`[COMMISSION DEBUG] ------------------------------------------------`);
  console.log(`[COMMISSION DEBUG] Starting for Agent: ${userId}, Service: ${serviceId}`);

  // 1. Get Agent details
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { role: true, aggregatorId: true, email: true, firstName: true, lastName: true }
  });

  if (!user) {
    console.log(`[COMMISSION DEBUG] ❌ User not found.`);
    return;
  }

  if (user.role !== 'AGENT' || !user.aggregatorId) {
    console.log(`[COMMISSION DEBUG] ❌ User is not an AGENT or has no Upline. Skipping.`);
    return;
  }

  let commissionAmount = new Decimal(0);
  let source = "None";

  // 2. Check for Specific Override
  const aggPrice = await tx.aggregatorPrice.findUnique({
    where: {
      aggregatorId_serviceId: {
        aggregatorId: user.aggregatorId,
        serviceId: serviceId
      }
    }
  });

  // 3. Fallback to Global Default (Get service name for description)
  const service = await tx.service.findUnique({
    where: { id: serviceId },
    select: { defaultCommission: true, name: true }
  });

  if (aggPrice) {
    commissionAmount = aggPrice.commission;
    source = "AggregatorPrice Override (Specific)";
  } else if (service) {
    commissionAmount = service.defaultCommission;
    source = "Service Default (Global)";
  }

  console.log(`[COMMISSION DEBUG] 💰 Commission: ₦${commissionAmount}, Source: ${source}`);

  // 4. Credit the Vault & Log Transaction
  if (commissionAmount.greaterThan(0)) {
    const amountString = commissionAmount.toString();
    
    try {
      // A. Credit Wallet
      await tx.wallet.upsert({
        where: { userId: user.aggregatorId },
        create: {
          userId: user.aggregatorId,
          balance: 0, 
          commissionBalance: amountString 
        },
        update: { 
          commissionBalance: { increment: amountString } 
        }
      });

      // B. Create "Receipt" Transaction for Aggregator History
      // This is what the Earnings page will now read.
      await tx.transaction.create({
        data: {
          userId: user.aggregatorId, // <--- Aggregator gets the record
          serviceId: serviceId,
          type: 'COMMISSION',        // <--- Special Type
          amount: commissionAmount,  // <--- Positive Value
          description: `Commission from ${user.firstName} ${user.lastName}`, // <--- Store Agent Name here
          reference: `COMM-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          status: 'COMPLETED'
        }
      });
      
      console.log(`[COMMISSION DEBUG] ✅ Credited and Logged for Aggregator.`);
    } catch (error: any) {
      console.error(`[COMMISSION DEBUG] ❌ ERROR:`, error.message);
    }
  } else {
      console.log(`[COMMISSION DEBUG] ⚠️ Commission is 0. Skipping.`);
  }
  console.log(`[COMMISSION DEBUG] ------------------------------------------------`);
}
