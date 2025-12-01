"use client";

import React, { useState, useMemo } from 'react';
import { 
  IdentificationIcon, 
  DocumentArrowDownIcon, 
  XMarkIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import SafeImage from '@/components/SafeImage';

type Props = {
  prices: Record<string, number>;
  availability: Record<string, boolean>;
};

type ServiceType = 'PREMIUM' | 'STANDARD';

// --- Modern Selection Button ---
const TypeButton = ({ title, description, price, selected, disabled, onClick }: any) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`relative p-4 rounded-xl text-left border-2 transition-all w-full flex flex-col gap-1
      ${disabled 
        ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' 
        : selected 
          ? 'bg-purple-50 border-purple-600 ring-1 ring-purple-600' 
          : 'bg-white border-gray-200 hover:border-purple-300'
      }`}
  >
    <div className="flex justify-between items-center w-full">
      <h3 className={`font-bold ${selected ? 'text-purple-900' : 'text-gray-900'}`}>{title}</h3>
      {disabled && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">Offline</span>}
    </div>
    <p className="text-xs text-gray-500">{description}</p>
    <p className={`text-lg font-bold mt-2 ${selected ? 'text-purple-700' : 'text-gray-700'}`}>
       ₦{price.toLocaleString()}
    </p>
  </button>
);

// --- Reusable Input ---
const DataInput = ({ label, id, value, onChange, Icon, type = "text", maxLength = 11 }: any) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative mt-1">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        placeholder="Enter 11-digit BVN"
        maxLength={maxLength}
      />
    </div>
  </div>
);

export default function BvnVerificationClientPage({ prices, availability }: Props) {
  
  const [bvn, setBvn] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('PREMIUM'); // Default to Premium
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // --- Dynamic Fee ---
  const currentFee = useMemo(() => {
    if (serviceType === 'PREMIUM') return prices['BVN_VERIFY_PREMIUM'] || 0;
    return prices['BVN_VERIFY_SLIP'] || 0;
  }, [serviceType, prices]);

  // --- Handle Open Confirm ---
  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (bvn.length !== 11) {
      setError("BVN must be exactly 11 digits.");
      return;
    }
    setIsConfirmModalOpen(true);
  };

  // --- Final Submit & Download ---
  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/services/bvn/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bvn, type: serviceType }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate slip.');
      }

      // --- Success: Download PDF ---
      const fileName = `bvn_${serviceType.toLowerCase()}_${bvn}.pdf`;
      downloadPdfFromBase64(data.pdfBase64, fileName);
      
      setSuccessMsg("Slip generated and downloaded successfully!");
      setBvn(''); // Reset input

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Helper: Convert Base64 to Download ---
  const downloadPdfFromBase64 = (base64Data: string, fileName: string) => {
    const linkSource = `data:application/pdf;base64,${base64Data}`;
    const downloadLink = document.createElement("a");
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="space-y-6">
      {isLoading && <Loading />}

      {/* --- Type Selection --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TypeButton 
          title="Premium Slip" 
          description="Detailed verified information." 
          price={prices['BVN_VERIFY_PREMIUM'] || 0}
          selected={serviceType === 'PREMIUM'}
          disabled={!availability['BVN_VERIFY_PREMIUM']}
          onClick={() => setServiceType('PREMIUM')}
        />
        <TypeButton 
          title="Standard Slip" 
          description="Basic verification slip." 
          price={prices['BVN_VERIFY_SLIP'] || 0}
          selected={serviceType === 'STANDARD'}
          disabled={!availability['BVN_VERIFY_SLIP']}
          onClick={() => setServiceType('STANDARD')}
        />
      </div>

      {/* --- Info Box --- */}
      <div className="rounded-lg bg-blue-50 p-4 border border-blue-200 flex gap-3">
        <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
        <div className="text-sm text-blue-800">
           <p className="font-bold">Instant Download</p>
           <p>This service instantly generates a PDF slip. Ensure you have a PDF viewer.</p>
        </div>
      </div>

      {/* --- Success Message --- */}
      {successMsg && (
        <div className="p-4 rounded-lg bg-green-100 text-green-800 border border-green-200 font-medium flex items-center gap-2">
          <CheckCircleIcon className="h-5 w-5"/> {successMsg}
        </div>
      )}

      {/* --- Form --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        <form onSubmit={handleOpenConfirm} className="space-y-6">
          <DataInput 
            label="BVN Number*" 
            id="bvn" 
            value={bvn} 
            onChange={setBvn} 
            Icon={IdentificationIcon} 
            type="tel" 
            maxLength={11} 
          />

          <div className="border-t border-gray-200 pt-6">
            {error && (
              <p className="mb-4 text-sm font-medium text-red-600 text-center bg-red-50 p-2 rounded-lg">{error}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-purple-700 disabled:opacity-50 hover:-translate-y-0.5"
            >
              <DocumentArrowDownIcon className="h-5 w-5" />
              {isLoading ? 'Generating...' : `Generate ${serviceType === 'PREMIUM' ? 'Premium' : 'Standard'} Slip`}
            </button>
          </div>
        </form>
      </div>

      {/* --- Confirmation Modal --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">Confirm Verification</h2>
              <button onClick={() => setIsConfirmModalOpen(false)}>
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm">
                You are about to generate a <strong>{serviceType}</strong> Slip for BVN: <br/>
                <strong className="text-gray-900 text-lg font-mono">{bvn}</strong>
              </p>
              <p className="mt-4 text-2xl font-bold text-purple-600">
                Fee: ₦{currentFee.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-2xl">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 rounded-lg bg-white py-2.5 px-4 text-sm font-semibold text-gray-700 border border-gray-300 transition-colors hover:bg-gray-100"
              >
                CANCEL
              </button>
              <button
                onClick={handleFinalSubmit}
                className="flex-1 rounded-lg bg-purple-600 py-2.5 px-4 text-sm font-bold text-white transition-colors hover:bg-purple-700"
              >
                YES, GENERATE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
