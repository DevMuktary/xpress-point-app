import React from 'react';
import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import NinVerifyModal from './NinVerifyModal'; // We will rename BvnModal
import { BanknotesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { VirtualAccount } from '@prisma/client';
import AccountCard from '@/components/AccountCard';
import GenerateAccountButton from '@/components/GenerateAccountButton'; // We will create this

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

  let virtualAccounts: VirtualAccount[] = [];
  if (user.isIdentityVerified) {
    virtualAccounts = await getVirtualAccounts(user.id);
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Fund Wallet</h1>

      {/* --- THIS IS THE NEW 3-STEP LOGIC --- */}
      
      {/* 1. If user is NOT verified, show the NIN Modal */}
      {!user.isIdentityVerified && (
        <div className="rounded-2xl bg-white p-6 text-center shadow-lg">
          <BanknotesIcon className="mx-auto h-12 w-12 text-blue-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            Verify Your Identity to Fund Wallet
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            To generate your personal bank account numbers, we need to
            verify your identity once. This is a free, one-time check.
          </p>
          <NinVerifyModal />
        </div>
      )}

      {/* 2. If user IS verified, but has NO accounts, show Generate Button */}
      {user.isIdentityVerified && virtualAccounts.length === 0 && (
        <GenerateAccountButton />
      )}

      {/* 3. If user IS verified AND has accounts, show the accounts */}
      {user.isIdentityVerified && virtualAccounts.length > 0 && (
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

          <h2 className="text-lg font-semibold text-gray-900">
            Your Personal Account Numbers
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Transfer to any of these accounts. Your wallet will be credited
            automatically.
          </p>
          
          <div className="space-y-4">
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
      {/* --- END OF NEW LOGIC --- */}
    </div>
  );
}
