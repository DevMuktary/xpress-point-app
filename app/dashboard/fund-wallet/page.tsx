import React from 'react';
import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { WalletIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { VirtualAccount } from '@prisma/client';
import AccountCard from '@/components/AccountCard';
import GenerateAccountControls from '@/components/GenerateAccountControls';

// Helper to get user's virtual accounts
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

  const virtualAccounts: VirtualAccount[] = await getVirtualAccounts(user.id);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center text-center mb-10">
        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <WalletIcon className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Fund Your Wallet</h1>
        <p className="mt-2 text-gray-600 max-w-md">
          Transfer money to your dedicated account number below and your wallet will be credited instantly.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
        
        {/* Left Column: Generator / Info */}
        <div className="space-y-6">
           {/* Component to Generate New Accounts */}
           <GenerateAccountControls existingAccounts={virtualAccounts} />
           
           <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
             <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
               <ArrowPathIcon className="h-5 w-5"/> Auto-Credit System
             </h3>
             <p className="text-sm text-blue-700 leading-relaxed">
               This is an automated system. Any transfer made to the account number generated will reflect in your wallet immediately.
             </p>
           </div>
        </div>

        {/* Right Column: Active Accounts List */}
        <div className="space-y-4">
          {virtualAccounts.length > 0 ? (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Active Deposit Accounts
              </h2>
              {virtualAccounts.map((account) => (
                <AccountCard
                  key={account.id}
                  bankName={account.bankName}
                  accountNumber={account.accountNumber}
                  accountName={account.accountName}
                />
              ))}
            </>
          ) : (
            // Empty State (if no accounts yet)
            <div className="h-full flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center">
              <p className="text-gray-500 font-medium">No accounts generated yet.</p>
              <p className="text-sm text-gray-400">Click the button to create one.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
