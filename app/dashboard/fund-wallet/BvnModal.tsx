"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/app/loading'; // Use our global loader

export default function BvnModal() {
  const router = useRouter(); // To refresh the page on success

  // --- Modal State ---
  const [isOpen, setIsOpen] = useState(false);
  
  // --- Step Logic ---
  const [step, setStep] = useState(1); // 1: Enter Details, 2: Confirm
  
  // --- Form States ---
  const [bvn, setBvn] = useState('');
  const [dob, setDob] = useState(''); // Date of Birth
  
  // --- Verified Data State ---
  const [verifiedData, setVerifiedData] = useState<any>(null);
  
  // --- UI States ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Step 1: Verify BVN ---
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Call our verification API
      const response = await fetch('/api/wallet/bvn-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bvn, dob }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Verification failed.');
      }

      // --- SUCCESS! ---
      // Save the verified data and move to Step 2
      setVerifiedData(data);
      setStep(2);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- Step 2: Activate Wallet (Charge user) ---
  const handleActivateWallet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call our activation API
      const response = await fetch('/api/wallet/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifiedData), // Send all verified data
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Activation failed.');
      }

      // --- FINAL SUCCESS! ---
      setIsOpen(false);
      router.refresh();

    } catch (err: any) {
      // --- THIS IS THE FIX ---
      // We set the error and STAY on Step 2
      setError(err.message);
      // setStep(1); // <-- Removed this line
      // -----------------------
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setError(null);
    setStep(1);
    setBvn('');
    setDob('');
    setVerifiedData(null);
  }

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
              onClick={closeModal}
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
                  Verify
                </button>
              </form>
            )}

            {/* --- Step 2: Confirmation --- */}
            {step === 2 && verifiedData && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 text-left">
                  Confirm Details
                </h2>
                <p className="mt-2 text-sm text-gray-600 text-left">
                  Please confirm these details are correct before activating.
                </p>
                {/* --- THIS IS THE FIX (Part 2) --- */}
                {/* The NIN field is now removed */}
                <div className="mt-4 space-y-2 rounded-lg border bg-gray-50 p-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Name:</span>
                    <span className="text-sm font-semibold text-gray-900">{verifiedData.firstName} {verifiedData.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">BVN:</span>
                    <span className="text-sm font-semibold text-gray-900">{verifiedData.bvn}</span>
                  </div>
                </div>
                {/* ---------------------------------- */}
                
                {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
                
                <button
                  type="button"
                  onClick={handleActivateWallet}
                  className="mt-6 flex w-full justify-center rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700"
                >
                  Confirm & Activate Wallet
                </button>
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(null); }}
                  className="mt-2 flex w-full justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300"
                >
                  Go Back
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
