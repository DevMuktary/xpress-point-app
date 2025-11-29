"use client"; 

import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon,
  XMarkIcon,
  IdentificationIcon,
  ArrowPathIcon,
  DocumentMagnifyingGlassIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';
import { DelinkRequest, RequestStatus } from '@prisma/client';
// Import the Unavailable Component
import ServiceUnavailable from '@/components/ServiceUnavailable';

// --- Props ---
type Props = {
  serviceFee: number;
  isActive: boolean; // <--- ADDED THIS
};

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
        className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        required={isRequired} placeholder={placeholder}
      />
    </div>
  </div>
);

// --- Notification Component ---
const NoticeBox = () => (
  <div className="mb-6 space-y-3 rounded-xl bg-yellow-50 p-4 border border-yellow-100 animate-in fade-in slide-in-from-top-2">
    <div className="flex items-start gap-3">
      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-yellow-800">
        <span className="font-bold block mb-1">Non-Refundable Service</span>
        This service is not refundable and cannot be cancelled once sent. Please ensure the NIN has a Self Service Account on it.
      </div>
    </div>
    <div className="flex items-start gap-3 pt-2 border-t border-yellow-200/60">
      <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-blue-800">
        <span className="font-bold block mb-1">Processing Time</span>
        This service will be completed within 48 to 72 Hours.
      </div>
    </div>
  </div>
);

// --- Main Component ---
export default function DelinkClientPage({ serviceFee, isActive }: Props) {

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

  const fee = serviceFee;

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

  // --- CHECK UNAVAILABILITY ---
  if (!isActive) {
    return (
      <ServiceUnavailable 
        message="The NIN Delink / Retrieve Email service is currently unavailable. Please check back later." 
      />
    );
  }

  return (
    <div className="space-y-6">
      {(isLoading) && <Loading />}
      
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

      {/* --- The "Submit New Request" Form --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        
        {/* --- NOTIFICATION BLOCK --- */}
        <NoticeBox />
        {/* -------------------------- */}

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
              <p className="mb-4 text-sm font-medium text-red-600 text-center bg-red-50 p-2 rounded-lg">{submitError}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50 hover:-translate-y-0.5"
            >
              {isLoading ? 'Submitting...' : `Submit Request (Fee: ₦${fee})`}
            </button>
          </div>
        </form>
      </div>

      {/* --- 2. The "My Requests" History --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg mt-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">My Delink History</h3>
        
        {isHistoryLoading && (
          <div className="py-12 text-center text-gray-500">
            <ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-2 text-sm">Loading history...</p>
          </div>
        )}
        
        {!isHistoryLoading && requests.length === 0 && (
          <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 font-semibold text-gray-900">No History Found</p>
            <p className="text-sm">You have not submitted any delink requests.</p>
          </div>
        )}
        
        <div className="mt-4 space-y-4">
          {requests.map((request) => {
            const statusInfo = getStatusInfo(request.status);
            return (
              <div key={request.id} className="rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition-colors bg-gray-50/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <span className="text-gray-500 font-normal">NIN:</span> {request.nin}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span 
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${statusInfo.color}`}
                  >
                    <statusInfo.icon className={`h-3.5 w-3.5 ${request.status === 'PROCESSING' ? 'animate-spin' : ''}`} />
                    {statusInfo.text}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-100 text-sm text-gray-700 shadow-sm">
                  {request.statusMessage}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Your Confirmation Modal --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 p-4 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">
                Please Confirm
              </h2>
              <button onClick={() => setIsConfirmModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 flex justify-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <IdentificationIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-center text-gray-600 text-sm leading-relaxed">
                Are you sure you want to submit a delink request for <br/>
                <strong className="text-gray-900 text-lg block mt-1">{nin}</strong>
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
