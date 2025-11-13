"use client"; // This is an interactive component

import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  ArrowPathIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  DocumentMagnifyingGlassIcon,
  ChevronLeftIcon,
  XMarkIcon,
  ClipboardIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import { ExamPinRequest, RequestStatus, Service } from '@prisma/client';

// --- "Sleek Copy Button" Component ---
const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all
        ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
    >
      {copied ? <ClipboardDocumentCheckIcon className="h-4 w-4" /> : <ClipboardIcon className="h-4 w-4" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

// --- "World-Class" Pin Display Component ---
const PinCard = ({ pinData }: { pinData: any }) => (
  <div className="p-3 rounded-lg border bg-white space-y-2">
    <div>
      <span className="text-xs font-medium text-gray-500">PIN:</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-900">{pinData.pin}</span>
        <CopyButton textToCopy={pinData.pin} />
      </div>
    </div>
    <div>
      <span className="text-xs font-medium text-gray-500">Serial:</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-900">{pinData.serial}</span>
        <CopyButton textToCopy={pinData.serial} />
      </div>
    </div>
  </div>
);

// --- The Main "World-Class" Component ---
export default function WaecPinPage() {
  
  // --- This is the "World-Class" Service ID ---
  const SERVICE_ID = "WAEC_PIN";
  const SERVICE_FEE = 3600; // The Agent price

  // --- State Management ---
  const [requests, setRequests] = useState<ExamPinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false); // For main submit
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any | null>(null); // Your "Sweet Alert"
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // --- Form Data State ---
  const [phoneNumber, setPhoneNumber] = useState('');
  const [quantity, setQuantity] = useState(1);

  // --- "World-Class" API Fetch on Load ---
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const res = await fetch(`/api/services/exam-pins/history?serviceId=${SERVICE_ID}`);
      if (!res.ok) throw new Error('Failed to fetch history.');
      const data = await res.json();
      setRequests(data.requests);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsHistoryLoading(false);
    }
  };
  
  // --- Handle Open Confirmation Modal ---
  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(null);
    setIsConfirmModalOpen(true);
  };
  
  // --- This is the *final* submit, called by the modal's "YES" button ---
  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/services/exam-pins/vend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serviceId: SERVICE_ID, 
          phoneNumber,
          quantity
        }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed.');
      }
      
      setSuccess(data); // Your "Sweet Alert"
      setPhoneNumber('');
      setQuantity(1);
      fetchHistory(); // Refresh the history list

    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const totalFee = useMemo(() => SERVICE_FEE * quantity, [quantity]);
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      {(isLoading) && <Loading />}
      
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/exam-pins" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <SafeImage
          src="/logos/waec.png"
          alt="WAEC Logo"
          width={40}
          height={40}
          fallbackSrc="/logos/default.png"
          className="rounded-full"
        />
        <h1 className="text-2xl font-bold text-gray-900">
          WAEC Result Pin
        </h1>
      </div>
      
      {/* --- Your "Sweet Alert" Style Message --- */}
      {success && (
        <div className="rounded-lg bg-green-50 p-4 border border-green-200 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-green-800">
                Purchase Successful!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{success.message}</p>
                {/* "World-class" display of the new pins */}
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto p-2 bg-white rounded-lg">
                  {success.pins.map((pin: any, index: number) => (
                    <PinCard key={index} pinData={pin} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- The "Submit New Request" Form --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <form onSubmit={handleOpenConfirmModal} className="space-y-6">
          
          <DataInput 
            label="Phone Number*" 
            id="phone" 
            value={phoneNumber} 
            onChange={setPhoneNumber} 
            Icon={PhoneIcon} 
            type="tel" 
            maxLength={11}
            placeholder="Phone number to receive the PIN"
          />
          
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity*</label>
            <input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full rounded-lg border border-gray-300 p-3 shadow-sm"
              required
              min="1"
            />
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            {submitError && (
              <p className="mb-4 text-sm font-medium text-red-600 text-center">{submitError}</p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Purchasing...' : `Purchase PIN (Fee: ₦${totalFee})`}
            </button>
          </div>
        </form>
      </div>

      {/* --- 3. The "My Requests" History --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg mt-6">
        <h3 className="text-lg font-semibold text-gray-900">My WAEC PIN History</h3>
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
            <p className="text-sm">You have not purchased any WAEC pins yet.</p>
          </div>
        )}
        
        <div className="mt-6 space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold text-gray-900">
                  {request.phoneNumber} ({request.quantity} PINs)
                </p>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Completed
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                {new Date(request.createdAt).toLocaleString()}
              </p>
              <div className="space-y-2">
                {(request.pins as any[]).map((pin: any, index: number) => (
                  <PinCard key={index} pinData={pin} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Your "World-Class" Confirmation Modal --- */}
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
                Are you sure you want to purchase {quantity} WAEC PIN(s) for {phoneNumber}? This action is irreversible.
              </p>
              <p className="mt-4 text-center text-2xl font-bold text-blue-600">
                Total Fee: ₦{totalFee}
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
                YES, PURCHASE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
