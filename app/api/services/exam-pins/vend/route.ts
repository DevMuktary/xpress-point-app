import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';
import { processCommission } from '@/lib/commission'; // <--- THE FIX

const VEND_ENDPOINT = 'https://cheapdatasales.com/autobiz_vending_index.php';
const API_KEY = process.env.CHEAPDATASALES_API_KEY; 

if (!API_KEY) {
  console.error("CRITICAL: CHEAPDATASALES_API_KEY is not set.");
}

function parseApiError(error: any): string {
  if (error.code === 'ECONNABORTED') {
    return 'The service timed out. Please try again.';
  }
  if (error.response && error.response.data) {
    const data = error.response.data;
    if (data.server_message && typeof data.server_message === 'string') {
      return data.server_message;
    }
    if (data.message && typeof data.message === 'string') {
      return data.message;
    }
  }
  if (error.message) {
    return error.message;
  }
  return 'An internal server error occurred.';
}

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (!API_KEY) {
    return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
  }

  // --- Initialize Variables ---
  let service: any = null;
  let totalPrice: Decimal = new Decimal(0);
  let userReference: string = `XPS-FAILED-${Date.now()}`;

  try {
    const body = await request.json();
    const { serviceId, phoneNumber, quantity } = body; 

    if (!serviceId || !phoneNumber || !quantity) {
      return NextResponse.json({ error: 'Service, Phone Number, and Quantity are required.' }, { status: 400 });
    }

    // --- 1. Get Price & Check Wallet ---
    service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive || !service.productCode) {
      return NextResponse.json({ error: 'This service is currently unavailable.' }, { status: 503 });
    }
    
    // --- PRICE FIX: Use Default Agent Price for Everyone ---
    const pricePerPin = new Decimal(service.defaultAgentPrice);
    totalPrice = pricePerPin.mul(quantity);
    
    // Check Wallet
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(totalPrice)) {
      return NextResponse.json({ error: `Insufficient funds. This purchase costs ₦${totalPrice.toString()}.` }, { status: 402 });
    }

    // --- 2. Charge User *before* API call ---
    userReference = `XPS-${service.productCode.toUpperCase()}-${Date.now()}`;
    const totalPriceString = totalPrice.toString();
    
    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: totalPriceString } },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          type: 'SERVICE_CHARGE',
          amount: totalPrice.negated(),
          description: `${service.name} (x${quantity}) for ${phoneNumber}`,
          reference: userReference,
          status: 'PENDING', 
        },
      }),
    ]);

    // --- 3. Call External API (CheapDataSales) ---
    const response = await axios.post(VEND_ENDPOINT, 
      {
        product_code: service.productCode,
        phone_number: phoneNumber,
        action: 'vend',
        quantity: quantity,
        user_reference: userReference
      },
      {
        headers: { 
          'Authorization': API_KEY,
          'Content-Type': 'application/json' 
        },
        timeout: 45000, 
      }
    );

    const data = response.data;
    
    // --- 4. Handle Response ---
    if (data.status === true && data.text_status === 'COMPLETED' && data.data?.true_response) {
      // --- SUCCESS! ---
      const pins = JSON.parse(data.data.true_response); 

      await prisma.$transaction(async (tx) => {
        // a) Complete Transaction
        await tx.transaction.update({
          where: { reference: userReference },
          data: { status: 'COMPLETED' },
        });

        // b) Save Pins
        await tx.examPinRequest.create({
          data: {
            userId: user.id,
            serviceId: service.id, 
            userReference: userReference,
            phoneNumber: phoneNumber,
            quantity: quantity,
            status: 'COMPLETED',
            apiResponse: data as any,
            pins: pins as any,
          }
        });

        // c) PROCESS COMMISSION (The Definite Fix)
        // Since this is a "Quantity" based purchase, we need to loop or calculate total commission.
        // Our helper calculates PER UNIT. So we might need to call it 'quantity' times or adjust the helper.
        //
        // BETTER APPROACH: We modify the logic slightly here to handle QUANTITY.
        // Since `processCommission` credits based on ONE service execution, 
        // and the DB `commission` field is usually "Per Transaction" or "Per Unit".
        // Assuming commission is PER PIN:
        
        for (let i = 0; i < quantity; i++) {
             await processCommission(tx, user.id, service.id);
        }
      });

      return NextResponse.json({
        message: data.server_message,
        pins: pins
      });

    } else {
      // --- FAILED! Auto-Refund ---
      const errorMessage = data.server_message || data.data?.true_response || "Purchase failed.";
      const totalPriceString = totalPrice.toString();

      await prisma.$transaction([
        // a) Refund the wallet
        prisma.wallet.update({
          where: { userId: user.id },
          data: { balance: { increment: totalPriceString } },
        }),
        // b) Mark transaction as FAILED
        prisma.transaction.update({
          where: { reference: userReference },
          data: { status: 'FAILED' },
        }),
        // c) Log the failed request
        prisma.examPinRequest.create({
          data: {
            userId: user.id,
            serviceId: service.id,
            userReference: userReference,
            phoneNumber: phoneNumber,
            quantity: quantity,
            status: 'FAILED',
            apiResponse: data as any,
          }
        })
      ]);
      
      return NextResponse.json({ error: `Purchase Failed: ${errorMessage}` }, { status: 400 });
    }

  } catch (error: any) {
    const errorMessage = parseApiError(error);
    console.error(`Exam Pin (Vend) Error:`, errorMessage);
    
    // --- CRASH-RECOVERY REFUND ---
    if (service && totalPrice.greaterThan(0)) {
      console.log("CRITICAL ERROR: Refunding user due to server crash.");
      const totalPriceString = totalPrice.toString();
      
      await prisma.$transaction([
        prisma.wallet.update({
          where: { userId: user!.id },
          data: { balance: { increment: totalPriceString } },
        }),
        prisma.transaction.update({
          where: { reference: userReference },
          data: { status: 'FAILED' },
        }),
        prisma.examPinRequest.create({
          data: {
            userId: user!.id,
            serviceId: service.id,
            userReference: userReference,
            phoneNumber: (request as any).phoneNumber || "Unknown", 
            quantity: 1, 
            status: 'FAILED',
            apiResponse: { error: errorMessage } as any,
          }
        })
      ]);
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
