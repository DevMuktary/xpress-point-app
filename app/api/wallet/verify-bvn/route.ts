import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';

// API credentials from your blueprint
const RAUDAH_API_KEY = process.env.RAUDAH_API_KEY; // e.g., "MyAPIkey:myPassword"
const RAUDAH_ENDPOINT = 'https://raudah.com.ng/api/bvn/bvn';

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user.isIdentityVerified) {
    return NextResponse.json({ error: 'Identity already verified' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { bvn, dob } = body; // dob is in 'YYYY-MM-DD'

    if (!bvn || !dob) {
      return NextResponse.json({ error: 'BVN and Date of Birth are required' }, { status: 400 });
    }

    // --- 1. Call Raudah BVN API ---
    const response = await axios.post(
      RAUDAH_ENDPOINT,
      {
        value: bvn,
        ref: `XPRESSPOINT_${user.id}_${Date.now()}` // Unique ref
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': RAUDAH_API_KEY,
        },
      }
    );

    const data = response.data;

    if (!data.status || !data.data.status || data.data.message !== 'success') {
      throw new Error(data.data.message || 'BVN not found or error occurred.');
    }

    const bvnData = data.data.data;

    // --- 2. Validate Date of Birth ---
    // Raudah format: "11-01-2011" (DD-MM-YYYY)
    // Our input format: "2011-01-11" (YYYY-MM-DD)
    const [day, month, year] = bvnData.birthdate.split('-');
    const bvnDob = `${year}-${month}-${day}`;

    if (bvnDob !== dob) {
      return NextResponse.json(
        { error: 'Date of Birth does not match BVN record.' },
        { status: 400 }
      );
    }

    // --- 3. Update User in Database ---
    const verifiedNin = bvnData.nin || null; // Get NIN, or null if missing

    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: bvnData.firstname,
        lastName: bvnData.surname,
        bvn: bvn,
        nin: verifiedNin, // Save the NIN if we got it
        isIdentityVerified: true,
      },
    });

    // --- 4. Send Response ---
    if (verifiedNin) {
      // Happy path: NIN was included
      return NextResponse.json({
        status: 'IDENTITY_VERIFIED',
        nin: verifiedNin,
      });
    } else {
      // Fallback path: NIN is missing
      return NextResponse.json({ status: 'NIN_REQUIRED' });
    }

  } catch (error: any) {
    console.error('BVN Verification Error:', error.response ? error.response.data : error.message);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
