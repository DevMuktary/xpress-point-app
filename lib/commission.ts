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
    select: { role: true, aggregatorId: true, email: true }
  });

  if (!user) {
    console.log(`[COMMISSION DEBUG] ❌ User not found.`);
    return;
  }

  console.log(`[COMMISSION DEBUG] User Found: ${user.email}, Role: ${user.role}, Upline: ${user.aggregatorId}`);

  if (user.role !== 'AGENT') {
    console.log(`[COMMISSION DEBUG] ❌ User is not an AGENT. No commission.`);
    return; 
  }

  if (!user.aggregatorId) {
    console.log(`[COMMISSION DEBUG] ❌ User has no Aggregator (Upline). No commission.`);
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

  if (aggPrice) {
    commissionAmount = aggPrice.commission;
    source = "AggregatorPrice Override (Specific)";
  } else {
    // 3. Fallback to Global Default
    const service = await tx.service.findUnique({
      where: { id: serviceId },
      select: { defaultCommission: true }
    });
    
    if (service) {
      commissionAmount = service.defaultCommission;
      source = "Service Default (Global)";
    } else {
      console.log(`[COMMISSION DEBUG] ❌ Service ID ${serviceId} not found in DB.`);
    }
  }

  console.log(`[COMMISSION DEBUG] 💰 Determined Commission: ₦${commissionAmount}, Source: ${source}`);

  // 4. Credit the Vault
  if (commissionAmount.greaterThan(0)) {
    const amountString = commissionAmount.toString();
    
    try {
      // --- FIX START ---
      // We use 'upsert' instead of 'update'. 
      // This creates the wallet if the Aggregator has never logged in/created one.
      const updatedWallet = await tx.wallet.upsert({
        where: { userId: user.aggregatorId },
        create: {
          userId: user.aggregatorId,
          balance: 0, // Main balance starts at 0
          commissionBalance: amountString // Initialize commission with this first earning
        },
        update: { 
          commissionBalance: { increment: amountString } 
        },
        select: { commissionBalance: true } 
      });
      // --- FIX END ---
      
      console.log(`[COMMISSION DEBUG] ✅ SUCCESS! Credited ₦${amountString} to Aggregator. New Balance: ₦${updatedWallet.commissionBalance}`);
    } catch (error: any) {
      console.error(`[COMMISSION DEBUG] ❌ CRITICAL DB ERROR updating wallet:`, error.message);
    }
  } else {
      console.log(`[COMMISSION DEBUG] ⚠️ Commission is 0. Skipping wallet update.`);
  }
  console.log(`[COMMISSION DEBUG] ------------------------------------------------`);
}
