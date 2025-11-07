"use client"; // This is a highly interactive page

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, IdentificationIcon, PhoneIcon } from '@heroicons/react/24/outline';
import Loading from '@/app/loading'; // Our global loader
import SafeImage from '@/components/SafeImage'; // Our image component

// Define the shape of the data we expect from the API
type NinData = {
  photo: string;
  firstname: string;
  surname: string;
  middlename: string;
  birthdate: string;
  nin: string;
  residence_AdressLine1?: string;
};

type VerificationResponse = {
  verificationId: string;
  data: NinData;
};

export default function NinVerificationPage() {
  const [searchType, setSearchType] = useState<'NIN' | 'PHONE'>('NIN');
  const [searchValue, setSearchValue] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This is where we will store the successful lookup data
  const [verificationData, setVerificationData] = useState<VerificationResponse | null>(null);

  const lookupFee = process.env.NEXT_PUBLIC_NIN_LOOKUP_FEE || '150';

  // --- Stage 1: Handle the lookup ---
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

      setVerificationData(data); // Success! Show the results
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Stage 2: Handle Slip Generation (We will build this API next) ---
  const handleGenerateSlip = async (slipType: string) => {
    alert(`This will generate the ${slipType} slip. API not yet built.`);
    // TODO:
    // setIsLoading(true);
    // setError(null);
    // call '/api/services/nin/generate-slip'
    // ...
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {isLoading && <Loading />}

      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/nin" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">NIN Verification</h1>
      </div>

      {/* --- Error Message Display --- */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-center text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* --- STAGE 1: The Search Form --- */}
      {/* We only show this if we DON'T have results yet */}
      {!verificationData && (
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          {/* Tabs for NIN/Phone */}
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

          {/* Search Form */}
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
      )}

      {/* --- STAGE 2: The Results & Slip Buttons --- */}
      {/* We only show this AFTER a successful lookup */}
      {verificationData && (
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900">Verification Successful</h2>
          
          {/* Profile Data */}
          <div className="mt-6 flex flex-col items-center sm:flex-row sm:items-start sm:gap-6">
            <SafeImage
              src={`data:image/png;base64,${verificationData.data.photo}`}
              alt="User Photo"
              width={120}
              height={120}
              className="rounded-lg border"
              fallbackSrc="/logos/default.png"
            />
            <div className="mt-4 w-full flex-1 text-center sm:mt-0 sm:text-left">
              <h3 className="text-2xl font-bold text-gray-900">
                {verificationData.data.surname} {verificationData.data.firstname}
              </h3>
              <p className="text-lg text-gray-600">{verificationData.data.middlename}</p>
              
              <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4 text-sm">
                <div>
                  <span className="block font-medium text-gray-500">NIN</span>
                  <span className="font-semibold text-gray-800">{verificationData.data.nin}</span>
                </div>
                <div>
                  <span className="block font-medium text-gray-500">Birthdate</span>
                  <span className="font-semibold text-gray-800">{verificationData.data.birthdate}</span>
                </div>
                <div className="col-span-2">
                  <span className="block font-medium text-gray-500">Address</span>
                  <span className="font-semibold text-gray-800">
                    {verificationData.data.residence_AdressLine1 || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Slip Generation Buttons */}
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900">Generate Slip</h3>
            <p className="text-sm text-gray-600">Select a slip type to generate and download.</p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <button 
                onClick={() => handleGenerateSlip('Regular')}
                className="rounded-lg border border-gray-300 p-4 text-left transition-all hover:border-blue-600 hover:bg-blue-50"
              >
                <span className="font-bold text-gray-800">Regular Slip</span>
                <span className="block text-sm text-gray-600">Fee: ₦100</span>
              </button>
              <button 
                onClick={() => handleGenerateSlip('Standard')}
                className="rounded-lg border border-gray-300 p-4 text-left transition-all hover:border-blue-600 hover:bg-blue-50"
              >
                <span className="font-bold text-gray-800">Standard Slip</span>
                <span className="block text-sm text-gray-600">Fee: ₦150</span>
              </button>
              <button 
                onClick={() => handleGenerateSlip('Premium')}
                className="rounded-lg border border-gray-300 p-4 text-left transition-all hover:border-blue-600 hover:bg-blue-50"
              >
                <span className="font-bold text-gray-800">Premium Slip</span>
                <span className="block text-sm text-gray-600">Fee: ₦200</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
