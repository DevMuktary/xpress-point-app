import { Decimal } from '@prisma/client/runtime/library';

/**
 * COMMISSION ENGINE
 * 1. Checks if the user is an Agent with an Upline.
 * 2. Checks for a specific Aggregator Price override.
 * 3. If no override, uses the Service's Global Default Commission.
 * 4. Credits the Aggregator's wallet instantly.
 */
export async function processCommission(
  tx: any, // The Prisma Transaction Client
  userId: string,
  serviceId: string
) {
  // 1. Get Agent details
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { role: true, aggregatorId: true }
  });

  // Stop if not an Agent or has no Upline
  if (!user || user.role !== 'AGENT' || !user.aggregatorId) {
    return;
  }

  let commissionAmount = new Decimal(0);

  // 2. Check for Specific Override (AggregatorPrice table)
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
    // 3. Check for Global Default (Service table)
    const service = await tx.service.findUnique({
      where: { id: serviceId },
      select: { defaultCommission: true }
    });
    
    if (service && service.defaultCommission) {
      commissionAmount = service.defaultCommission;
    }
  }

  // 4. Credit the Vault (Commission Balance)
  if (commissionAmount.greaterThan(0)) {
    await tx.wallet.update({
      where: { userId: user.aggregatorId },
      data: { 
        commissionBalance: { increment: commissionAmount } 
      }
    });
    
    // Optional: Log for debugging
    // console.log(`PAID: ₦${commissionAmount} to Aggregator ${user.aggregatorId}`);
  }
}
