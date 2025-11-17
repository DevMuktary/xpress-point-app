import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';
import axios from 'axios';
import https from 'https'; // Import https for the agent

// --- Cloudflare Config ---
const CF_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN; // Should be "Bearer <token>"
const APP_DOMAIN = "xpresspoint.net"; // Your main domain

let cfHeaders: any = {};
if (CF_API_TOKEN) {
  cfHeaders = {
    'Authorization': CF_API_TOKEN,
    'Content-Type': 'application/json'
  };
}

// Function to create the subdomain name
function generateSubdomain(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') 
    .substring(0, 30);
}

// --- Cloudflare API Function ---
async function createCloudflareRecord(subdomain: string) {
  if (!CF_ZONE_ID || !CF_API_TOKEN) {
    console.error("CRITICAL: Cloudflare variables are not set. Skipping subdomain creation.");
    // This is a server configuration error, we should stop
    throw new Error("DNS API is not configured. Upgrade cannot proceed."); 
  }

  const url = `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records`;

  const payload = {
    type: 'CNAME',
    name: subdomain,         // e.g., "quadrox"
    content: APP_DOMAIN,     // e.g., "xpresspoint.net"
    ttl: 1,                  // 1 = Automatic
    proxied: true            // The "orange cloud"
  };

  try {
    console.log(`Cloudflare: Attempting to create CNAME record: ${subdomain}.${APP_DOMAIN}`);
    const response = await axios.post(url, payload, { headers: cfHeaders });
    
    const data = response.data;
    if (data.success !== true) {
      const error = data.errors[0]?.message || 'Unknown Cloudflare API error';
      // If it "fails" because it *already exists*, that is fine
      if (error.includes('already exists')) {
        console.log(`Cloudflare: CNAME record ${subdomain}.${APP_DOMAIN} already exists. This is OK.`);
      } else {
        throw new Error(error);
      }
    }
    console.log(`Cloudflare: Successfully created CNAME record.`);
    
  } catch (error: any) {
    const errorMessage = error.response?.data?.errors?.[0]?.message || error.message;
    console.error(`Cloudflare Error: Failed to create CNAME record for ${subdomain}:`, errorMessage);
    throw new Error(`Cloudflare DNS creation failed: ${errorMessage}`);
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
    
    const rawPrice = service.defaultAgentPrice;
    const price = new Decimal(rawPrice); // Instantiate as Decimal
    
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: `Insufficient funds. Upgrade fee is ₦${price.toString()}.` }, { status: 402 });
    }

    // --- 2. Generate Subdomain & Check if it exists ---
    let subdomain = generateSubdomain(businessName);
    const existingSubdomain = await prisma.user.findFirst({
      where: { subdomain: subdomain }
    });
    
    if (existingSubdomain) {
      subdomain = `${subdomain}${Math.floor(Math.random() * 100)}`;
    }

    // --- 3. Cloudflare Call (BEFORE payment) ---
    // We create the DNS record first. If it fails, we stop.
    await createCloudflareRecord(subdomain);

    // --- 4. Database Transaction ---
    const priceAsString = price.toString();
    const negatedPriceAsString = price.negated().toString();

    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: priceAsString } },
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
          amount: negatedPriceAsString,
          description: `Aggregator Account Upgrade`,
          reference: `AGG-UPG-${Date.now()}`,
          status: 'COMPLETED',
        },
      }),
    ]);

    // --- 5. Return Success Response ---
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
