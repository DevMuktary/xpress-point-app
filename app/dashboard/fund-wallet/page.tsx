import React from 'react';
import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { InformationCircleIcon, ShieldCheckIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';
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
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      
      {/* 1. Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Fund Wallet</h1>
        <p className="text-gray-500 text-sm">Transfer to your dedicated account below to top up instantly.</p>
      </div>

      {/* 2. Important Notice (The "No Withdraw" Warning) */}
      <div className="mb-8 flex items-start gap-4 rounded-xl bg-orange-50 p-4 border border-orange-100">
        <InformationCircleIcon className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-orange-900">Important Policy</h3>
          <p className="mt-1 text-sm text-orange-800 leading-relaxed">
            Funds deposited into this wallet are strictly for service payments. 
            <span className="font-bold ml-1">Money cannot be withdrawn back to your bank account.</span> 
            Please ensure you only fund what you plan to use.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* 3. The Account Card (Hero Section) */}
        {virtualAccounts.length > 0 ? (
          <div>
            {virtualAccounts.map((account) => (
              <div key={account.id} className="mb-6">
                <AccountCard
                  bankName={account.bankName}
                  accountNumber={account.accountNumber}
                  accountName={account.accountName}
                />
              </div>
            ))}
            
            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-6 text-xs text-gray-400 mt-4">
              <span className="flex items-center gap-1"><ShieldCheckIcon className="h-4 w-4"/> Secure Transfer</span>
              <span className="flex items-center gap-1"><ShieldCheckIcon className="h-4 w-4"/> Instant Credit</span>
              <span className="flex items-center gap-1"><ShieldCheckIcon className="h-4 w-4"/> Automated</span>
            </div>
          </div>
        ) : (
          
          /* 4. Empty State / Generator */
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
            <div className="mx-auto h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <BuildingLibraryIcon className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Account Generated Yet</h3>
            <p className="text-gray-500 text-sm mb-6">Create a dedicated virtual account to start funding your wallet.</p>
            
            {/* The Generator Component - Passed Correctly */}
            <GenerateAccountControls existingAccounts={virtualAccounts} />
          </div>
        )}

        {/* 5. Generator (Always visible if they can generate more) */}
        {virtualAccounts.length > 0 && (
           <div className="mt-8 pt-8 border-t border-gray-100">
             <GenerateAccountControls existingAccounts={virtualAccounts} />
           </div>
        )}

      </div>
    </div>
  );
}
