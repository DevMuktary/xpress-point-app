"use client";

import React, { useState } from 'react';
import { 
  IdentificationIcon, 
  DocumentArrowDownIcon, 
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import ServiceUnavailable from '@/components/ServiceUnavailable';

type Props = {
  fee: number;
  isActive: boolean;
};

// --- Reusable Input ---
const DataInput = ({ label, id, value, onChange, Icon, type = "text", isRequired = true, placeholder = "", maxLength = 524288 }: any) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative mt-1">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        required={isRequired} placeholder={placeholder} maxLength={maxLength}
      />
    </div>
  </div>
);

export default function VninSlipClientPage({ fee, isActive }: Props) {
  const [nin, setNin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // --- 1. Trigger Confirmation ---
  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (nin.length !== 11) {
      setError("NIN must be exactly 11 digits.");
      return;
    }
    setIsConfirmModalOpen(true);
  };

  // --- 2. Final Submit & Download ---
  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/services/nin/vnin-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nin }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate slip.');
      }

      // --- Success: Download PDF ---
      downloadPdfFromBase64(data.pdfBase64, `vnin_slip_${nin}.pdf`);
      
      setSuccessMsg("Slip generated and downloaded successfully!");
      setNin(''); // Reset input

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
    document.body.appendChild(downloadLink); // Required for Firefox
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  if (!isActive) {
    return <ServiceUnavailable message="VNIN Slip service is currently undergoing maintenance." />;
  }

  return (
    <div className="space-y-6">
      {isLoading && <Loading />}

      {/* --- Info Box --- */}
      <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3 text-sm text-blue-800">
            <p className="font-bold">Instant Download</p>
            <p>This service instantly generates the VNIN Slip PDF. Ensure you have a PDF viewer installed.</p>
          </div>
        </div>
      </div>

      {/* --- Success Message --- */}
      {successMsg && (
        <div className="p-4 rounded-lg bg-green-100 text-green-800 border border-green-200 font-medium">
          {successMsg}
        </div>
      )}

      {/* --- Form --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        <form onSubmit={handleOpenConfirm} className="space-y-6">
          <DataInput 
            label="NIN Number*" 
            id="nin" 
            value={nin} 
            onChange={setNin} 
            Icon={IdentificationIcon} 
            type="tel" 
            maxLength={11} 
            placeholder="Enter 11-digit NIN"
          />

          <div className="border-t border-gray-200 pt-6">
            {error && (
              <p className="mb-4 text-sm font-medium text-red-600 text-center bg-red-50 p-2 rounded-lg">{error}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-blue-700 disabled:opacity-50 hover:-translate-y-0.5"
            >
              <DocumentArrowDownIcon className="h-5 w-5" />
              {isLoading ? 'Generating...' : `Generate Slip (Fee: ₦${fee.toLocaleString()})`}
            </button>
          </div>
        </form>
      </div>

      {/* --- Confirmation Modal --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">Confirm Purchase</h2>
              <button onClick={() => setIsConfirmModalOpen(false)}>
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm">
                You are about to generate a VNIN Slip for NIN: <br/>
                <strong className="text-gray-900 text-lg">{nin}</strong>
              </p>
              <p className="mt-4 text-2xl font-bold text-blue-600">
                Fee: ₦{fee.toLocaleString()}
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
                className="flex-1 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700"
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
