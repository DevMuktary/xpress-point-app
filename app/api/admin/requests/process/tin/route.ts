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
    const body = await request.json();
    const { requestId, action, refund, note, certificateUrl, assignedTin } = body; 

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const tinRequest = await prisma.tinRequest.findUnique({
      where: { id: requestId },
      include: { user: true }
    });

    if (!tinRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      
      if (action === 'PROCESSING') {
        await tx.tinRequest.update({
          where: { id: requestId },
          data: {
            status: 'PROCESSING',
            statusMessage: 'Processing... ' + (note || '')
          }
        });
      } 
      
      else if (action === 'COMPLETED') {
        // --- Merge new Assigned TIN into existing formData ---
        const existingData = tinRequest.formData as Record<string, any>;
        const updatedFormData = { ...existingData, assignedTin: assignedTin };

        await tx.tinRequest.update({
          where: { id: requestId },
          data: {
            status: 'COMPLETED',
            statusMessage: note || 'Tax ID Generated Successfully',
            certificateUrl: certificateUrl || null,
            formData: updatedFormData // <--- Save the Tax ID
          }
        });

        await processCommission(tx, tinRequest.userId, tinRequest.serviceId);
      } 
      
      else if (action === 'FAILED') {
        await tx.tinRequest.update({
          where: { id: requestId },
          data: {
            status: 'FAILED',
            statusMessage: note || 'Service Failed'
          }
        });

        if (refund) {
          const transaction = await tx.transaction.findFirst({
            where: {
              userId: tinRequest.userId,
              serviceId: tinRequest.serviceId,
              type: 'SERVICE_CHARGE'
            },
            orderBy: { createdAt: 'desc' }
          });

          if (transaction) {
            const refundAmount = transaction.amount.abs(); 
            
            await tx.wallet.update({
              where: { userId: tinRequest.userId },
              data: { balance: { increment: refundAmount } }
            });

            await tx.transaction.create({
              data: {
                userId: tinRequest.userId,
                type: 'REFUND',
                amount: refundAmount,
                description: `Refund: Tax ID Service Failed`,
                reference: `REF-${Date.now()}`,
                status: 'COMPLETED'
              }
            });
          }
        }
      }
    });

    // --- SEND WHATSAPP NOTIFICATION ---
    if (tinRequest?.user?.phoneNumber) {
        let statusText = action;
        if (action === 'COMPLETED') statusText = 'COMPLETED (Tax ID Ready)';
        if (action === 'FAILED') statusText = 'FAILED (Please check dashboard)';
        
        await sendStatusNotification(
            tinRequest.user.phoneNumber, 
            "Tax ID Service", 
            statusText
        );
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Process TIN Error:", error);
    return NextResponse.json({ error: error.message || "Processing failed" }, { status: 500 });
  }
}
