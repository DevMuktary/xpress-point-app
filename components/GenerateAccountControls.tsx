"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/app/loading';
import { BanknotesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { VirtualAccount } from '@prisma/client';

type Props = {
  existingAccounts: VirtualAccount[];
};

// This component shows buttons for accounts that *don't* exist yet
export default function GenerateAccountControls({ existingAccounts }: Props) {
  const router = useRouter(); 
  const [isLoading, setIsLoading] = useState<string | null>(null); // 'palmpay' or 'opay'
  const [error, setError] = useState<string | null>(null);

  // Check which accounts already exist
  const hasPalmpay = existingAccounts.some(acc => acc.bankName === 'Palmpay');
  const hasOpay = existingAccounts.some(acc => acc.bankName === 'Opay'); // Assuming 'Opay' is the name

  // If both accounts exist, show nothing.
  if (hasPalmpay && hasOpay) {
    return null;
  }

  const handleCreateAccount = async (bankCode: string, networkName: string) => {
    setIsLoading(networkName);
    setError(null);

    try {
      // Call our new "create" API with the specific bank code
      const response = await fetch('/api/wallet/create-virtual-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankCode }) // Send the bank code
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Account generation failed.');
      }

      // Success! Refresh the page to show the new account
      router.refresh();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="flex items-center gap-4">
        <BanknotesIcon className="h-10 w-10 text-blue-500" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Generate Your Accounts
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Click a button to generate your personal account number for that bank.
          </p>
        </div>
      </div>
        
      {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
        
      {/* This is your new 2-button layout */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* PalmPay Button */}
        {!hasPalmpay && (
          <button
            onClick={() => handleCreateAccount('20946', 'palmpay')} // Palmpay Code
            disabled={isLoading !== null}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading === 'palmpay' ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <img src="/logos/palmpay.png" alt="Palmpay" className="h-5 w-5" /> // Add logo
            )}
            {isLoading === 'palmpay' ? 'Generating...' : 'Generate PalmPay Account'}
          </button>
        )}
        
        {/* OPay Button */}
        {!hasOpay && (
          <button
            onClick={() => handleCreateAccount('20897', 'opay')} // OPay Code
            disabled={isLoading !== null}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-800 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-900 disabled:opacity-50"
          >
            {isLoading === 'opay' ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <img src="/logos/opay.png" alt="OPay" className="h-5 w-5" /> // Add logo
            )}
            {isLoading === 'opay' ? 'Generating...' : 'Generate OPay Account'}
          </button>
        )}
      </div>
    </div>
  );
}
