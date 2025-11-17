"use client"; // This is an interactive component

import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon,
  XMarkIcon,
  IdentificationIcon,
  ArrowPathIcon,
  DocumentMagnifyingGlassIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';
import { DelinkRequest, RequestStatus } from '@prisma/client';

// --- THIS IS THE FIX (Part 1) ---
// Define the props to receive the serviceFee
type Props = {
  serviceFee: number;
};
// ---------------------------------

// --- Reusable Input Component ---
const DataInput = ({ label, id, value, onChange, Icon, type = "text", isRequired = true, placeholder = "" }: {
  label: string, id: string, value: string, onChange: (value: string) => void, Icon: React.ElementType, type?: string, isRequired?: boolean, placeholder?: string
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
        required={isRequired} placeholder={placeholder}
      />
    </div>
  </div>
);

// --- THIS IS THE FIX (Part 2) ---
// The component now accepts the 'serviceFee' prop
export default function DelinkClientPage({ serviceFee }: Props) {
// ---------------------------------

  const [requests, setRequests] = useState<DelinkRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [nin, setNin] = useState('');

  // Fetch history on load
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const res = await fetch('/api/services/nin/delink-history');
      if (!res.ok) throw new Error('Failed to fetch history.');
      const data = await res.json();
      setRequests(data.requests);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // --- THIS IS THE FIX (Part 3) ---
  // The fee is now read from the prop, not hardcoded
  const fee = serviceFee;
  // ---------------------------------

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(null);
    
    if (nin.length !== 11 || !/^[0-9]+$/.test(nin)) {
      setSubmitError("A valid 11-digit NIN is required.");
      return;
    }
    
    setIsConfirmModalOpen(true);
  };
  
  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/services/nin/delink-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nin }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed.');
      }
      
      setSuccess(data.message);
      setRequests([data.newRequest, ...requests]); // Add new request to history
      setNin('');

    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStatusInfo = (status: RequestStatus) => {
    switch (status) {
      case 'COMPLETED':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Completed' };
      case 'PROCESSING':
        return { color: 'bg-blue-100 text-blue-800', icon: ArrowPathIcon, text: 'Processing' };
      case 'PENDING':
        return { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'Pending' };
      case 'FAILED':
        return { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'Failed' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: ClockIcon, text: 'Unknown' };
    }
  };

  return (
    <div className="space-y-6">
      {(isLoading) && <Loading />}
      
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

      {/* --- The "Submit New Request" Form --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <form onSubmit={handleOpenConfirmModal} className="space-y-4">
          
          <DataInput 
            label="NIN Number to Delink*" 
            id="nin" 
            value={nin} 
            onChange={setNin} 
            Icon={IdentificationIcon} 
            placeholder="Enter 11-digit NIN"
          />
          
          <div className="border-t border-gray-200 pt-6">
            {submitError && (
              <p className="mb-4 text-sm font-medium text-red-600 text-center">{submitError}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : `Submit Request (Fee: ₦${fee})`}
            </button>
          </div>
        </form>
      </div>

      {/* --- 2. The "My Requests" History --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg mt-6">
        <h3 className="text-lg font-semibold text-gray-900">My Delink History</h3>
        
        {isHistoryLoading && (
          <div className="py-8 text-center text-gray-500">
            <ArrowPathIcon className="mx-auto h-8 w-8 animate-spin" />
            <p>Loading history...</p>
          </div>
        )}
        
        {!isHistoryLoading && requests.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12" />
            <p className="mt-2 font-semibold">No History Found</p>
            <p className="text-sm">You have not submitted any delink requests.</p>
          </div>
        )}
        
        <div className="mt-6 space-y-4">
          {requests.map((request) => {
            const statusInfo = getStatusInfo(request.status);
            return (
              <div key={request.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      NIN: {request.nin}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span 
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color}`}
                  >
                    <statusInfo.icon className={`h-4 w-4 ${request.status === 'PROCESSING' ? 'animate-spin' : ''}`} />
                    {statusInfo.text}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{request.statusMessage}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Your Confirmation Modal --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Please Confirm
              </h2>
              <button onClick={() => setIsConfirmModalOpen(false)}>
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-center text-gray-600">
                Are you sure you want to submit a delink request for <strong className="text-gray-900">{nin}</strong>?
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
