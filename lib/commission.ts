import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function processCommission(
  tx: any, 
  userId: string,
  serviceId: string
) {
  // 1. Get Agent details
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { role: true, aggregatorId: true }
  });

  if (!user || user.role !== 'AGENT' || !user.aggregatorId) {
    return; // Not an agent or has no upline
  }

  let commissionAmount = new Decimal(0);

  // 2. Check for Specific Override
  const aggPrice = await tx.aggregatorPrice.findUnique({
    where: {
      aggregatorId_serviceId: {
        aggregatorId: user.aggregatorId,
        serviceId: serviceId
      }
    }
  });

  if (aggPrice) {
    commissionAmount = aggPrice.commission;
  } else {
    // 3. Fallback to Global Default
    const service = await tx.service.findUnique({
      where: { id: serviceId },
      select: { defaultCommission: true }
    });
    
    if (service && service.defaultCommission) {
      commissionAmount = service.defaultCommission;
    }
  }

  // 4. Credit the Vault
  if (commissionAmount.greaterThan(0)) {
    // FIX: Explicitly convert to string for safe Prisma increment
    const amountString = commissionAmount.toString();
    
    await tx.wallet.update({
      where: { userId: user.aggregatorId },
      data: { 
        commissionBalance: { increment: amountString } 
      }
    });
    
    console.log(`COMMISSION: Credited ₦${amountString} to Aggregator ${user.aggregatorId}`);
  }
}
