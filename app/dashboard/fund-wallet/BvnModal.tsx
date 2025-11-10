"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/app/loading'; // Use our global loader

export default function BvnModal() {
  const router = useRouter(); // To refresh the page on success

  // --- Modal State ---
  const [isOpen, setIsOpen] = useState(false);
  
  // --- Form States (Simpler) ---
  const [bvn, setBvn] = useState('');
  const [dob, setDob] = useState(''); // Date of Birth
  
  // --- UI States ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- NEW Single Submit Handler ---
  const handleActivateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Call our new, single API
      const response = await fetch('/api/wallet/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bvn, dob }),
      });

      const data = await response.json();
      if (!response.ok) {
        // This will now show "Date of Birth does not match" or any other error
        throw new Error(data.error || 'Activation failed.');
      }

      // --- SUCCESS! ---
      // Close the modal and refresh the entire page.
      // This will cause the Server Component to re-run
      // and show the new account numbers.
      setIsOpen(false);
      router.refresh();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* The "Activate Wallet" button */}
      <button
        onClick={() => setIsOpen(true)}
        className="mt-6 flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
      >
        Activate Your Wallet
      </button>

      {/* --- The Modal --- */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          
          {isLoading && <Loading />}
          
          <div 
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            style={{ display: isLoading ? 'none' : 'block' }} // Hide form when loading
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* --- Modal Content: ONE STEP ONLY --- */}
            <form onSubmit={handleActivateWallet}>
              <h2 className="text-xl font-bold text-gray-900 text-left">
                Verify Identity
              </h2>
              <p className="mt-2 text-sm text-gray-600 text-left">
                Enter your BVN and Date of Birth to activate your wallet.
              </p>
              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="bvn" className="block text-sm font-medium text-gray-700 text-left">
                    BVN
                  </label>
                  <input
                    id="bvn"
                    type="tel"
                    maxLength={11}
                    value={bvn}
                    onChange={(e) => setBvn(e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-lg shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="dob" className="block text-sm font-medium text-gray-700 text-left">
                    Date of Birth
                  </label>
                  <input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-lg shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                className="mt-6 flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
              >
                Activate Wallet
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
