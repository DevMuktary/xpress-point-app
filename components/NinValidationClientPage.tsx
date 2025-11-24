"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  CheckCircleIcon,
  XMarkIcon,
  IdentificationIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import { ValidationRequest } from '@prisma/client';

// --- Types ---
type Props = {
  prices: { [key: string]: number };
  initialRequests: ValidationRequest[];
};
type ServiceID = 'NIN_VALIDATION_47' | 'NIN_VALIDATION_48' | 'NIN_VALIDATION_49' | 'NIN_VALIDATION_50';

// --- "Modern Button" Component ---
const ModTypeButton = ({ title, description, selected, onClick }: {
  title: string,
  description: string,
  selected: boolean,
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-lg p-4 text-left transition-all border-2
      ${selected ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500' : 'border-gray-300 bg-white hover:border-gray-400'}`}
  >
    <p className="font-semibold text-gray-900">{title}</p>
    <p className="text-sm text-blue-600 font-medium">{description}</p>
  </button>
);

// --- Reusable Input Component ---
const DataInput = ({ label, id, value, onChange, Icon, type = "text", isRequired = true }: {
  label: string, id: string, value: string, onChange: (value: string) => void, Icon: React.ElementType, type?: string, isRequired?: boolean
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative mt-1">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        id={id} type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        required={isRequired}
      />
    </div>
  </div>
);

// --- Notification Component ---
const NoticeBox = () => (
  <div className="space-y-3 rounded-xl bg-yellow-50 p-4 border border-yellow-100">
    <div className="flex items-start gap-3">
      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-yellow-800">
        <span className="font-bold block mb-1">Non-Refundable Service</span>
        This service cannot be cancelled or refunded once submitted. Please ensure the NIN is correct.
      </div>
    </div>
    <div className="flex items-start gap-3 pt-2 border-t border-yellow-200/60">
      <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-blue-800">
        <span className="font-bold block mb-1">Processing Time</span>
        Validation may complete within 48 hours, but the status update on the portal might take up to 72 hours or more.
      </div>
    </div>
  </div>
);

// --- Main Component ---
export default function NinValidationClientPage({ prices, initialRequests }: Props) {
  const [serviceId, setServiceId] = useState<ServiceID | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
  // Form Data State
  const [nin, setNin] = useState('');
  
  // History State
  const [requests, setRequests] = useState(initialRequests);

  // Dynamic fee calculation
  const fee = useMemo(() => {
    if (!serviceId) return 0;
    return prices[serviceId] || 0;
  }, [serviceId, prices]);

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsConfirmModalOpen(true);
  };

  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/services/nin/validation-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nin,
          scode: serviceId!.split('_')[2] // Extract "47", "48", etc.
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Submission failed.');
      
      setSuccess(data.message);
      setRequests([data.newRequest, ...requests]); // Add new request to history
      setServiceId(null);
      setNin('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {isLoading && <Loading />}
      
      {success && (
        <div className="rounded-lg bg-green-50 p-4 border border-green-200 animate-in fade-in slide-in-from-top-2">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-green-800">Request Submitted!</h3>
              <p className="mt-2 text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        <form onSubmit={handleOpenConfirmModal} className="space-y-6">
          {/* 1. Select Service Type */}
          <div>
            <label className="text-lg font-bold text-gray-900">1. Select Validation Reason</label>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <ModTypeButton title="No Record" description={`Fee: ₦${prices.NIN_VALIDATION_47 || 0}`} selected={serviceId === 'NIN_VALIDATION_47'} onClick={() => setServiceId('NIN_VALIDATION_47')} />
              <ModTypeButton title="Sim Card Issues" description={`Fee: ₦${prices.NIN_VALIDATION_48 || 0}`} selected={serviceId === 'NIN_VALIDATION_48'} onClick={() => setServiceId('NIN_VALIDATION_48')} />
              <ModTypeButton title="Bank Validation" description={`Fee: ₦${prices.NIN_VALIDATION_49 || 0}`} selected={serviceId === 'NIN_VALIDATION_49'} onClick={() => setServiceId('NIN_VALIDATION_49')} />
              <ModTypeButton title="Photographer Error" description={`Fee: ₦${prices.NIN_VALIDATION_50 || 0}`} selected={serviceId === 'NIN_VALIDATION_50'} onClick={() => setServiceId('NIN_VALIDATION_50')} />
            </div>
          </div>

          {/* 2. Show Form based on selection */}
          {serviceId && (
            <div className="border-t border-gray-200 pt-6 space-y-6 animate-in fade-in slide-in-from-top-4">
              
              {/* --- NOTIFICATION BLOCK --- */}
              <NoticeBox />
              {/* -------------------------- */}

              <h3 className="text-lg font-bold text-gray-900">2. Enter Details</h3>
              <DataInput label="NIN Number*" id="nin" value={nin} onChange={setNin} Icon={IdentificationIcon} />
              
              <div className="pt-4">
                {error && (
                  <p className="mb-4 text-sm font-medium text-red-600 text-center bg-red-50 p-2 rounded-lg">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50 hover:-translate-y-0.5"
                >
                  {isLoading ? 'Submitting...' : `Submit Request (Fee: ₦${fee})`}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 p-4 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Please Confirm</h2>
              <button onClick={() => setIsConfirmModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 flex justify-center">
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-center text-gray-600 text-sm leading-relaxed">
                You are about to submit this validation request. <br/>
                <strong>This action is irreversible and non-refundable.</strong>
              </p>
              <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-center text-sm text-blue-600 font-medium">Total Charge</p>
                <p className="text-center text-2xl font-bold text-blue-700">₦{fee}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-0 border-t border-gray-200">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-200"
              >
                CANCEL
              </button>
              <button
                onClick={handleFinalSubmit}
                className="py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                YES, SUBMIT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
