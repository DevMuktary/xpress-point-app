"use client"; 

import React, { useState } from 'react';
import { WithdrawalRequest, RequestStatus } from '@prisma/client';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ClockIcon,
  DocumentMagnifyingGlassIcon,
  BanknotesIcon,
  XMarkIcon,
  PencilSquareIcon 
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';

type Details = {
  bankName: string;
  accountNumber: string;
  accountName: string;
};
type Props = {
  currentBalance: number;
  initialRequests: WithdrawalRequest[];
  currentDetails: Details;
  pendingChange: any | null; 
};

export default function PayoutsClientPage({ currentBalance, initialRequests, currentDetails, pendingChange }: Props) {
  
  const [requests, setRequests] = useState(initialRequests);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
  // Ensure balance stays in sync
  const [balance, setBalance] = useState(currentBalance);

  const canWithdraw = balance >= 1000;
  const withdrawalAmount = balance;

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(null);
    if (canWithdraw) {
      setIsConfirmModalOpen(true);
    }
  };
  
  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/aggregator/request-withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Withdrawal request failed.');
      }
      
      setSuccess(data.message);
      setBalance(0); // Reset UI balance immediately
      setRequests([data.newRequest, ...requests]);

    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };
  
  const getStatusInfo = (status: RequestStatus) => {
    switch (status) {
      case 'COMPLETED': return { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Completed' };
      case 'PROCESSING': return { color: 'bg-blue-100 text-blue-800', icon: ArrowPathIcon, text: 'Processing' };
      case 'PENDING': return { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'Pending' };
      case 'FAILED': return { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'Failed' };
      default: return { color: 'bg-gray-100 text-gray-800', icon: ClockIcon, text: 'Unknown' };
    }
  };
  
  return (
    <div className="space-y-6">
      {(isLoading) && <Loading />}

      {/* --- 1. Commission Balance Card --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Commission Wallet</span>
          <div className="p-2 bg-green-100 rounded-full">
            <BanknotesIcon className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <p className="mt-4 text-4xl font-extrabold text-gray-900">
          ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Minimum payout amount is ₦1,000.
        </p>
        
        <div className="border-t border-gray-100 mt-6 pt-6">
          {submitError && (
            <p className="mb-4 text-sm font-medium text-red-600 text-center bg-red-50 p-2 rounded">{submitError}</p>
          )}
          {success && (
            <p className="mb-4 text-sm font-medium text-green-600 text-center bg-green-50 p-2 rounded">{success}</p>
          )}
          <button
            type="button"
            onClick={handleOpenConfirmModal}
            disabled={!canWithdraw || isLoading}
            className="flex w-full justify-center rounded-xl bg-blue-600 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isLoading ? 'Requesting...' : (canWithdraw ? `Request Payout (₦${withdrawalAmount.toLocaleString()})` : 'Insufficient Balance')}
          </button>
        </div>
      </div>

      {/* --- 2. Payout Details Card --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            Payout Destination
          </h3>
          <Link
            href="/dashboard/aggregator/account"
            className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <PencilSquareIcon className="h-4 w-4" />
            Edit
          </Link>
        </div>
        
        {pendingChange ? (
            <div className="rounded-xl bg-yellow-50 p-4 border border-yellow-200 flex items-start gap-3">
              <ClockIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-yellow-800">Change Pending</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Request to change to <span className="font-medium">{pendingChange.newBankName} - {pendingChange.newAccountNumber}</span> is under review.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="text-xs font-bold text-gray-400 uppercase">Bank Name</label>
                <p className="text-base font-semibold text-gray-900 mt-1">{currentDetails.bankName}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="text-xs font-bold text-gray-400 uppercase">Account Number</label>
                <p className="text-base font-semibold text-gray-900 mt-1">{currentDetails.accountNumber}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="text-xs font-bold text-gray-400 uppercase">Account Name</label>
                <p className="text-base font-semibold text-gray-900 mt-1">{currentDetails.accountName}</p>
              </div>
            </div>
          )}
      </div>

      {/* --- 3. History --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg mt-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Payouts</h3>
        
        {requests.length === 0 && (
          <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 font-semibold text-gray-900">No Payouts Yet</p>
            <p className="text-sm">Your withdrawal history will appear here.</p>
          </div>
        )}
        
        <div className="mt-4 space-y-3">
          {requests.map((request) => {
            const statusInfo = getStatusInfo(request.status);
            return (
              <div 
                key={request.id} 
                className="rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    ₦{Number(request.amount).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">
                    Requested: {formatDate(request.createdAt)}
                  </p>
                </div>
                <span 
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusInfo.color}`}
                >
                  <statusInfo.icon className={`h-3.5 w-3.5 ${statusInfo.text === 'Processing' ? 'animate-spin' : ''}`} />
                  {statusInfo.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Modal --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 p-4 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Confirm Payout</h2>
              <button onClick={() => setIsConfirmModalOpen(false)}>
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                <BanknotesIcon className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-gray-600 font-medium">
                You are about to withdraw
              </p>
              <p className="mt-2 text-3xl font-extrabold text-green-600">
                ₦{withdrawalAmount.toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Funds will be sent to your registered bank account.
              </p>
            </div>
            <div className="grid grid-cols-2 border-t border-gray-100">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="p-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalSubmit}
                className="p-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
