"use client"; // This is an interactive component

import React, { useState, useEffect, useMemo } from 'react';
import { WithdrawalRequest, RequestStatus } from '@prisma/client';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  DocumentMagnifyingGlassIcon,
  BanknotesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';

// Define the props to receive the initial data from the server
type Props = {
  currentBalance: number;
  initialRequests: WithdrawalRequest[];
};

// --- The Main "World-Class" Component ---
export default function PayoutsClientPage({ currentBalance, initialRequests }: Props) {
  
  // --- State Management ---
  const [requests, setRequests] = useState(initialRequests);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
  // "World-Class" state for the current balance
  const [balance, setBalance] = useState(currentBalance);

  // --- "World-Class" Payout Logic (Your Design) ---
  const canWithdraw = balance >= 1000;
  const withdrawalAmount = balance; // They withdraw their *entire* balance

  // --- Handle Open Confirmation Modal ---
  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (canWithdraw) {
      setIsConfirmModalOpen(true);
    }
  };
  
  // --- This is the *final* submit, called by the modal's "YES" button ---
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
      setBalance(0); // "Stunningly" reset balance on screen
      setRequests([data.newRequest, ...requests]); // Add new request to history

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format the date
  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };
  
  // Helper to get "world-class" status info
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

      {/* --- 1. "Stunning" Balance Card --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">Available Commission</span>
          <BanknotesIcon className="h-6 w-6 text-green-500" />
        </div>
        <p className="mt-2 text-3xl font-bold text-gray-900">
          ₦{balance.toFixed(2)}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          You can request a payout when your balance reaches ₦1,000.
        </p>
        
        <div className="border-t border-gray-100 mt-6 pt-6">
          {submitError && (
            <p className="mb-4 text-sm font-medium text-red-600 text-center">{submitError}</p>
          )}
          {success && (
            <p className="mb-4 text-sm font-medium text-green-600 text-center">{success}</p>
          )}
          <button
            type="button"
            onClick={handleOpenConfirmModal}
            disabled={!canWithdraw || isLoading}
            className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Requesting...' : (canWithdraw ? `Request Payout (₦${withdrawalAmount.toFixed(2)})` : 'Minimum Payout: ₦1,000')}
          </button>
        </div>
      </div>

      {/* --- 2. The "My Payouts" History --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg mt-6">
        <h3 className="text-lg font-semibold text-gray-900">My Payout History</h3>
        
        {requests.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12" />
            <p className="mt-2 font-semibold">No History Found</p>
            <p className="text-sm">You have not requested any payouts yet.</p>
          </div>
        )}
        
        <div className="mt-6 space-y-4">
          {requests.map((request) => {
            const statusInfo = getStatusInfo(request.status);
            return (
              <div 
                key={request.id} 
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      ₦{request.amount.toString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(request.createdAt)}
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-4">
                    <span 
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color}`}
                    >
                      <statusInfo.icon className={`h-4 w-4 ${statusInfo.text === 'Processing' ? 'animate-spin' : ''}`} />
                      {statusInfo.text}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Your "World-Class" Confirmation Modal --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Confirm Payout
              </h2>
              <button onClick={() => setIsConfirmModalOpen(false)}>
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-center text-gray-600">
                Are you sure you want to request a payout of your *entire* commission balance?
              </p>
              <p className="mt-4 text-center text-3xl font-bold text-blue-600">
                ₦{withdrawalAmount.toFixed(2)}
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
                YES, REQUEST
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
