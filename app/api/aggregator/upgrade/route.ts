import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';
import axios from 'axios';
import https from 'https'; // "World-class" import to ignore SSL errors

// --- "World-Class" cPanel Config ---
const CPANEL_DOMAIN = process.env.CPANEL_DOMAIN; // xpresspoint.net
const CPANEL_USER = process.env.CPANEL_USER;
const CPANEL_API_TOKEN = process.env.CPANEL_API_TOKEN;
const CPANEL_HOSTNAME = process.env.CPANEL_HOSTNAME; // das112.truehost.cloud
// ------------------------------------

let cpanelHeaders: any = {};
if (CPANEL_API_TOKEN) {
  cpanelHeaders = {
    'Authorization': `cpanel ${CPANEL_USER}:${CPANEL_API_TOKEN}`
  };
}

// "World-class" function to create the subdomain name
function generateSubdomain(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') 
    .substring(0, 30);
}

// --- "World-Class" cPanel API Function (Refurbished) ---
async function createCpanelRedirect(subdomain: string) {
  if (!CPANEL_DOMAIN || !CPANEL_USER || !CPANEL_API_TOKEN || !CPANEL_HOSTNAME) {
    console.error("CRITICAL: cPanel variables are not set. Skipping subdomain creation.");
    return; 
  }

  const agent = new https.Agent({  
    rejectUnauthorized: false
  });

  // STEP 1: Create the "stunning" subdomain
  const createSubdomainUrl = `https://${CPANEL_HOSTNAME}:2083/execute/SubDomain/addsubdomain?domain=${subdomain}&rootdomain=${CPANEL_DOMAIN}`;
  
  // --- THIS IS THE "WORLD-CLASS" FIX ---
  // STEP 2: Create the "world-class" redirect
  const fullSubdomain = `${subdomain}.${CPANEL_DOMAIN}`;
  const redirectUrl = `https://xpresspoint.net/register/${subdomain}`;
  // The "rubbish" URL is now "refurbished" with https:// and :2083
  const createRedirectUrl = `https://${CPANEL_HOSTNAME}:2083/execute/Redirect/addredirect?domain=${fullSubdomain}&url=${redirectUrl}`;
  // ------------------------------------

  try {
    // --- Run Step 1 ---
    console.log(`cPanel: Attempting to create subdomain: ${fullSubdomain}`);
    const subResponse = await axios.get(createSubdomainUrl, { 
      headers: cpanelHeaders,
      httpsAgent: agent
    });
    const subData = subResponse.data;
    if (subData.status !== 1) {
      if (subData.errors[0].includes('already exists')) {
        console.log(`cPanel: Subdomain ${fullSubdomain} already exists. This is OK.`);
      } else {
        throw new Error(subData.errors[0] || 'cPanel Subdomain API error');
      }
    }
    console.log(`cPanel: Successfully created subdomain.`);

    // --- Run Step 2 ---
    console.log(`cPanel: Attempting to create redirect: ${fullSubdomain} -> ${redirectUrl}`);
    const redResponse = await axios.get(createRedirectUrl, { 
      headers: cpanelHeaders,
      httpsAgent: agent 
    });
    const redData = redResponse.data;
    if (redData.status !== 1) {
      throw new Error(redData.errors[0] || 'cPanel Redirect API error');
    }
    console.log(`cPanel: Successfully created redirect.`);
    
  } catch (error: any) {
    console.error(`cPanel Error: Failed to create subdomain/redirect for ${subdomain}:`, error.message);
    throw new Error(`Database upgrade was successful, but cPanel subdomain creation failed: ${error.message}`);
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

    // --- 3. "Stunning" cPanel Call (BEFORE payment) ---
    await createCpanelRedirect(subdomain);

    // --- 4. "World-Class" Database Transaction ---
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
      { error: error.message || "An internal server error occurred." },
      { status: 500 }
    );
  }
}
