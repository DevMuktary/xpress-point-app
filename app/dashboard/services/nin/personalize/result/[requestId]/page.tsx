"use client"; // This is a highly interactive page

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeftIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import SafeImage from '@/components/SafeImage';

// --- (Helper functions for displaying data) ---
function decodeHtmlEntities(text: string): string {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}
function displayField(value: any): string {
  if (value === null || value === undefined || value === "") {
    return ''; // Return blank
  }
  return decodeHtmlEntities(value.toString());
}
function formatGender(gender: string): string {
  if (!gender) return '';
  const g = gender.toLowerCase();
  if (g === 'male' || g === 'm') return 'M';
  if (g === 'female' || g === 'f') return 'F';
  return g;
}
const DataRow = ({ label, value }: { label: string; value: any }) => (
  <div className="py-2.5 grid grid-cols-3 gap-4">
    <p className="text-sm font-medium text-gray-500 col-span-1">{label}</p>
    <p className="text-base font-semibold text-gray-900 col-span-2">{displayField(value)}</p>
  </div>
);

// --- (Types for the data we will fetch) ---
type NinData = {
  photo: string;
  firstname: string;
  surname: string;
  middlename: string;
  birthdate: string;
  nin: string;
  trackingId: string;
  residence_AdressLine1?: string;
  birthlga?: string;
  gender?: string;
  residence_lga?: string;
  residence_state?: string;
  telephoneno: string;
  birthstate?: string;
  maritalstatus?: string;
};
type ResultData = {
  data: NinData;
  slipPrices: {
    Regular: number;
    Standard: number;
    Premium: number;
  }
};
type ModalState = {
  isOpen: boolean;
  slipType: 'Regular' | 'Standard' | 'Premium' | null;
  price: number | 0;
  exampleImage: string;
};
const exampleImageMap = {
  Regular: '/examples/nin_regular_example.png',
  Standard: '/examples/nin_standard_example.png',
  Premium: '/examples/nin_premium_example.png',
};

