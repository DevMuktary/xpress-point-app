import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Calculates commission and credits the Aggregator's wallet.
 * Call this function inside your transaction endpoint after a successful charge.
 */
export async function processCommission(
  tx: any, // The Prisma Transaction Client
  userId: string,
  serviceId: string
) {
  // 1. Get the User (Agent) details including Aggregator ID
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { role: true, aggregatorId: true }
  });

  // Only Agents with an Upline Aggregator generate commission
  if (!user || user.role !== 'AGENT' || !user.aggregatorId) {
    return;
  }

  // 2. Find the Commission Rate
  // Priority: Specific Aggregator Price -> Global Service Default -> 0
  let commissionAmount = new Decimal(0);

  // Check for specific override first
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
    // Fallback to Global Default
    const service = await tx.service.findUnique({
      where: { id: serviceId },
      select: { defaultCommission: true }
    });
    if (service) {
      commissionAmount = service.defaultCommission;
    }
  }

  // 3. Credit the Aggregator Wallet (The Vault)
  if (commissionAmount.greaterThan(0)) {
    await tx.wallet.update({
      where: { userId: user.aggregatorId },
      data: { 
        commissionBalance: { increment: commissionAmount } 
      }
    });
    
    console.log(`COMMISSION: Credited ₦${commissionAmount} to Aggregator ${user.aggregatorId}`);
  }
}
