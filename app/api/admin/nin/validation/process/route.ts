import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { processCommission } from '@/lib/commission';
import { sendStatusNotification } from '@/lib/whatsapp';

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { requestId, action, refund, note, adminFileUrl } = await request.json();

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const valRequest = await prisma.validationRequest.findUnique({
      where: { id: requestId },
      include: { user: true }
    });

    if (!valRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Processing
      if (action === 'PROCESSING') {
        await tx.validationRequest.update({
          where: { id: requestId },
          data: { status: 'PROCESSING', statusMessage: note || 'Processing...' }
        });
      }
      // 2. Completed
      else if (action === 'COMPLETED') {
        await tx.validationRequest.update({
          where: { id: requestId },
          data: { 
             status: 'COMPLETED', 
             statusMessage: note || 'Validation Successful',
             adminFileUrl: adminFileUrl || null // If admin uploads a proof
          }
        });
        // Since scode in this case is just a type like "NO_RECORD", we map it to the Service ID for commission
        let serviceId = '';
        if (valRequest.scode === 'NO_RECORD') serviceId = 'NIN_VAL_NO_RECORD';
        if (valRequest.scode === 'UPDATE_RECORD') serviceId = 'NIN_VAL_UPDATE_RECORD';
        
        if (serviceId) {
           await processCommission(tx, valRequest.userId, serviceId);
        }
      }
      // 3. Failed
      else if (action === 'FAILED') {
        await tx.validationRequest.update({
          where: { id: requestId },
          data: { status: 'FAILED', statusMessage: note || 'Validation Failed' }
        });

        if (refund) {
          // Refund Logic here (find original transaction and reverse)
          // For brevity in this snippet, we assume standard refund logic similar to other endpoints
           await tx.wallet.update({
              where: { userId: valRequest.userId },
              data: { balance: { increment: 500 } } // Simplified: In prod, fetch exact transaction amount
           });
        }
      }
    });

    // Send WhatsApp Notification
    if (valRequest.user.phoneNumber) {
       await sendStatusNotification(valRequest.user.phoneNumber, "NIN Validation", action);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
