import React from 'react';
import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProfileClientPage from '@/components/ProfileClientPage';

export default async function ProfilePage() {
  const user = await getUserFromSession();
  
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // 1. Fetch Wallet Data
  const wallet = await prisma.wallet.findUnique({
    where: { userId: user.id }
  });

  // 2. Fetch Basic Stats (e.g., total successful transactions)
  const transactionCount = await prisma.transaction.count({
    where: { 
      userId: user.id,
      status: 'COMPLETED'
    }
  });

  // 3. Fetch Last Login (Optional: if you track it, otherwise use created_at)
  // For now, we'll use createdAt as "Member Since"

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>
      
      <ProfileClientPage 
        user={user} 
        walletBalance={Number(wallet?.balance || 0)}
        commissionBalance={Number(wallet?.commissionBalance || 0)}
        totalTransactions={transactionCount}
      />
    </div>
  );
}
