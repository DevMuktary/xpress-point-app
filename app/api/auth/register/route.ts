import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendOtpMessage } from '@/lib/whatsapp'; 
import { generateUniqueAgentCode } from '@/lib/agentCode';

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

    // --- SECURITY FIX: HANDLE UNVERIFIED ACCOUNTS ---
    if (existingUser) {
      // If the account exists BUT is NOT verified, we allow re-registration (Update)
      if (!existingUser.isPhoneVerified) {
        
        // Update the existing unverified record with new details
        const passwordHash = await bcrypt.hash(password, 10);
        
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            firstName,
            lastName,
            passwordHash, // Update password
            // We keep other fields or update them as needed
          }
        });

        // Generate and Send NEW OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

        // Delete old OTPs for this user to be clean
        await prisma.otp.deleteMany({ where: { userId: updatedUser.id } });

        await prisma.otp.create({
          data: {
            code: otpCode,
            userId: updatedUser.id,
            expiresAt: expiresAt,
          },
        });

        await sendOtpMessage(phone, otpCode);

        return NextResponse.json(
          { message: 'Account exists but unverified. New OTP sent.' },
          { status: 201 }
        );
      } 
      
      // If account IS verified, block duplicate registration
      else {
        return NextResponse.json(
          { error: 'An account with this email or phone number already exists.' },
          { status: 409 } 
        );
      }
    }
    
    // ... (Rest of the standard creation logic for new users) ...
    
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

    const passwordHash = await bcrypt.hash(password, 10);
    const agentCode = await generateUniqueAgentCode(); 

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        phoneNumber: phone,
        passwordHash,
        role: 'AGENT',
        agentCode: agentCode, 
        aggregatorId: aggregatorId || null,
        businessName: businessName || null, 
        address: address || null,
        isPhoneVerified: false, // Explicitly false
      }
    });
    
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
