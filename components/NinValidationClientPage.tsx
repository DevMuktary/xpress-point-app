"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  CheckCircleIcon,
  XMarkIcon,
  IdentificationIcon,
  ArrowPathIcon
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
        className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm"
        required={isRequired}
      />
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
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {isLoading && <Loading />}
      
      {success && (
        <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-blue-800">Request Submitted!</h3>
              <p className="mt-2 text-sm text-blue-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <form onSubmit={handleOpenConfirmModal} className="space-y-6">
          {/* 1. Select Service Type */}
          <div>
            <label className="text-lg font-semibold text-gray-900">1. Select Validation Reason</label>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              <ModTypeButton title="No Record" description={`Fee: ₦${prices.NIN_VALIDATION_47 || 0}`} selected={serviceId === 'NIN_VALIDATION_47'} onClick={() => setServiceId('NIN_VALIDATION_47')} />
              <ModTypeButton title="Sim Card Issues" description={`Fee: ₦${prices.NIN_VALIDATION_48 || 0}`} selected={serviceId === 'NIN_VALIDATION_48'} onClick={() => setServiceId('NIN_VALIDATION_48')} />
              <ModTypeButton title="Bank Validation" description={`Fee: ₦${prices.NIN_VALIDATION_49 || 0}`} selected={serviceId === 'NIN_VALIDATION_49'} onClick={() => setServiceId('NIN_VALIDATION_49')} />
              <ModTypeButton title="Photographer Error" description={`Fee: ₦${prices.NIN_VALIDATION_50 || 0}`} selected={serviceId === 'NIN_VALIDATION_50'} onClick={() => setServiceId('NIN_VALIDATION_50')} />
            </div>
          </div>

          {/* 2. Show Form based on selection */}
          {serviceId && (
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">2. Enter Details</h3>
              <DataInput label="NIN Number*" id="nin" value={nin} onChange={setNin} Icon={IdentificationIcon} />
            </div>
          )}

          {/* 3. Submit Button */}
          {serviceId && (
            <div className="border-t border-gray-200 pt-6">
              {error && (
                <p className="mb-4 text-sm font-medium text-red-600 text-center">{error}</p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : `Submit Request (Fee: ₦${fee})`}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">Please Confirm</h2>
              <button onClick={() => setIsConfirmModalOpen(false)}>
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-center text-gray-600">
                You are about to submit this validation request. This action is irreversible.
              </p>
              <p className="mt-4 text-center text-2xl font-bold text-blue-600">
                Total Fee: ₦{fee}
              </p>
            </div>
            <div className="flex gap-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-2xl">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 rounded-lg bg-white py-2.5 px-4 text-sm font-semibold text-gray-800 border border-gray-300 transition-colors hover:bg-gray-100"
              >
                CANCEL
              </button>
              <button
                onClick={handleFinalSubmit}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
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
