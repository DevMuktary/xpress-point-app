import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendOtpMessage } from '@/lib/whatsapp'; 
import { generateUniqueAgentCode } from '@/lib/agentCode'; // <--- IMPORT THIS

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      password,
      aggregatorId,
      businessName, 
      address       
    } = body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'All required fields are not filled' }, { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' }, { status: 400 }
      );
    }

    // 1. Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { phoneNumber: phone }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email or phone number already exists.' },
        { status: 409 } 
      );
    }
    
    if (aggregatorId) {
      const aggregatorExists = await prisma.user.findFirst({
        where: { id: aggregatorId, role: 'AGGREGATOR' }
      });
      if (!aggregatorExists) {
        return NextResponse.json(
          { error: 'Invalid referral link. Aggregator not found.' }, { status: 400 }
        );
      }
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Generate Unique Agent Code
    const agentCode = await generateUniqueAgentCode(); // <--- NEW LOGIC

    // 4. Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        phoneNumber: phone,
        passwordHash,
        role: 'AGENT',
        agentCode: agentCode, // <--- SAVE CODE
        aggregatorId: aggregatorId || null,
        businessName: businessName || null, 
        address: address || null,         
      }
    });
    
    // 5. Create and send OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    await prisma.otp.create({
      data: {
        code: otpCode,
        userId: user.id,
        expiresAt: expiresAt,
      },
    });

    await sendOtpMessage(phone, otpCode);
    
    return NextResponse.json(
      { message: 'Registration successful. OTP sent.' },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Registration Error:', error);
    if (error.code === 'P2002') { 
      return NextResponse.json(
        { error: 'An account with this email or phone number already exists.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
