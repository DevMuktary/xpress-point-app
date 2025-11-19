"use client";

import React, { useState } from 'react';
import { 
  CheckCircleIcon,
  IdentificationIcon,
  ArrowPathIcon,
  DocumentMagnifyingGlassIcon,
  ClockIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon // <-- THIS IS THE FIX: Added missing import
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import { PersonalizationRequest, RequestStatus } from '@prisma/client';
import CopyButton from '@/components/CopyButton'; 

type Props = {
  initialRequests: PersonalizationRequest[];
  serviceFee: number;
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
        className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm"
        required={isRequired} placeholder={placeholder}
      />
    </div>
  </div>
);

export default function PersonalizationClientPage({ initialRequests, serviceFee }: Props) {
  const [requests, setRequests] = useState(initialRequests);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<any | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [trackingId, setTrackingId] = useState('');

  const fee = serviceFee;

  // --- Function to Refresh History ---
  const refreshHistory = async () => {
    setIsRefreshing(true);
    try {
      // We reload the page to get the latest server data (simplest way to sync)
      window.location.reload();
    } catch (error) {
      console.error("Failed to refresh");
      setIsRefreshing(false);
    }
  };

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setReceipt(null);
    
    if (!trackingId) {
      setSubmitError("A valid Tracking ID is required.");
      return;
    }
    
    setIsConfirmModalOpen(true);
  };
  
  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/services/nin/personalization-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingId }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed.');
      }
      
      setReceipt({
        message: data.message,
        serviceName: "NIN Personalization",
        status: "PROCESSING"
      });
      
      // Add the new request to the top of the list locally
      setRequests([data.newRequest, ...requests]); 
      setTrackingId('');

    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const closeReceiptModal = () => {
    setReceipt(null);
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
      
      {/* --- New Instructions / Note --- */}
      <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3 text-sm text-blue-800">
            <p className="font-bold mb-1">IMPORTANT NOTE:</p>
            <p>
              This service will be processed within <strong>30 minutes to 1 hour</strong>. 
              There might be a slight delay on weekends.
            </p>
            <p className="mt-1">
              You can keep clicking the <strong>"Check Status"</strong> button below to update the status of your personalization.
            </p>
          </div>
        </div>
      </div>

      {/* --- Submit Form --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <form onSubmit={handleOpenConfirmModal} className="space-y-4">
          <DataInput 
            label="Tracking ID*" 
            id="trackingId" 
            value={trackingId} 
            onChange={setTrackingId} 
            Icon={IdentificationIcon} 
            placeholder="Enter the Tracking ID"
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

      {/* --- History Section --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">My Personalization History</h3>
          <button 
            onClick={refreshHistory}
            disabled={isRefreshing}
            className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Check Status
          </button>
        </div>
        
        {requests.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12" />
            <p className="mt-2 font-semibold">No History Found</p>
            <p className="text-sm">You have not submitted any personalization requests.</p>
          </div>
        )}
        
        <div className="mt-6 space-y-4">
          {requests.map((request) => {
            const statusInfo = getStatusInfo(request.status);
            // Check if result data exists in the JSON
            const requestData = request.data as any;
            const resultNin = requestData?.nin || requestData?.newNin; // Adjust key based on what admin saves

            return (
              <div key={request.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Tracking ID: {request.trackingId}
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
                
                {/* --- Display Result if Completed --- */}
                {request.status === 'COMPLETED' && resultNin && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">New NIN:</p>
                    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-md">
                      <span className="font-mono text-lg font-bold text-gray-900 tracking-wider">
                        {resultNin}
                      </span>
                      <CopyButton textToCopy={resultNin} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Confirmation Modal --- */}
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
                Are you sure you want to submit this request for <strong className="text-gray-900">{trackingId}</strong>?
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

      {/* --- Success Modal (Receipt) --- */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div className="p-6">
              <div className="flex flex-col items-center justify-center">
                <CheckCircleIcon className="h-16 w-16 text-green-500" />
                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  Request Submitted
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {receipt.message}
                </p>
                
                <div className="w-full mt-6 space-y-2 rounded-lg border bg-gray-50 p-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Service:</span>
                    <span className="text-sm font-semibold text-gray-900">{receipt.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <span className="text-sm font-semibold text-blue-600">{receipt.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Amount:</span>
                    <span className="text-sm font-semibold text-gray-900">₦{fee}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-2xl">
              <button
                onClick={closeReceiptModal}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
