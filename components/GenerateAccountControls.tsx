"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowPathIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { VirtualAccount } from '@prisma/client';
import SafeImage from '@/components/SafeImage'; // Using our safe image component

type Props = {
  existingAccounts: VirtualAccount[];
};

export default function GenerateAccountControls({ existingAccounts }: Props) {
  const router = useRouter(); 
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check which accounts already exist
  const hasPalmpay = existingAccounts.some(acc => acc.bankName === 'Palmpay');
  // const hasOpay = existingAccounts.some(acc => acc.bankName === 'Opay'); // OPay Disabled

  // If PalmPay exists, we show nothing (since OPay is disabled for now)
  if (hasPalmpay) {
    return null;
  }

  const handleCreateAccount = async (bankCode: string, networkName: string) => {
    setIsLoading(networkName);
    setError(null);

    try {
      const response = await fetch('/api/wallet/create-virtual-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankCode })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Account generation failed.');
      }

      router.refresh();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <PlusCircleIcon className="h-6 w-6 text-purple-600" />
          Create Account
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Generate a dedicated account number to fund your wallet.
        </p>
      </div>
        
      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-sm font-medium text-center border-b border-red-100">
          {error}
        </div>
      )}
        
      <div className="p-5">
        {/* PalmPay Button (Hero Style) */}
        {!hasPalmpay && (
          <button
            onClick={() => handleCreateAccount('20946', 'palmpay')}
            disabled={isLoading !== null}
            className="group relative w-full overflow-hidden rounded-xl bg-[#673AB7] p-4 text-white shadow-lg transition-all hover:bg-[#5E35B1] hover:shadow-xl disabled:opacity-70"
          >
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                   {/* Logo or Icon */}
                   <SafeImage src="/logos/palmpay.png" alt="P" width={24} height={24} fallbackSrc="/logos/default.png" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">PalmPay</p>
                  <p className="text-xs text-purple-200">Instant Funding</p>
                </div>
              </div>
              
              {isLoading === 'palmpay' ? (
                <ArrowPathIcon className="h-6 w-6 animate-spin text-white/80" />
              ) : (
                <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  Generate
                </span>
              )}
            </div>
            
            {/* Decoration */}
            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
          </button>
        )}
        
        {/* OPay Button (DISABLED/HIDDEN) */}
        {/* {!hasOpay && (
           ... OPay button code ...
        )} 
        */}
      </div>
    </div>
  );
}
