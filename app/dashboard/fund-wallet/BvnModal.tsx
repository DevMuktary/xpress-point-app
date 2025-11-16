"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/app/loading';

export default function BvnModal() {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [bvn, setBvn] = useState('');
  const [dob, setDob] = useState('');
  const [verifiedData, setVerifiedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/wallet/bvn-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bvn, dob }),
      });

      const data = await response.json();

      // === DEBUG LOGGING ===
      console.log('=== BVN VERIFY RESPONSE ===');
      console.log('Response OK:', response.ok);
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(data, null, 2));
      console.log('===========================');

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed.');
      }

      if (!data.firstName || !data.lastName || !data.bvn) {
        throw new Error('Invalid response from verification service.');
      }

      setVerifiedData(data);
      setStep(2);

    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateWallet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        bvn: verifiedData.bvn,
        firstName: verifiedData.firstName,
        lastName: verifiedData.lastName,
        finalNin: verifiedData.finalNin || verifiedData.bvn
      };

      console.log('=== WALLET ACTIVATE REQUEST ===');
      console.log('Payload:', JSON.stringify(payload, null, 2));
      console.log('===============================');

      const response = await fetch('/api/wallet/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log('=== WALLET ACTIVATE RESPONSE ===');
      console.log('Response OK:', response.ok);
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(data, null, 2));
      console.log('================================');

      if (!response.ok) {
        throw new Error(data.error || 'Activation failed.');
      }

      alert('Wallet activated successfully!');
      setIsOpen(false);
      router.refresh();

    } catch (err: any) {
      console.error('=== WALLET ACTIVATION ERROR ===');
      console.error('Error message:', err.message);
      console.error('Full error:', err);
      console.error('===============================');
      setError(err.message);
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
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {step === 1 && (
              <form onSubmit={handleVerify}>
                <h2 className="text-xl font-bold text-gray-900 text-left">Verify Identity</h2>
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

            {step === 2 && verifiedData && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 text-left">Confirm Details</h2>
                <p className="mt-2 text-sm text-gray-600 text-left">
                  Please confirm these details are correct before activating.
                </p>
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
