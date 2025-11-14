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
    const { serviceId, phoneNumber, amount, quantity = 1 } = body; 

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required.' }, { status: 400 });
    }

    // --- 1. Get Price & Check Wallet ---
    service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive || !service.productCode) {
      return NextResponse.json({ error: 'This service is currently unavailable.' }, { status: 503 });
    }
    
    let apiPayload: any;
    userReference = `XPS-${service.productCode.toUpperCase()}-${Date.now()}`;
    
    // --- 2. "World-Class" Dynamic Logic (THIS IS THE FIX) ---
    if (service.category === 'VTU_AIRTIME') {
      if (!phoneNumber || !amount) {
        return NextResponse.json({ error: 'Phone number and amount are required.' }, { status: 400 });
      }
      const amountDecimal = new Decimal(amount);
      
      // "World-class" price is a percentage (e.g., 98.00)
      const pricePercent = user.role === 'AGGREGATOR' 
        ? service.platformPrice 
        : service.defaultAgentPrice;
      
      totalPrice = amountDecimal.times(pricePercent.dividedBy(100)); // e.g., 100 * (98 / 100) = 98
      
      apiPayload = {
        product_code: service.productCode,
        phone_number: phoneNumber,
        amount: amount, // Send the *full* amount
        action: 'vend',
        user_reference: userReference,
        bypass_network: 'yes'
      };
    } else if (service.category.startsWith('VTU_DATA')) { // Fix for all data types
      if (!phoneNumber) {
        return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
      }
      
      // "World-class" price is a fixed fee
      const pricePerPlan = user.role === 'AGGREGATOR' 
        ? service.platformPrice 
        : service.defaultAgentPrice;
      totalPrice = pricePerPlan.mul(quantity);
      
      apiPayload = {
        product_code: service.productCode,
        phone_number: phoneNumber,
        action: 'vend',
        quantity: quantity,
        user_reference: userReference,
        bypass_network: 'yes'
      };
    } else {
      return NextResponse.json({ error: 'Invalid service category.' }, { status: 400 });
    }
    // --------------------------------------------------
    
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(totalPrice)) {
      return NextResponse.json({ error: `Insufficient funds. This purchase costs ₦${totalPrice}.` }, { status: 402 });
    }

    // --- 3. Charge User *before* API call ---
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
          status: 'PENDING',
        },
      }),
    ]);

    // --- 4. Call External API (CheapDataSales) ---
    const response = await axios.post(VEND_ENDPOINT, apiPayload, {
      headers: { 
        'Authorization': API_KEY,
        'Content-Type': 'application/json' 
      },
      timeout: 45000,
    });

    const data = response.data;
    
    // --- 5. "World-Class" Refurbished Response ---
    if (data.status === true && (data.text_status === 'COMPLETED' || data.text_status === 'PENDING')) {
      // --- SUCCESS! ---
      let pins = null;
      if (data.data?.true_response) {
        try { pins = JSON.parse(data.data.true_response); } 
        catch { pins = data.data.true_response; }
      }
      
      await prisma.$transaction([
        prisma.transaction.update({
          where: { reference: userReference },
          data: { status: 'COMPLETED' },
        }),
        prisma.vtuRequest.create({
          data: {
            userId: user.id,
            serviceId: service.id,
            userReference: userReference,
            phoneNumber: phoneNumber,
            amount: totalPrice,
            quantity: quantity,
            status: 'COMPLETED',
            apiResponse: data as any,
            token: data.data?.token || null,
            units: data.data?.units?.toString() || null,
            pins: pins ? (pins as any) : undefined,
          }
        })
      ]);

      return NextResponse.json({
        message: data.server_message,
        pins: pins || [],
        data: data.data
      });

    } else {
      // --- FAILED! "World-Class" Auto-Refund ---
      const errorMessage = data.server_message || data.data?.true_response || "Purchase failed.";
      
      await prisma.$transaction([
        prisma.wallet.update({
          where: { userId: user.id },
          data: { balance: { increment: totalPrice } },
        }),
        prisma.transaction.update({
          where: { reference: userReference },
          data: { status: 'FAILED' },
        }),
        prisma.vtuRequest.create({
          data: {
            userId: user.id,
            serviceId: service.id,
            userReference: userReference,
            phoneNumber: phoneNumber,
            amount: totalPrice,
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
    console.error(`VTU (Vend) Error:`, errorMessage);
    
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
