import React from 'react';
import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BanknotesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { VirtualAccount } from '@prisma/client';
import AccountCard from '@/components/AccountCard';
import GenerateAccountControls from '@/components/GenerateAccountControls';

// Helper function to get user's virtual accounts
async function getVirtualAccounts(userId: string) {
  const accounts = await prisma.virtualAccount.findMany({
    where: { userId: userId },
    orderBy: { bankName: 'asc' },
  });
  return accounts;
}

export default async function FundWalletPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login');
  }

  // Always fetch accounts, regardless of verification status
  const virtualAccounts: VirtualAccount[] = await getVirtualAccounts(user.id);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Fund Wallet</h1>

      <div className="space-y-6">
        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-red-800">
                Important Notice
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  A <span className="font-bold">₦30 fee</span> will be deducted from each deposit.
                  Money deposited into your wallet cannot be withdrawn to your bank account.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Component to Generate New Accounts */}
        <GenerateAccountControls 
          existingAccounts={virtualAccounts} 
        />

        {/* List Existing Accounts */}
        {virtualAccounts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Your Personal Account Numbers
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Transfer to any of these accounts. Your wallet will be credited
              automatically.
            </p>
            
            <div className="space-y-4 mt-4">
              {virtualAccounts.map((account) => (
                <AccountCard
                  key={account.id}
                  bankName={account.bankName}
                  accountNumber={account.accountNumber}
                  accountName={account.accountName}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
