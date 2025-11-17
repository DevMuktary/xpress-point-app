"use client"; // This is an interactive component

import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon,
  PhoneIcon,
  ArrowPathIcon,
  ClockIcon,
  DocumentMagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import { VtuRequest } from '@prisma/client';

// --- Type Definitions ---
type Props = {
  prices: { [key: string]: number }; // Expect a price map
};

// --- "Modern Button" Component ---
const NetworkButton = ({ logo, title, selected, onClick }: {
  logo: string,
  title: string,
  selected: boolean,
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-lg p-4 text-left transition-all border-2 flex flex-col items-center justify-center
      ${selected
        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500'
        : 'border-gray-300 bg-white hover:border-gray-400'
      }`}
  >
    <SafeImage src={logo} alt={title} width={40} height={40} className="rounded-full" fallbackSrc="/logos/default.png" />
    <span className="mt-2 text-sm font-semibold text-gray-900">{title}</span>
  </button>
);

// --- Reusable Input Component ---
const DataInput = ({ label, id, value, onChange, Icon, type = "text", isRequired = true, placeholder = "", maxLength = 524288 }: {
  label: string,
  id: string,
  value: string,
  onChange: (value: string) => void,
  Icon: React.ElementType,
  type?: string,
  isRequired?: boolean,
  placeholder?: string,
  maxLength?: number
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative mt-1">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm"
        required={isRequired}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    </div>
  </div>
);

// --- Service ID Map ---
const serviceIdMap: { [key: string]: string } = {
  MTN: 'AIRTIME_MTN',
  GLO: 'AIRTIME_GLO',
  AIRTEL: 'AIRTIME_AIRTEL',
  '9MOBILE': 'AIRTIME_9MOBILE',
};

// --- The Main Component ---
export default function AirtimeClientPage({ prices }: Props) {
  
  type Network = 'MTN' | 'GLO' | 'AIRTEL' | '9MOBILE';
  const [network, setNetwork] = useState<Network | null>(null);
  
  // --- State Management ---
  const [requests, setRequests] = useState<VtuRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<any | null>(null); // For success modal

  // --- THIS IS THE FIX ---
  // The missing state definition
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  // -----------------------
  
  // --- Form Data State ---
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');

  // --- API Fetch on Load ---
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const res = await fetch(`/api/services/vtu/history?category=VTU_AIRTIME`);
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
    setReceipt(null);

    if (!network) {
      setSubmitError("Please select a network.");
      return;
    }
    if (phoneNumber.length !== 11 || !/^[0-9]+$/.test(phoneNumber)) {
      setSubmitError("Phone number must be exactly 11 digits.");
      return;
    }
    if (Number(amount) < 50) {
      setSubmitError("Amount must be at least ₦50.");
      return;
    }
    
    setIsConfirmModalOpen(true);
  };
  
  // --- This is the *final* submit ---
  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/services/vtu/vend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serviceId: serviceIdMap[network!], 
          phoneNumber,
          amount: Number(amount)
        }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed.');
      }
      
      setReceipt({
        message: data.message,
        transactionId: data.data.recharge_id,
        phone: phoneNumber,
        amount: data.data.amount_charged,
        network: network,
        status: data.data.text_status
      });
      
      setPhoneNumber('');
      setAmount('');
      fetchHistory(); // Refresh the history list

    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const closeReceiptModal = () => {
    setReceipt(null);
  };
  
  return (
    <div className="space-y-6">
      {(isLoading) && <Loading />}

      {/* --- The "Submit New Request" Form --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <form onSubmit={handleOpenConfirmModal} className="space-y-6">
          
          <div>
            <label className="text-lg font-semibold text-gray-900">
              1. Select Network
            </label>
            <div className="mt-2 grid grid-cols-4 gap-3">
              <NetworkButton
                title="MTN" logo="/logos/mtn.png"
                selected={network === 'MTN'}
                onClick={() => setNetwork('MTN')}
              />
              <NetworkButton
                title="Glo" logo="/logos/glo.png"
                selected={network === 'GLO'}
                onClick={() => setNetwork('GLO')}
              />
              <NetworkButton
                title="Airtel" logo="/logos/airtel.png"
                selected={network === 'AIRTEL'}
                onClick={() => setNetwork('AIRTEL')}
              />
              <NetworkButton
                title="9mobile" logo="/logos/9mobile.png"
                selected={network === '9MOBILE'}
                onClick={() => setNetwork('9MOBILE')}
              />
            </div>
          </div>

          {/* --- Form Fields --- */}
          {network && (
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">2. Enter Details</h3>
              
              <DataInput 
                label="Phone Number*" 
                id="phone" 
                value={phoneNumber} 
                onChange={setPhoneNumber} 
                Icon={PhoneIcon} 
                type="tel" 
                maxLength={11}
                placeholder="080..."
              />
              <DataInput 
                label="Amount (₦50 - ₦10,000)*" 
                id="amount" 
                value={amount} 
                onChange={setAmount} 
                Icon={PhoneIcon}
                type="number" 
                placeholder="e.g., 100"
              />
            </div>
          )}
          
          {/* --- Submit Button --- */}
          {network && (
            <div className="border-t border-gray-200 pt-6">
              {submitError && (
                <p className="mb-4 text-sm font-medium text-red-600 text-center">{submitError}</p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Purchasing...' : `Purchase Airtime`}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* --- 3. The "My Requests" History --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg mt-6">
        <h3 className="text-lg font-semibold text-gray-900">My Airtime History</h3>
        
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
            <p className="text-sm">You have not purchased any airtime yet.</p>
          </div>
        )}
        
        <div className="mt-6 space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    ₦{request.amount.toString()} to {request.phoneNumber}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  request.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {request.status}
                </span>
              </div>
            </div>
          ))}
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
                Are you sure you want to send <strong className="text-gray-900">₦{amount}</strong> of {network} airtime to <strong className="text-gray-900">{phoneNumber}</strong>?
              </p>
              <p className="mt-4 text-center text-2xl font-bold text-blue-600">
                Total Fee: ₦{Number(amount)}
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
      
      {/* --- Success Modal (Receipt) --- */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div className="p-6">
              <div className="flex flex-col items-center justify-center">
                <CheckCircleIcon className="h-16 w-16 text-green-500" />
                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  Purchase Successful
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {receipt.message}
                </p>
                
                <div className="w-full mt-6 space-y-2 rounded-lg border bg-gray-50 p-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Amount:</span>
                    <span className="text-sm font-semibold text-gray-900">₦{receipt.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Network:</span>
                    <span className="text-sm font-semibold text-gray-900">{receipt.network}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Phone:</span>
                    <span className="text-sm font-semibold text-gray-900">{receipt.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <span className="text-sm font-semibold text-green-600">{receipt.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Trans. ID:</span>
                    <span className="text-sm font-semibold text-gray-900">{receipt.transactionId}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-2xl">
              <Link
                href="/dashboard/services/vtu"
                className="flex-1 rounded-lg bg-white py-2.5 px-4 text-sm font-semibold text-gray-800 border border-gray-300 text-center transition-colors hover:bg-gray-100"
              >
                Return to VTU
              </Link>
              <button
                onClick={closeReceiptModal}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Buy More
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
