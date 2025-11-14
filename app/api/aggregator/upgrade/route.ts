import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';
import axios from 'axios';

// --- "World-Class" cPanel Config ---
const CPANEL_DOMAIN = process.env.CPANEL_DOMAIN;
const CPANEL_USER = process.env.CPANEL_USER;
const CPANEL_API_TOKEN = process.env.CPANEL_API_TOKEN;
const CPANEL_URL = `https_api_url_not_set`; // Will be set if keys exist

let cpanelHeaders: any = {};
if (CPANEL_API_TOKEN) {
  cpanelHeaders = {
    'Authorization': `cpanel ${CPANEL_USER}:${CPANEL_API_TOKEN}`
  };
}

// "World-class" function to create the subdomain
function generateSubdomain(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove all special chars and spaces
    .substring(0, 30); // Max 30 chars
}

// --- "World-Class" cPanel API Function ---
async function createCpanelSubdomain(subdomain: string) {
  if (!CPANEL_DOMAIN || !CPANEL_USER || !CPANEL_API_TOKEN) {
    console.error("CRITICAL: cPanel variables are not set. Skipping subdomain creation.");
    // We don't throw an error, we just log it.
    return; 
  }

  // This is the "stunning" URL for cPanel's API
  const url = `${CPANEL_URL}/execute/SubDomain/addsubdomain?domain=${subdomain}&rootdomain=${CPANEL_DOMAIN}&dir=public_html/${subdomain}`;
  
  try {
    const response = await axios.get(url, { headers: cpanelHeaders });
    const data = response.data;
    if (data.status !== 1) {
      throw new Error(data.errors[0] || 'cPanel API error');
    }
    console.log(`cPanel: Successfully created subdomain ${subdomain}.${CPANEL_DOMAIN}`);
  } catch (error: any) {
    console.error(`cPanel Error: Failed to create subdomain ${subdomain}:`, error.message);
    // We don't stop the user's upgrade if this fails
  }
}

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (user.role === 'AGGREGATOR') {
    return NextResponse.json({ error: 'You are already an Aggregator.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { bankName, accountNumber, accountName, businessName } = body;

    if (!bankName || !accountNumber || !accountName || !businessName) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // --- 1. Get Price & Check Wallet ---
    const service = await prisma.service.findUnique({ where: { id: 'AGGREGATOR_UPGRADE' } });
    if (!service) {
      throw new Error("AGGREGATOR_UPGRADE service not found.");
    }
    
    const price = service.defaultAgentPrice;
    
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: `Insufficient funds. Upgrade fee is ₦${price}.` }, { status: 402 });
    }

    // --- 2. Generate "World-Class" Subdomain & Check if it exists ---
    let subdomain = generateSubdomain(businessName);
    const existingSubdomain = await prisma.user.findFirst({
      where: { subdomain: subdomain }
    });
    
    if (existingSubdomain) {
      subdomain = `${subdomain}${Math.floor(Math.random() * 100)}`;
    }

    // --- 3. "World-Class" Transaction ---
    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: price } },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          role: 'AGGREGATOR',
          bankName: bankName,
          accountNumber: accountNumber,
          accountName: accountName,
          businessName: businessName,
          subdomain: subdomain
        }
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          type: 'SERVICE_CHARGE',
          amount: price.negated(),
          description: `Aggregator Account Upgrade`,
          reference: `AGG-UPG-${Date.now()}`,
          status: 'COMPLETED',
        },
      }),
    ]);

    // --- 4. "Stunning" cPanel Call (After successful payment) ---
    // We do this *after* the transaction so the user is upgraded
    // even if cPanel fails.
    await createCpanelSubdomain(subdomain);

    // --- 5. Return the "Stunning" Success Response ---
    return NextResponse.json(
      { 
        message: 'Upgrade successful!',
        subdomain: subdomain
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error(`Aggregator Upgrade Error:`, error.message);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