// This is the new page component
export default function PersonalizationResultPage({ params }: { params: { requestId: string } }) {
  const { requestId } = params; // Get the ID from the URL
  
  const [isLoading, setIsLoading] = useState(true); // Start loading
  const [error, setError] = useState<string | null>(null);
  const [resultData, setResultData] = useState<ResultData | null>(null);

  const [modalState, setModalState] = useState<ModalState>({ 
    isOpen: false, 
    slipType: null, 
    price: 0, 
    exampleImage: '' 
  });
  
  // --- This runs ONCE when the page loads ---
  useEffect(() => {
    const fetchResult = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Call our new API to get the saved data
        const response = await fetch(`/api/services/nin/personalization-result?id=${requestId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Could not load result.');
        }
        setResultData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResult();
  }, [requestId]); // Re-run if the ID changes

  // --- (confirmGenerateSlip and downloadPdf are unchanged) ---
  const confirmGenerateSlip = async () => {
    if (!resultData || !modalState.slipType) return;
    
    const { slipType } = modalState;
    
    setModalState({ isOpen: false, slipType: null, price: 0, exampleImage: '' });
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/services/nin/personalization-generate-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: requestId, // Pass the requestId
          slipType: slipType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Slip generation failed.');
      }

      const buffer = await response.arrayBuffer();
      downloadPdf(buffer, `nin_slip_${slipType.toLowerCase()}.pdf`);

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
  
  const handleSlipClick = (slipType: 'Regular' | 'Standard' | 'Premium') => {
    if (!resultData) return;
    setModalState({
      isOpen: true,
      slipType: slipType,
      price: resultData.slipPrices[slipType],
      exampleImage: exampleImageMap[slipType],
    });
  };

  // --- Main Render ---
  return (
    <div className="w-full max-w-3xl mx-auto">
      {isLoading && <Loading />}
      
      {/* --- Page Header --- */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/services/nin/personalize" className="text-gray-500 hover:text-gray-900">
            <ChevronLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Personalization Result</h1>
        </div>
      </div>
      
      {/* --- Error Message Display --- */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-center text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* --- This is the "Verified Information" card --- */}
      {resultData && (
        <div className="rounded-2xl bg-white shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Verified Information</h2>
            <div className="flex justify-center mb-4">
              <SafeImage
                src={`data:image/png;base64,${resultData.data.photo}`}
                alt="User Photo"
                width={100}
                height={100}
                className="rounded-full border-4 border-gray-100"
                fallbackSrc="/logos/default.png"
              />
            </div>
            <div className="divide-y divide-gray-100">
              <DataRow label="First Name" value={resultData.data.firstname} />
              <DataRow label="Middle Name" value={resultData.data.middlename} />
              <DataRow label="Last Name" value={resultData.data.surname} />
              <DataRow label="ID" value={resultData.data.nin} />
              <DataRow label="Tracking ID" value={resultData.data.trackingId} />
              <DataRow label="Address" value={resultData.data.residence_AdressLine1} />
              <DataRow label="L.G. Origin" value={resultData.data.birthlga} />
              <DataRow label="Gender" value={formatGender(resultData.data.gender || '')} />
              <DataRow 
                label="Address" 
                value={`${displayField(resultData.data.residence_lga)}, ${displayField(resultData.data.residence_state)}`} 
              />
              <DataRow label="DOB" value={resultData.data.birthdate} />
              <DataRow label="Phone Number" value={resultData.data.telephoneno} />
              <DataRow label="State of Origin" value={resultData.data.birthstate} />
              <DataRow label="Marital Status" value={resultData.data.maritalstatus} />
            </div>
          </div>
          
          {/* --- This is the "Generate Slip" section --- */}
          <div className="border-t border-gray-100 bg-gray-50 p-6 rounded-b-2xl">
            <h3 className="text-lg font-semibold text-gray-900">Generate Slip</h3>
            <div className="mt-2 mb-4 flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
              <InformationCircleIcon className="h-5 w-5 flex-shrink-0" />
              <p>You can now generate a slip with this new data. This is a new charge.</p>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4">
              <button 
                onClick={() => handleSlipClick('Regular')}
                disabled={isLoading}
                className="group flex items-center justify-between rounded-lg border border-gray-300 bg-white p-4 text-left transition-all hover:border-blue-600 hover:bg-blue-50 disabled:opacity-50"
              >
                <div>
                  <span className="font-bold text-gray-800">Regular Slip</span>
                  <span className="block text-sm text-gray-600">Standard slip for general use.</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  ₦{displayField(resultData.slipPrices.Regular)}
                </span>
              </button>
              <button 
                onClick={() => handleSlipClick('Standard')}
                disabled={isLoading}
                className="group flex items-center justify-between rounded-lg border border-gray-300 bg-white p-4 text-left transition-all hover:border-blue-600 hover:bg-blue-50 disabled:opacity-50"
              >
                <div>
                  <span className="font-bold text-gray-800">Standard Slip</span>
                  <span className="block text-sm text-gray-600">Improved design with QR code.</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  ₦{displayField(resultData.slipPrices.Standard)}
                </span>
              </button>
              <button 
                onClick={() => handleSlipClick('Premium')}
                disabled={isLoading}
                className="group flex items-center justify-between rounded-lg border border-gray-300 bg-white p-4 text-left transition-all hover:border-blue-600 hover:bg-blue-50 disabled:opacity-50"
              >
                <div>
                  <span className="font-bold text-gray-800">Premium Slip</span>
                  <span className="block text-sm text-gray-600">High-resolution secure design.</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  ₦{displayField(resultData.slipPrices.Premium)}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- This is the "Confirmation Modal" --- */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Confirm Purchase
              </h2>
              <button onClick={() => setModalState({ isOpen: false, slipType: null, price: 0, exampleImage: '' })}>
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-center text-gray-600">
                You are about to generate the{' '}
                <strong className="font-bold text-gray-900">{modalState.slipType} Slip</strong>.
              </p>
              <div className="my-4 w-full h-48 relative border border-gray-200 rounded-lg overflow-hidden">
                <Image
                  src={modalState.exampleImage}
                  alt={`${modalState.slipType} Slip Example`}
                  layout="fill"
                  objectFit="contain"
                  className="bg-gray-50"
                />
              </div>
              <p className="text-center text-gray-600">
                You will be charged{' '}
                <strong className="text-2xl font-bold text-blue-600">
                  ₦{modalState.price}
                </strong>.
              </p>
              <p className="text-center text-sm text-gray-500">
                Are you sure you want to continue?
              </p>
            </div>
            <div className="flex gap-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-2xl">
              <button
                onClick={() => setModalState({ isOpen: false, slipType: null, price: 0, exampleImage: '' })}
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
