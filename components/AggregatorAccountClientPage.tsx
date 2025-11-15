"use client"; // This is an interactive component

import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  ClockIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import { PendingAccountChange } from '@prisma/client';

// --- Type Definitions ---
type Bank = {
  name: string;
  code: string;
};
type Details = {
  bankName: string;
  accountNumber: string;
  accountName: string;
};
type Props = {
  currentDetails: Details;
  pendingChange: PendingAccountChange | null;
};

// --- The Main Component ---
export default function AggregatorAccountClientPage({ currentDetails, pendingChange }: Props) {
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // --- Modal State ---
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Fetch banks when modal opens
  useEffect(() => {
    if (isModalOpen) {
      const fetchBanks = async () => {
        try {
          const res = await fetch('/api/services/banks');
          if (!res.ok) throw new Error('Failed to fetch banks.');
          const data = await res.json();
          setBanks(data.banks);
        } catch (err: any) {
          console.error("Fetch Banks Error:", err.message);
        }
      };
      fetchBanks();
    }
  }, [isModalOpen]);

  // API Call to Verify Account Name
  const handleVerifyAccount = async () => {
    setIsVerifying(true);
    setError(null);
    setAccountName('');
    
    try {
      const res = await fetch(`/api/services/verify-account?account_number=${accountNumber}&bank_code=${bankCode}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Account verification failed.');
      setAccountName(data.accountName); // Success
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  // API Call to Submit the Change Request
  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setError(null);

    const selectedBank = banks.find(b => b.code === bankCode);
    if (!selectedBank) {
      setError("Please select a valid bank.");
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/aggregator/request-account-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          newBankName: selectedBank.name,
          newAccountNumber: accountNumber,
          newAccountName: accountName,
        }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Request failed.');
      }
      
      // Show success receipt
      setReceipt({
        message: data.message,
        bankName: selectedBank.name,
        accountName: accountName,
        accountNumber: accountNumber,
      });
      setIsModalOpen(false); // Close the main modal

    } catch (err: any) { 
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const closeReceiptModal = () => {
    setReceipt(null);
    window.location.reload(); // Reload to show the new pending status
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setError(null);
    setBankCode('');
    setAccountNumber('');
    setAccountName('');
  };
  
  return (
    <div className="space-y-6">
      {(isLoading) && <Loading />}

      {/* --- 1. Current Account Card --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900">
          Current Payout Account
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          This is the account where your commissions will be sent.
        </p>
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500">Bank Name</label>
            <p className="text-base font-semibold text-gray-800">{currentDetails.bankName}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Account Number</label>
            <p className="text-base font-semibold text-gray-800">{currentDetails.accountNumber}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Account Name</label>
            <p className="text-base font-semibold text-gray-800">{currentDetails.accountName}</p>
          </div>
        </div>
        
        {/* --- 2. Pending Change / Button --- */}
        <div className="border-t border-gray-100 mt-6 pt-6">
          {pendingChange ? (
            <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-bold text-yellow-800">
                    Change Request Pending
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    You have a request to change your account to <span className="font-medium">{pendingChange.newAccountName} ({pendingChange.newAccountNumber})</span>. 
                    Please wait for admin approval.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
            >
              Request Account Change
            </button>
          )}
        </div>
      </div>

      {/* --- 3. Change Account Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            {isLoading && <Loading />}
            
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Request Account Change
              </h2>
              <button onClick={resetModal}>
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              {error && (
                <p className="mb-4 text-sm font-medium text-red-600 text-center">{error}</p>
              )}
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Enter your new payout bank details. This will be sent to an admin for approval.</p>
                <div>
                  <label htmlFor="bank" className="block text-sm font-medium text-gray-700">Select Bank*</label>
                  <select
                    id="bank"
                    value={bankCode}
                    onChange={(e) => { setBankCode(e.target.value); setAccountName(''); }}
                    className="w-full rounded-lg border border-gray-300 p-3 shadow-sm"
                  >
                    <option value="">-- Select a Bank --</option>
                    {banks.map(bank => (
                      <option key={bank.code} value={bank.code}>{bank.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Account Number*</label>
                  <div className="flex gap-2">
                    <input
                      id="accountNumber" type="tel" value={accountNumber}
                      onChange={(e) => { setAccountNumber(e.target.value); setAccountName(''); }}
                      maxLength={10}
                      className="flex-1 w-full rounded-lg border border-gray-300 p-3 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyAccount}
                      disabled={isVerifying || accountNumber.length < 10 || !bankCode}
                      className="rounded-lg bg-gray-200 px-4 text-sm font-semibold text-gray-800 disabled:opacity-50"
                    >
                      {isVerifying ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : 'Verify'}
                    </button>
                  </div>
                </div>
                
                {accountName && (
                  <div className="rounded-lg bg-green-50 p-3 border border-green-200">
                    <p className="text-sm font-bold text-green-800">{accountName}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-2xl">
              <button
                onClick={resetModal}
                className="flex-1 rounded-lg bg-white py-2.5 px-4 text-sm font-semibold text-gray-800 border border-gray-300 transition-colors hover:bg-gray-100"
              >
                CANCEL
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={!accountName || isLoading}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 4. Success Receipt Modal --- */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div className="p-6">
              <div className="flex flex-col items-center justify-center">
                <CheckCircleIcon className="h-16 w-16 text-green-500" />
                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  Request Submitted
                </h2>
                <p className="mt-1 text-sm text-gray-600 text-center">
                  {receipt.message}
                </p>
                <div className="w-full mt-6 space-y-2 rounded-lg border bg-gray-50 p-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Bank:</span>
                    <span className="text-sm font-semibold text-gray-900">{receipt.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Account:</span>
                    <span className="text-sm font-semibold text-gray-900">{receipt.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Name:</span>
                    <span className="text-sm font-semibold text-gray-900">{receipt.accountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <span className="text-sm font-semibold text-yellow-600">Pending Approval</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-2xl">
              <button
                onClick={closeReceiptModal}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
