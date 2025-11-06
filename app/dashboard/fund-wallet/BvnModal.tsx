"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/app/loading'; // Use our global loader

export default function BvnModal() {
  const router = useRouter(); // To refresh the page on success

  // --- Modal State ---
  const [isOpen, setIsOpen] = useState(false);
  
  // --- Form States ---
  const [step, setStep] = useState(1); // 1 for BVN, 2 for NIN fallback
  const [bvn, setBvn] = useState('');
  const [dob, setDob] = useState(''); // Date of Birth
  const [nin, setNin] = useState(''); // For the fallback
  
  // --- UI States ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Step 1: Handle BVN Verification ---
  const handleBvnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Call the API we planned
      const response = await fetch('/api/wallet/verify-bvn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bvn, dob }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'BVN verification failed.');
      }

      // Check the response
      if (data.status === 'NIN_REQUIRED') {
        // Go to Step 2: NIN Fallback
        setStep(2);
      } else if (data.status === 'IDENTITY_VERIFIED') {
        // Success! Now we call the next API to create the account
        await handleCreateAccount(data.nin);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 2: Handle NIN Fallback Submit ---
  const handleNinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (nin.length !== 11) {
        throw new Error('Please enter a valid 11-digit NIN.');
      }
      // Call the account creation API with the manually entered NIN
      await handleCreateAccount(nin);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 3: Call the Account Creation API ---
  const handleCreateAccount = async (verifiedNin: string) => {
    setError(null);
    setIsLoading(true); // Show loader for the final step

    try {
      const response = await fetch('/api/wallet/create-virtual-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nin: verifiedNin }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create virtual account.');
      }

      // --- SUCCESS! ---
      // Close the modal and refresh the entire page.
      // This will cause the Server Component to re-run
      // and show the new account numbers.
      setIsOpen(false);
      router.refresh();

    } catch (err: any) {
      // Handle the error (e.g., "Failed to create account")
      setError(err.message);
      setIsLoading(false); // Stop loading so user can see the error
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
          
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              disabled={isLoading}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* --- Modal Content: Step 1 (BVN) --- */}
            {step === 1 && (
              <form onSubmit={handleBvnSubmit}>
                <h2 className="text-xl font-bold text-gray-900 text-left">
                  Step 1: Verify Identity
                </h2>
                <p className="mt-2 text-sm text-gray-600 text-left">
                  Enter your BVN and Date of Birth to continue.
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
                  disabled={isLoading}
                  className="mt-6 flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  Verify
                </button>
              </form>
            )}

            {/* --- Modal Content: Step 2 (NIN Fallback) --- */}
            {step === 2 && (
              <form onSubmit={handleNinSubmit}>
                <h2 className="text-xl font-bold text-gray-900 text-left">
                  Step 2: Confirm NIN
                </h2>
                <p className="mt-2 text-sm text-gray-600 text-left">
                  BVN verified! Please enter your 11-digit NIN to create your secure wallet.
                </p>
                <div className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="nin" className="block text-sm font-medium text-gray-700 text-left">
                      NIN
                    </label>
                    <input
                      id="nin"
                      type="tel"
                      maxLength={11}
                      value={nin}
                      onChange={(e) => setNin(e.target.value)}
                      required
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-lg shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-6 flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  Create Wallet
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
