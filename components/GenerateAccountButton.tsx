"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/app/loading';
import { BanknotesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function GenerateAccountButton() {
  const router = useRouter(); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateAccounts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call our new "create" API
      const response = await fetch('/api/wallet/create-virtual-accounts', {
        method: 'POST',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Account generation failed.');
      }

      // Success! Refresh the page to show the new accounts
      router.refresh();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {isLoading && <Loading />}
      
      {/* --- The Red Notice --- */}
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
      
      {/* --- The "Generate" Button Card --- */}
      <div className="rounded-2xl bg-white p-6 text-center shadow-lg">
        <BanknotesIcon className="mx-auto h-12 w-12 text-blue-500" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">
          One More Step!
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Your identity is verified. Click the button below to
          generate your personal OPay and Palmpay account numbers.
        </p>
        
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        
        <button
          onClick={handleCreateAccounts}
          disabled={isLoading}
          className="mt-6 flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Generating Accounts..." : "Generate Account Numbers"}
        </button>
      </div>
    </div>
  );
}
