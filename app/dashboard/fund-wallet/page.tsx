import React from 'react';
import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { InformationCircleIcon, BuildingLibraryIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
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
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Fund Your Wallet</h1>
        <p className="text-gray-500 mt-1 text-lg">Choose how you want to top up your balance.</p>
      </div>

      {/* Modern Warning Banner */}
      <div className="mb-8 flex items-start gap-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-5 border border-orange-100 shadow-sm">
        <div className="p-2 bg-orange-100 rounded-full">
          <InformationCircleIcon className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-orange-900 uppercase tracking-wider mb-1">Strict Policy Notice</h3>
          <p className="text-sm text-orange-800 leading-relaxed">
            Funds deposited are strictly for processing services on this platform. 
            <span className="font-bold underline ml-1">Withdrawals back to banks are not permitted.</span> 
            Fund only what you intend to use.
          </p>
        </div>
      </div>

      {/* Grid Layout: Left (Paystack) | Right (Bank Transfer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* LEFT COLUMN: Paystack Instant Funding */}
        <div className="lg:col-span-5 flex flex-col">
          <PaystackFundForm email={user.email} />
        </div>

        {/* RIGHT COLUMN: Bank Transfers */}
        <div className="lg:col-span-7 flex flex-col">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl shadow-gray-200/40">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Bank Transfer</h3>
                <p className="text-sm text-gray-500 mt-1">Send money to your dedicated accounts.</p>
              </div>
              <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                <BuildingLibraryIcon className="h-6 w-6 text-gray-400" />
              </div>
            </div>

            {virtualAccounts.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {virtualAccounts.map((account) => (
                    <div key={account.id} className="transition-transform hover:-translate-y-1 duration-300">
                      <AccountCard
                        bankName={account.bankName}
                        accountNumber={account.accountNumber}
                        accountName={account.accountName}
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                   <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                     <ArrowPathIcon className="h-4 w-4 animate-spin-slow" />
                     Auto-credits in seconds
                   </div>
                   <GenerateAccountControls existingAccounts={virtualAccounts} />
                </div>
              </div>
            ) : (
              <div className="text-center py-10 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <BuildingLibraryIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-900">No Accounts Generated</h3>
                <p className="text-gray-500 text-sm mb-6 mt-1">Create a dedicated virtual account to accept bank transfers.</p>
                <GenerateAccountControls existingAccounts={virtualAccounts} />
              </div>
            )}
          </div>

        </div>
      </div>
      
    </div>
  );
}
