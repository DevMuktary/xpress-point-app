"use client"; // This is a highly interactive page

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, IdentificationIcon, PhoneIcon } from '@heroicons/react/24/outline';
import Loading from '@/app/loading'; // Use our global loader
import SafeImage from '@/components/SafeImage'; // Our image component

// --- NEW: Helper function to trigger a file download ---
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

// --- (Helper functions below are unchanged) ---
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
    return '****';
  }
  return decodeHtmlEntities(value.toString());
}
function formatGender(gender: string): string {
  if (!gender) return '****';
  const g = gender.toLowerCase();
  if (g === 'male' || g === 'm') return 'M';
  if (g === 'female' || g === 'f') return 'F';
  return g;
}
const DataRow = ({ label, value }: { label: string; value: any }) => (
  <div className="py-2">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-base font-semibold text-gray-900">{displayField(value)}</p>
  </div>
);

// --- (Types are unchanged) ---
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
  telephoneno?: string;
  birthstate?: string;
  maritalstatus?: string;
};
type VerificationResponse = {
  verificationId: string;
  data: NinData;
  slipPrices: {
    regular: number;
    standard: number;
    premium: number;
  }
};

export default function NinVerificationPage() {
  const [searchType, setSearchType] = useState<'NIN' | 'PHONE'>('NIN');
  const [searchValue, setSearchValue] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [verificationData, setVerificationData] = useState<VerificationResponse | null>(null);

  const lookupFee = '150'; // Placeholder

  // --- (handleLookup is unchanged) ---
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setVerificationData(null);

    try {
      const response = await fetch('/api/services/nin/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: searchType,
          value: searchValue,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Verification failed.');
      }

      setVerificationData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- UPDATED: Handle Slip Generation ---
  const handleGenerateSlip = async (slipType: string) => {
    if (!verificationData) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/services/nin/generate-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: verificationData.verificationId,
          slipType: slipType, // e.g., "Regular"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Slip generation failed.');
      }

      // We got the PDF back!
      const buffer = await response.arrayBuffer();
      downloadPdf(buffer, `nin_slip_${slipType.toLowerCase()}.pdf`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- (renderSearchForm is unchanged) ---
  const renderSearchForm = () => (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-4 flex rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setSearchType('NIN')}
          className={`w-1/2 rounded-md py-2.5 text-sm font-medium ${
            searchType === 'NIN' ? 'bg-white shadow' : 'text-gray-600'
          }`}
        >
          Search by NIN
        </button>
        <button
          onClick={() => setSearchType('PHONE')}
          className={`w-1/2 rounded-md py-2.5 text-sm font-medium ${
            searchType === 'PHONE' ? 'bg-white shadow' : 'text-gray-600'
          }`}
        >
          Search by Phone
        </button>
      </div>
      <form onSubmit={handleLookup}>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {searchType === 'NIN' ? (
              <IdentificationIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <PhoneIcon className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <input
            type="tel"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchType === 'NIN' ? 'Enter 11-digit NIN' : 'Enter phone number'}
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
  
  // --- (renderResults is unchanged, BUT CORRECTED) ---
  const renderResults = (data: VerificationResponse) => (
    <div className="rounded-2xl bg-white shadow-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Verification Successful</h2>
          <button
            onClick={() => {
              setVerificationData(null);
              setError(null);
              setSearchValue('');
            }}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            + New Lookup
          </button>
        </div>
        <div className="flex justify-center mb-4">
          <SafeImage
            src={`data:image/png;base64,${data.data.photo}`}
            alt="User Photo"
            width={100}
            height={100}
            className="rounded-full border-4 border-gray-100"
            fallbackSrc="/logos/default.png"
          />
        </div>
        <div className="divide-y divide-gray-100">
          <DataRow label="First Name" value={data.data.firstname} />
          <DataRow label="Middle Name" value={data.data.middlename} />
          <DataRow label="Last Name" value={data.data.surname} />
          <DataRow label="ID" value={data.data.nin} />
          <DataRow label="Tracking ID" value={data.data.trackingId} />
          <DataRow label="Address" value={data.data.residence_AdressLine1} />
          <DataRow label="L.G. Origin" value={data.data.birthlga} />
          <DataRow label="Gender" value={formatGender(data.data.gender || '')} />
          {/* --- THIS IS THE FIX --- */}
          <DataRow 
            label="Address" 
            value={`${displayField(data.data.residence_lga)}, ${displayField(data.data.residence_state)}`} 
          />
          {/* ----------------------- */}
          <DataRow label="DOB" value={data.data.birthdate} />
          <DataRow label="Phone Number" value={data.data.telephoneno} />
          <DataRow label="State of Origin" value={data.data.birthstate} />
          <DataRow label="Marital Status" value={data.data.maritalstatus} />
        </div>
      </div>
      <div className="border-t border-gray-100 bg-gray-50 p-6 rounded-b-2xl">
        <h3 className="text-lg font-semibold text-gray-900">Generate Slip</h3>
        <p className="text-sm text-gray-600">Select a slip type to generate and download.</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button 
            onClick={() => handleGenerateSlip('Regular')}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 bg-white p-4 text-left transition-all hover:border-blue-600 hover:bg-blue-50 disabled:opacity-50"
          >
            <span className="font-bold text-gray-800">Regular Slip</span>
            <span className="block text-sm text-gray-600">
              Fee: ₦{displayField(data.slipPrices.regular)}
            </span>
          </button>
          <button 
            onClick={() => handleGenerateSlip('Standard')}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 bg-white p-4 text-left transition-all hover:border-blue-600 hover:bg-blue-50 disabled:opacity-50"
          >
            <span className="font-bold text-gray-800">Standard Slip</span>
            <span className="block text-sm text-gray-600">
              Fee: ₦{displayField(data.slipPrices.standard)}
            </span>
          </button>
          <button 
            onClick={() => handleGenerateSlip('Premium')}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 bg-white p-4 text-left transition-all hover:border-blue-600 hover:bg-blue-50 disabled:opacity-50"
          >
            <span className="font-bold text-gray-800">Premium Slip</span>
            <span className="block text-sm text-gray-600">
              Fee: ₦{displayField(data.slipPrices.premium)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/nin" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">NIN Verification</h1>
      </div>
      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-center text-sm font-medium text-red-700">
          {error}
        </div>
      )}
      {!verificationData ? renderSearchForm() : renderResults(verificationData)}
    </div>
  );
}
