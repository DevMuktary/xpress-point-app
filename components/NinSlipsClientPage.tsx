"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  CheckCircleIcon,
  XMarkIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading'; 

type Props = {
  prices: { [key: string]: number };
};
type SlipType = 'Regular' | 'Standard' | 'Premium';
const exampleImageMap = {
  Regular: '/examples/nin_regular_example.png',
  Standard: '/examples/nin_standard_example.png',
  Premium: '/examples/nin_premium_example.png',
};

export default function NinSlipsClientPage({ prices }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [modalState, setModalState] = useState({ 
    isOpen: false, 
    slipType: null as SlipType | null, 
    price: 0 
  });
  
  // Form State
  const [verificationId, setVerificationId] = useState('');

  const handleSlipClick = (slipType: SlipType) => {
    const price = prices[slipType.toUpperCase() as keyof typeof prices] || 0;
    setModalState({
      isOpen: true,
      slipType: slipType,
      price: price,
    });
  };

  const confirmGenerateSlip = async () => {
    if (!modalState.slipType) return;
    
    setIsLoading(true);
    setError(null);
    setModalState(prev => ({ ...prev, isOpen: false }));

    try {
      const response = await fetch('/api/services/nin/generate-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: verificationId,
          slipType: modalState.slipType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Slip generation failed.');
      }

      const buffer = await response.arrayBuffer();
      downloadPdf(buffer, `nin_slip_${modalState.slipType.toLowerCase()}.pdf`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPdf = (buffer: ArrayBuffer, filename: string) => {
    const blob = new Blob([buffer], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {isLoading && <Loading />}
      
      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-center text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* 1. Enter Verification ID */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900">Enter Verification ID</h3>
        <p className="text-sm text-gray-600 mt-1">
          Enter the Verification ID from your <Link href="/dashboard/history/verification" className="text-blue-600 underline">Verification History</Link> to reprint a slip.
        </p>
        
        <div className="mt-4">
          <label htmlFor="verificationId" className="block text-sm font-medium text-gray-700">
            Verification ID
          </label>
          <input
            type="text"
            id="verificationId"
            value={verificationId}
            onChange={(e) => setVerificationId(e.target.value)}
            placeholder="Enter the ID from your history..."
            className="mt-1 w-full rounded-lg border border-gray-300 p-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* 2. Choose Slip Type */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900">Generate Slip</h3>
        <div className="mt-2 mb-4 flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          <InformationCircleIcon className="h-5 w-5 flex-shrink-0" />
          <p>Verified data is saved for 24 hours. You can only reprint slips for verifications from the last 24 hours.</p>
        </div>
        
        <div className="mt-4 grid grid-cols-1 gap-4">
          <button 
            onClick={() => handleSlipClick('Regular')}
            disabled={isLoading || !verificationId}
            className="group flex items-center justify-between rounded-lg border border-gray-300 bg-white p-4 text-left transition-all hover:border-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div>
              <span className="font-bold text-gray-800">Regular Slip</span>
              <span className="block text-sm text-gray-600">Standard slip for general use.</span>
            </div>
            <span className="text-lg font-bold text-blue-600">
              ₦{prices.NIN_SLIP_REGULAR || 0}
            </span>
          </button>
          <button 
            onClick={() => handleSlipClick('Standard')}
            disabled={isLoading || !verificationId}
            className="group flex items-center justify-between rounded-lg border border-gray-300 bg-white p-4 text-left transition-all hover:border-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div>
              <span className="font-bold text-gray-800">Standard Slip</span>
              <span className="block text-sm text-gray-600">Improved design with QR code.</span>
            </div>
            <span className="text-lg font-bold text-blue-600">
              ₦{prices.NIN_SLIP_STANDARD || 0}
            </span>
          </button>
          <button 
            onClick={() => handleSlipClick('Premium')}
            disabled={isLoading || !verificationId}
            className="group flex items-center justify-between rounded-lg border border-gray-300 bg-white p-4 text-left transition-all hover:border-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div>
              <span className="font-bold text-gray-800">Premium Slip</span>
              <span className="block text-sm text-gray-600">High-resolution secure design.</span>
            </div>
            <span className="text-lg font-bold text-blue-600">
              ₦{prices.NIN_SLIP_PREMIUM || 0}
            </span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Confirm Purchase
              </h2>
              <button onClick={() => setModalState({ isOpen: false, slipType: null, price: 0 })}>
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-center text-gray-600">
                You are about to generate the{' '}
                <strong className="font-bold text-gray-900">{modalState.slipType} Slip</strong> for ID:
              </p>
              <p className="text-center font-semibold text-gray-800 break-all">{verificationId}</p>
              <p className="text-center text-gray-600 mt-4">
                You will be charged{' '}
                <strong className="text-2xl font-bold text-blue-600">
                  ₦{modalState.price}
                </strong>.
              </p>
            </div>
            <div className="flex gap-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-2xl">
              <button
                onClick={() => setModalState({ isOpen: false, slipType: null, price: 0 })}
                className="flex-1 rounded-lg bg-white py-2.5 px-4 text-sm font-semibold text-gray-800 border border-gray-300 transition-colors hover:bg-gray-100"
              >
                NO
              </button>
              <button
                onClick={confirmGenerateSlip}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                YES, CONTINUE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
