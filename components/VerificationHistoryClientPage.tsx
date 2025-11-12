"use client"; // This is an interactive component

import React, { useState } from 'react';
import { NinVerification, Transaction } from '@prisma/client';
import { 
  CheckCircleIcon,
  InformationCircleIcon, 
  PrinterIcon,
  XMarkIcon,
  DocumentMagnifyingGlassIcon // <-- THIS IS THE FIX
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Image from 'next/image';

// Define the props to receive the initial data from the server
// We add 'data: any' because Prisma's Json type is not specific
type HistoryRequest = {
  id: string;
  expiresAt: Date; // We use expiresAt
  data: any; 
  transactions: { serviceId: string | null }[]; // List of slips already bought
};

type Props = {
  initialRequests: HistoryRequest[];
};

// --- "World-Class" Types for the Modal ---
type ModalState = {
  isOpen: boolean;
  isPaidModal: boolean; // TRUE = We are charging, FALSE = Re-print
  verificationId: string | null;
  slipPrices: { Regular: number; Standard: number; Premium: number; };
  alreadyPaidSlips: string[]; // e.g., ["NIN_SLIP_REGULAR"]
};

const exampleImageMap = {
  Regular: '/examples/nin_regular_example.png',
  Standard: '/examples/nin_standard_example.png',
  Premium: '/examples/nin_premium_example.png',
};

// "World-class" map from serviceId to simple name
const slipNameMap: { [key: string]: string } = {
  NIN_SLIP_REGULAR: "Regular",
  NIN_SLIP_STANDARD: "Standard",
  NIN_SLIP_PREMIUM: "Premium",
};

export default function VerificationHistoryClientPage({ initialRequests }: Props) {
  const [requests, setRequests] = useState(initialRequests);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [modalState, setModalState] = useState<ModalState>({ 
    isOpen: false,
    isPaidModal: false, 
    verificationId: null, 
    slipPrices: { Regular: 100, Standard: 150, Premium: 200 }, // Prices
    alreadyPaidSlips: []
  });

  // --- "World-Class" Helper to format the date ---
  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // --- "World-Class" Helper to get the Name ---
  const getName = (data: any) => {
    // Handles data from BOTH API providers (ConfirmIdent and Raudah)
    const firstName = data.firstname || data.firs_tname || 'N/A';
    const lastName = data.surname || data.last_name || 'N/A';
    return `${firstName} ${lastName}`;
  };
  
  // --- "World-Class" Helper to get the NIN ---
  const getNin = (data: any) => data.nin || data.NIN || 'N/A';
  
  // --- "World-Class" Helper to get PAID slips ---
  const getPaidSlips = (request: HistoryRequest): string[] => {
    return request.transactions.map(tx => slipNameMap[tx.serviceId!]).filter(Boolean);
  };

  // --- "World-Class" API Call to Generate Slip ---
  const handleGenerateSlip = async (slipType: string) => {
    if (!modalState.verificationId) return;
    
    setIsLoading(true);
    setError(null);
    const verificationId = modalState.verificationId; // Save this before closing
    setModalState({ ...modalState, isOpen: false }); // Close modal

    try {
      const response = await fetch('/api/services/nin/generate-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: verificationId,
          slipType: slipType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Slip generation failed.');
      }

      const buffer = await response.arrayBuffer();
      downloadPdf(buffer, `nin_slip_${slipType.toLowerCase()}.pdf`);
      
      // "Refurbish" the history list to show the new purchase
      if (modalState.isPaidModal) {
        const updatedRequests = requests.map(req => 
          req.id === verificationId
            ? { ...req, transactions: [
                ...req.transactions, 
                { serviceId: `NIN_SLIP_${slipType.toUpperCase()}` }
              ]}
            : req
        );
        setRequests(updatedRequests);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- "World-Class" Download Helper ---
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
      {(isLoading) && <Loading />}

      {/* --- 1. The 24-Hour Warning --- */}
      <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-bold text-blue-800">
              History Expires After 24 Hours
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                For security, verification data is deleted after 24 hours. 
                You can re-print your slips for free until then.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* --- Error Message Display --- */}
      {error && (
        <div className="rounded-lg bg-red-100 p-4 text-center text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* --- 2. The "One-by-One" Card List (Your Design) --- */}
      <div className="space-y-4">
        {requests.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12" />
            <p className="mt-2 font-semibold">No Verifications Found</p>
            <p className="text-sm">You have not performed any NIN verifications in the last 24 hours.</p>
          </div>
        )}

        {requests.map((request) => {
          const paidSlips = getPaidSlips(request);
          
          return (
            <div 
              key={request.id} 
              className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                {/* Left Side (NIN & Name) */}
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    {getName(request.data)}
                  </p>
                  <p className="text-sm text-gray-600">
                    NIN: {getNin(request.data)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Expires: {formatDate(request.expiresAt)}
                  </p>
                </div>
                
                {/* Right Side (Button) */}
                <div className="mt-4 sm:mt-0 sm:ml-4">
                  <button
                    onClick={() => setModalState({ 
                      isOpen: true, 
                      isPaidModal: paidSlips.length === 0,
                      verificationId: request.id,
                      slipPrices: { Regular: 100, Standard: 150, Premium: 200 },
                      alreadyPaidSlips: paidSlips
                    })}
                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 flex items-center gap-2"
                  >
                    <PrinterIcon className="h-5 w-5" />
                    {paidSlips.length > 0 ? 'Re-print Slips' : 'Generate Slip'}
                  </button>
                </div>
              </div>
              
              {paidSlips.length > 0 && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <p className="text-xs font-medium text-gray-500">Slips already purchased:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {paidSlips.map(slipName => (
                      <span key={slipName} className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        <CheckCircleIcon className="h-4 w-4" />
                        {slipName} Slip
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* --- 3. The "Refurbished" "Smart" Modal --- */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {modalState.isPaidModal ? 'Generate New Slip' : 'Re-print Your Slips'}
              </h2>
              <button onClick={() => setModalState({ ...modalState, isOpen: false })}>
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              {modalState.isPaidModal ? (
                <p className="text-sm text-center text-gray-600">
                  This verification has no slips. Select a slip to purchase.
                </p>
              ) : (
                <p className="text-sm text-center text-gray-600">
                  This is a free reprint. Your wallet will <strong className="font-semibold text-gray-900">not</strong> be charged.
                </p>
              )}
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Regular Slip */}
                <button 
                  onClick={() => handleGenerateSlip('Regular')}
                  disabled={isLoading}
                  className="group flex flex-col items-center justify-between rounded-lg border border-gray-300 bg-white p-4 text-left transition-all hover:border-blue-600 hover:bg-blue-50"
                >
                  <Image src={exampleImageMap.Regular} alt="Regular Slip" width={150} height={95} className="rounded-md border" />
                  <span className="font-bold text-gray-800 mt-3">Regular Slip</span>
                  {modalState.alreadyPaidSlips.includes('Regular') ? (
                    <span className="text-sm font-medium text-green-600">Free Re-print</span>
                  ) : (
                    <span className="text-sm font-medium text-blue-600">Fee: ₦{modalState.slipPrices.Regular}</span>
                  )}
                </button>
                
                {/* Standard Slip */}
                <button 
                  onClick={() => handleGenerateSlip('Standard')}
                  disabled={isLoading}
                  className="group flex flex-col items-center justify-between rounded-lg border border-gray-300 bg-white p-4 text-left transition-all hover:border-blue-600 hover:bg-blue-50"
                >
                  <Image src={exampleImageMap.Standard} alt="Standard Slip" width={150} height={95} className="rounded-md border" />
                  <span className="font-bold text-gray-800 mt-3">Standard Slip</span>
                  {modalState.alreadyPaidSlips.includes('Standard') ? (
                    <span className="text-sm font-medium text-green-600">Free Re-print</span>
                  ) : (
                    <span className="text-sm font-medium text-blue-600">Fee: ₦{modalState.slipPrices.Standard}</span>
                  )}
                </button>

                {/* Premium Slip */}
                <button 
                  onClick={() => handleGenerateSlip('Premium')}
                  disabled={isLoading}
                  className="group flex flex-col items-center justify-between rounded-lg border border-gray-300 bg-white p-4 text-left transition-all hover:border-blue-600 hover:bg-blue-50"
                >
                  <Image src={exampleImageMap.Premium} alt="Premium Slip" width={150} height={95} className="rounded-md border" />
                  <span className="font-bold text-gray-800 mt-3">Premium Slip</span>
                  {modalState.alreadyPaidSlips.includes('Premium') ? (
                    <span className="text-sm font-medium text-green-600">Free Re-print</span>
                  ) : (
                    <span className="text-sm font-medium text-blue-600">Fee: ₦{modalState.slipPrices.Premium}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
