import React from 'react';
import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BvnModal from './BvnModal'; // The client component we will create
import { BanknotesIcon } from '@heroicons/react/24/outline';

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

  let virtualAccounts = [];
  if (user.isIdentityVerified) {
    // If user is verified, fetch their accounts
    virtualAccounts = await getVirtualAccounts(user.id);
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Fund Wallet</h1>

      {user.isIdentityVerified ? (
        // --- 1. VERIFIED STATE ---
        // User has already verified, show their accounts
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Personal Account Numbers
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Transfer to any of these accounts. Your wallet will be credited
            automatically.
          </p>
          <div className="mt-6 space-y-4">
            {virtualAccounts.length > 0 ? (
              virtualAccounts.map((account) => (
                <div
                  key={account.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <p className="text-sm font-medium text-gray-500">
                    {account.bankName}
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {account.accountNumber}
                  </p>
                  <p className="mt-1 text-sm text-gray-700">
                    Account Name: {account.accountName}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">
                No virtual accounts found. Please contact support.
              </p>
            )}
          </div>
        </div>
      ) : (
        // --- 2. UNVERIFIED STATE ---
        // User needs to verify. Show the modal.
        <div className="rounded-2xl bg-white p-6 text-center shadow-lg">
          <BanknotesIcon className="mx-auto h-12 w-12 text-blue-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            Verify Your Identity to Fund Wallet
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            To generate your personal bank account numbers, we need to
            verify your identity once. This is a free, one-time check.
          </p>
          <BvnModal /> {/* This Client Component will handle the API calls */}
        </div>
      )}
    </div>
  );
}
