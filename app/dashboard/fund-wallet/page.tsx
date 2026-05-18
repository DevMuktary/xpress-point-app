import React from 'react';
import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { InformationCircleIcon, BuildingLibraryIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { VirtualAccount } from '@prisma/client';
import AccountCard from '@/components/AccountCard';
import GenerateAccountControls from '@/components/GenerateAccountControls';
import PaystackFundForm from '@/components/PaystackFundForm';

async function getVirtualAccounts(userId: string) {
  return await prisma.virtualAccount.findMany({
    where: { userId: userId },
    orderBy: { bankName: 'asc' },
  });
}

export default async function FundWalletPage() {
  const user = await getUserFromSession();
  if (!user) redirect('/login');

  const virtualAccounts: VirtualAccount[] = await getVirtualAccounts(user.id);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Fund Wallet</h1>
      </div>

      {/* COMPACT WARNING BANNER */}
      <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-orange-50 p-3.5 border border-orange-100 shadow-sm">
        <InformationCircleIcon className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-orange-800 leading-snug">
          Funds are for service processing only. <span className="font-bold underline">Bank withdrawals are not permitted.</span> Fund only what you need.
        </p>
      </div>

      {/* TIGHT MOBILE-FIRST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        
        {/* LEFT: Paystack */}
        <div className="flex flex-col">
          <PaystackFundForm email={user.email} />
        </div>

        {/* RIGHT: Redesigned Bank Transfer Side */}
        <div className="flex flex-col">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-sm h-full flex flex-col">
            
            <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Bank Transfer</h3>
                <p className="text-xs text-gray-500 mt-0.5">Dedicated auto-funding accounts</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                <BuildingLibraryIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              {virtualAccounts.length > 0 ? (
                <div className="space-y-4">
                  {virtualAccounts.map((account) => (
                    <AccountCard
                      key={account.id}
                      bankName={account.bankName}
                      accountNumber={account.accountNumber}
                      accountName={account.accountName}
                    />
                  ))}

                  <div className="pt-4 mt-auto">
                    <GenerateAccountControls existingAccounts={virtualAccounts} />
                    <div className="flex items-center justify-center gap-4 text-[10px] sm:text-xs text-gray-400 mt-4">
                      <span className="flex items-center gap-1"><ShieldCheckIcon className="h-3.5 w-3.5"/> Secure</span>
                      <span className="flex items-center gap-1"><ShieldCheckIcon className="h-3.5 w-3.5"/> Automated</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                  <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <BuildingLibraryIcon className="h-6 w-6 text-gray-300" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">No Accounts Yet</h3>
                  <p className="text-xs text-gray-500 mb-5 max-w-[200px]">Create a dedicated virtual account to accept bank transfers.</p>
                  <GenerateAccountControls existingAccounts={virtualAccounts} />
                </div>
              )}
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
}
