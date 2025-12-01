"use client"; // This is a highly interactive page

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IdentificationIcon, InformationCircleIcon, ChevronLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import SafeImage from '@/components/SafeImage';
import ServiceUnavailable from '@/components/ServiceUnavailable';

// --- Helper Functions ---
function displayField(value: any): string {
  if (value === null || value === undefined || value === "" || value === "****") {
    return ''; 
  }
  return decodeHtmlEntities(value.toString());
}

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

function formatGender(gender: string): string {
  if (!gender) return '';
  const g = gender.toLowerCase();
  if (g === 'male' || g === 'm') return 'M';
  if (g === 'female' || g === 'f') return 'F';
  return g;
}

const DataRow = ({ label, value }: { label: string; value: any }) => (
  <div className="py-2.5 grid grid-cols-3 gap-4 border-b border-gray-50 last:border-0">
    <p className="text-sm font-medium text-gray-500 col-span-1">{label}</p>
    <p className="text-base font-semibold text-gray-900 col-span-2 break-words">{displayField(value)}</p>
  </div>
);

// --- Types ---
// UPDATED: Added optional capitalized keys to handle inconsistent API responses
type NinData = {
  photo: string;
  // Handle variations for First Name
  firstname?: string;
  FirstName?: string; 
  Firstname?: string;
  // Handle variations for Surname
  surname?: string;
  Surname?: string;
  // Handle variations for Middle Name
  middlename?: string;
  MiddleName?: string;
  Middlename?: string;
  
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

type VerificationResponse = {
  verificationId: string;
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

// --- Main Component ---
export default function VerifyByNinClientPage({ serviceFee, isActive }: { serviceFee: number, isActive: boolean }) {
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verificationData, setVerificationData] = useState<VerificationResponse | null>(null);
  const [modalState, setModalState] = useState<ModalState>({ 
    isOpen: false, slipType: null, price: 0, exampleImage: '' 
  });

  const lookupFee = serviceFee; 

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setVerificationData(null);

    // Validation for NIN
    const isNumeric = /^[0-9]+$/;
    if (!isNumeric.test(searchValue)) {
      setError("Input must only contain numbers.");
      setIsLoading(false);
      return;
    }
    if (searchValue.length !== 11) {
      setError("NIN must be exactly 11 digits.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/services/nin/lookup-nin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nin: searchValue,
        }),
      });

      const data = await response.json();
      
      // DEBUG: Uncomment this line to see exactly what keys the API is sending in your browser console
      // console.log("API Response Data:", data);

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed.');
      }

      setVerificationData(data);
      setSuccess("Verification successful!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmGenerateSlip = async () => {
    if (!verificationData || !modalState.slipType) return;
    
    const { verificationId } = verificationData;
    const { slipType } = modalState;
    
    setModalState({ isOpen: false, slipType: null, price: 0, exampleImage: '' });
    setIsLoading(true);
    setError(null);

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
    if (!verificationData) return;
    setModalState({
      isOpen: true,
      slipType: slipType,
      price: verificationData.slipPrices[slipType],
      exampleImage: exampleImageMap[slipType],
    });
  };

  const resetSearch = () => {
    setVerificationData(null);
    setError(null);
    setSuccess(null);
    setSearchValue('');
  };

  const renderSearchForm = () => (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900">Enter NIN</h3>
      <p className="text-sm text-gray-600 mt-1">Please enter the 11-digit NIN to verify.</p>
      
      <form onSubmit={handleLookup} className="mt-4">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <IdentificationIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="tel"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Enter 11-digit NIN"
            className="w-full rounded-lg border border-gray-300 p-3 pl-10 text-lg shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Searching...' : `Verify (Fee: ₦${lookupFee})`}
        </button>
      </form>
    </div>
  );
   
  const renderResults = (data: VerificationResponse) => (
    <div className="rounded-2xl bg-white shadow-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Verified Information</h2>
          <button
            onClick={resetSearch}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            + New Lookup
          </button>
        </div>
        <div className="flex justify-center mb-6">
          <SafeImage
            src={`data:image/png;base64,${data.data.photo}`}
            alt="User Photo"
            width={120}
            height={120}
            className="rounded-lg border-4 border-gray-100 shadow-sm"
            fallbackSrc="/logos/default.png"
          />
        </div>
        <div className="divide-y divide-gray-100">
          {/* UPDATED: Checks for lowercase OR PascalCase OR CamelCase to ensure name always shows */}
          <DataRow 
            label="First Name" 
            value={data.data.firstname || data.data.FirstName || data.data.Firstname} 
          />
          <DataRow 
            label="Middle Name" 
            value={data.data.middlename || data.data.MiddleName || data.data.Middlename} 
          />
          <DataRow 
            label="Last Name" 
            value={data.data.surname || data.data.Surname} 
          />
          
          <DataRow label="NIN" value={data.data.nin} />
          <DataRow label="Phone No" value={data.data.telephoneno} />
          <DataRow label="Date of Birth" value={data.data.birthdate} />
          <DataRow label="Gender" value={formatGender(data.data.gender || '')} />
          <DataRow label="Address" value={data.data.residence_AdressLine1} />
          <DataRow label="LGA / State" value={`${displayField(data.data.residence_lga)}, ${displayField(data.data.residence_state)}`} />
          <DataRow label="Tracking ID" value={data.data.trackingId} />
        </div>
      </div>
      
      {/* Slip Generation Section */}
      <div className="border-t border-gray-100 bg-gray-50 p-6 rounded-b-2xl">
        <h3 className="text-lg font-semibold text-gray-900">Generate Slip</h3>
        <div className="mt-2 mb-4 flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          <InformationCircleIcon className="h-5 w-5 flex-shrink-0" />
          <p>Verified data is saved for 24 hours. You can re-download paid slips from your history during this time.</p>
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
              ₦{displayField(data.slipPrices.Regular)}
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
              ₦{displayField(data.slipPrices.Standard)}
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
              ₦{displayField(data.slipPrices.Premium)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  // --- CHECK UNAVAILABILITY ---
  if (!isActive) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <ServiceUnavailable 
          message="The NIN Lookup service is currently undergoing maintenance. Please check back later." 
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {isLoading && <Loading />}
      
      {/* ... (Search Header, Error/Success Messages) ... */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/services/nin" className="text-gray-500 hover:text-gray-900">
            <ChevronLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Verify by NIN</h1>
        </div>
        {verificationData && (
          <button
            onClick={resetSearch}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            + New Lookup
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-center text-sm font-medium text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg bg-green-100 p-4 text-center text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {!verificationData ? renderSearchForm() : renderResults(verificationData)}
      
      {/* Confirmation Modal */}
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
                <strong className="font-bold text-gray-900">{modalState.slipType} Slip</strong> for:
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
