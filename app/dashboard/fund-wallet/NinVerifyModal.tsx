"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/app/loading'; 
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function NinVerifyModal() {
  const router = useRouter(); 

  // --- Modal State ---
  const [isOpen, setIsOpen] = useState(false);
  
  // --- This is the new 2-step flow ---
  const [step, setStep] = useState(1); // 1: Enter Details, 2: Success
  
  // --- Form States ---
  const [nin, setNin] = useState('');
  const [dob, setDob] = useState(''); 
  
  // --- UI States ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Step 1: Verify NIN ---
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Call our new verification API
      const response = await fetch('/api/wallet/nin-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nin, dob }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Verification failed.');
      }

      // --- SUCCESS! ---
      // Move to Step 2 (Success Message)
      setStep(2);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const closeModalAndRefresh = () => {
    setIsOpen(false);
    router.refresh(); // Refresh the whole page
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mt-6 flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
      >
        Activate Your Wallet
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          
          {isLoading && <Loading />}
          
          <div 
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            style={{ display: isLoading ? 'none' : 'block' }}
          >
            <button
              onClick={closeModalAndRefresh}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* --- Step 1: Verification Form --- */}
            {step === 1 && (
              <form onSubmit={handleVerify}>
                <h2 className="text-xl font-bold text-gray-900 text-left">
                  Verify Identity
                </h2>
                <p className="mt-2 text-sm text-gray-600 text-left">
                  Enter your NIN and Date of Birth to activate your wallet. This is a free, one-time check.
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
                  Verify
                </button>
              </form>
            )}

            {/* --- Step 2: Success Message --- */}
            {step === 2 && (
              <div className="text-center">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  Verification Successful!
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Your identity has been verified. The page will now refresh.
                </p>
                <button
                  type="button"
                  onClick={closeModalAndRefresh}
                  className="mt-6 flex w-full justify-center rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
