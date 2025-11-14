import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';

const VEND_ENDPOINT = 'https://cheapdatasales.com/autobiz_vending_index.php';
const API_KEY = process.env.CHEAPDATASALES_API_KEY; // 'Bearer YOUR_KEY'

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

  // --- We must get these from the transaction ---
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
    
    // --- THIS IS THE "WORLD-CLASS" FIX ---
    // We now use the "refurbished" price fields
    const pricePerPin = user.role === 'AGGREGATOR' 
      ? service.platformPrice 
      : service.defaultAgentPrice;
    totalPrice = pricePerPin.mul(quantity);
    // ------------------------------------
    
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(totalPrice)) {
      return NextResponse.json({ error: `Insufficient funds. This purchase costs ₦${totalPrice}.` }, { status: 402 });
    }

    // --- 2. Charge User *before* API call ---
    userReference = `XPS-${service.productCode.toUpperCase()}-${Date.now()}`;
    
    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: totalPrice } },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          type: 'SERVICE_CHARGE',
          amount: totalPrice.negated(),
          description: `${service.name} (x${quantity}) for ${phoneNumber}`,
          reference: userReference,
          status: 'PENDING', // Pending until API call succeeds
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
          'Authorization': API_KEY, // API key includes "Bearer"
          'Content-Type': 'application/json' 
        },
        timeout: 45000, // 45 seconds for VTU
      }
    );

    const data = response.data;
    
    // --- 4. Handle "World-Class" Response ---
    if (data.status === true && data.text_status === 'COMPLETED' && data.data?.true_response) {
      // --- SUCCESS! ---
      const pins = JSON.parse(data.data.true_response); // Parse the PINs
      
      // Update transaction and save pins
      await prisma.$transaction([
        prisma.transaction.update({
          where: { reference: userReference },
          data: { status: 'COMPLETED' },
        }),
        prisma.examPinRequest.create({
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
        })
      ]);

      return NextResponse.json({
        message: data.server_message,
        pins: pins
      });

    } else {
      // --- FAILED! "World-Class" Auto-Refund ---
      const errorMessage = data.server_message || data.data?.true_response || "Purchase failed.";
      
      await prisma.$transaction([
        // a) Refund the wallet
        prisma.wallet.update({
          where: { userId: user.id },
          data: { balance: { increment: totalPrice } },
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
    
    // --- "WORLD-CLASS" CRASH-RECOVERY REFUND ---
    if (totalPrice.greaterThan(0)) {
      console.log("CRITICAL ERROR: Refunding user due to server crash.");
      await prisma.$transaction([
        prisma.wallet.update({
          where: { userId: user!.id },
          data: { balance: { increment: totalPrice } },
        }),
        prisma.transaction.update({
          where: { reference: userReference },
          data: { status: 'FAILED' },
        }),
      ]);
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
