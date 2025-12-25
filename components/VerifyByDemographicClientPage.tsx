"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserIcon, InformationCircleIcon, ChevronLeftIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import SafeImage from '@/components/SafeImage';
import ServiceUnavailable from '@/components/ServiceUnavailable';

// --- Types (Reused from other NIN components) ---
type NinData = {
  photo: string;
  firstname?: string;
  surname?: string;
  middlename?: string;
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
  [key: string]: any;
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

// --- Helper Functions ---
function displayField(value: any): string {
  if (value === null || value === undefined || value === "" || value === "****") return ''; 
  return value.toString();
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

// --- Main Component ---
export default function VerifyByDemographicClientPage({ serviceFee, isActive }: { serviceFee: number, isActive: boolean }) {
  // Form States
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [middlename, setMiddlename] = useState('');
  const [gender, setGender] = useState('male');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verificationData, setVerificationData] = useState<VerificationResponse | null>(null);
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, slipType: null, price: 0, exampleImage: '' });

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setVerificationData(null);

    try {
      const response = await fetch('/api/services/nin/lookup-demographic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstname,
          lastname,
          middlename,
          gender,
          dateOfBirth
        }),
      });

      const data = await response.json();
      
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
    
    setModalState({ isOpen: false, slipType: null, price: 0, exampleImage: '' });
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/services/nin/generate-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: verificationData.verificationId,
          slipType: modalState.slipType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Slip generation failed.');
      }

      const buffer = await response.arrayBuffer();
      const blob = new Blob([buffer], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nin_slip_${modalState.slipType?.toLowerCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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
  };

  if (!isActive) {
    return <div className="w-full max-w-3xl mx-auto"><ServiceUnavailable message="Service currently unavailable." /></div>;
  }

  const renderSearchForm = () => (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <UserIcon className="h-5 w-5 text-gray-500" /> Enter Demographic Details
      </h3>
      
      <form onSubmit={handleLookup} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                <input
                    type="text"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    placeholder="e.g. JOHN"
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    required
                />
            </div>

            {/* Last Name */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Last Name (Surname)</label>
                <input
                    type="text"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    placeholder="e.g. DOE"
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    required
                />
            </div>

            {/* Middle Name */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Middle Name (Optional)</label>
                <input
                    type="text"
                    value={middlename}
                    onChange={(e) => setMiddlename(e.target.value)}
                    placeholder="e.g. PAUL"
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                />
            </div>

            {/* Gender */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
                >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
            </div>
            
            {/* DOB */}
            <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    required
                />
            </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? <Loading /> : <><MagnifyingGlassIcon className="h-5 w-5" /> Search (₦{serviceFee})</>}
        </button>
      </form>
    </div>
  );
   
  const renderResults = (data: VerificationResponse) => (
    <div className="rounded-2xl bg-white shadow-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Search Results</h2>
          <button onClick={resetSearch} className="text-sm font-medium text-blue-600 hover:text-blue-500">
            + New Search
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
          <DataRow label="Names" value={`${data.data.firstname} ${data.data.middlename || ''} ${data.data.surname}`} />
          <DataRow label="NIN" value={data.data.nin} />
          <DataRow label="Phone No" value={data.data.telephoneno} />
          <DataRow label="Date of Birth" value={data.data.birthdate} />
          <DataRow label="Gender" value={formatGender(data.data.gender || '')} />
          <DataRow label="Address" value={data.data.residence_AdressLine1} />
          <DataRow label="LGA / State" value={`${displayField(data.data.residence_lga)}, ${displayField(data.data.residence_state)}`} />
          <DataRow label="Tracking ID" value={data.data.trackingId} />
        </div>
      </div>
      
      {/* Slip Generation (Reused UI) */}
      <div className="border-t border-gray-100 bg-gray-50 p-6 rounded-b-2xl">
        <h3 className="text-lg font-semibold text-gray-900">Generate Slip</h3>
        <p className="text-sm text-gray-500 mb-4">Select a slip format to print.</p>
        <div className="grid grid-cols-1 gap-4">
          {['Regular', 'Standard', 'Premium'].map((type) => (
             <button 
                key={type}
                onClick={() => handleSlipClick(type as any)}
                disabled={isLoading}
                className="group flex items-center justify-between rounded-lg border border-gray-300 bg-white p-4 text-left hover:border-blue-600 hover:bg-blue-50 transition-all"
             >
                <div>
                  <span className="font-bold text-gray-800">{type} Slip</span>
                </div>
                <span className="text-lg font-bold text-blue-600">₦{data.slipPrices[type as keyof typeof data.slipPrices]}</span>
             </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/services/nin" className="text-gray-500 hover:text-gray-900">
            <ChevronLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Verify by Demographic</h1>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-100 p-4 text-center text-sm font-medium text-red-700">{error}</div>}
      {success && <div className="mb-4 rounded-lg bg-green-100 p-4 text-center text-sm font-medium text-green-700">{success}</div>}

      {!verificationData ? renderSearchForm() : renderResults(verificationData)}
      
      {/* Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">Confirm Purchase</h2>
              <button onClick={() => setModalState({ isOpen: false, slipType: null, price: 0, exampleImage: '' })}><XMarkIcon className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-600">Generating <strong>{modalState.slipType} Slip</strong></p>
              <div className="my-4 w-full h-48 relative border border-gray-200 rounded-lg overflow-hidden">
                <Image src={modalState.exampleImage} alt="Slip Example" layout="fill" objectFit="contain" />
              </div>
              <p className="text-2xl font-bold text-blue-600">₦{modalState.price}</p>
            </div>
            <div className="flex gap-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-2xl">
              <button onClick={() => setModalState({ isOpen: false, slipType: null, price: 0, exampleImage: '' })} className="flex-1 rounded-lg bg-white border border-gray-300 py-2.5 text-sm font-semibold">Cancel</button>
              <button onClick={confirmGenerateSlip} className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
