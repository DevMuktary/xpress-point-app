"use client";

import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClipboardDocumentIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

type Payout = {
  id: string;
  amount: string;
  createdAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    bankName: string | null;
    accountNumber: string | null;
    accountName: string | null;
  };
};

export default function AdminPayoutsClientPage({ initialPayouts }: { initialPayouts: Payout[] }) {
  const [payouts, setPayouts] = useState(initialPayouts);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Helper to copy bank info
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
  };

  const handleProcess = async (id: string, action: 'APPROVE' | 'REJECT') => {
    if (!confirm(`Are you sure you want to ${action} this payout?`)) return;

    setProcessingId(id);
    try {
      const res = await fetch('/api/admin/payouts/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: id, action })
      });

      if (!res.ok) throw new Error("Operation failed");

      // Remove from list on success
      setPayouts(prev => prev.filter(p => p.id !== id));

    } catch (error) {
      alert("Failed to process request. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {payouts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <CheckCircleIcon className="h-12 w-12 mx-auto text-green-500 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">All Caught Up!</h3>
          <p className="text-gray-500">No pending payout requests at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {payouts.map((payout) => (
            <div key={payout.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* 1. User & Amount Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {payout.user.firstName} {payout.user.lastName}
                    </h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                      Aggregator
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{payout.user.email}</p>
                  
                  <div className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-100">
                    <span className="text-xs uppercase font-bold mr-2 tracking-wider">Amount to Pay:</span>
                    <span className="text-xl font-extrabold">₦{Number(payout.amount).toLocaleString()}</span>
                  </div>
                </div>

                {/* 2. Bank Details (The important part for you) */}
                <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BanknotesIcon className="h-4 w-4" /> Bank Details
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bank:</span>
                      <span className="font-medium text-gray-900">{payout.user.bankName || 'Not Set'}</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-gray-500">Account No:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">
                          {payout.user.accountNumber || 'Not Set'}
                        </span>
                        {payout.user.accountNumber && (
                          <button 
                            onClick={() => copyToClipboard(payout.user.accountNumber!)}
                            className="text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy Account Number"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account Name:</span>
                      <span className="font-medium text-gray-900 text-right">{payout.user.accountName || 'Not Set'}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Actions */}
                <div className="flex flex-col gap-3 w-full md:w-48">
                  <button
                    onClick={() => handleProcess(payout.id, 'APPROVE')}
                    disabled={processingId === payout.id}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {processingId === payout.id ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <CheckCircleIcon className="h-5 w-5" />}
                    Mark as Paid
                  </button>
                  
                  <button
                    onClick={() => handleProcess(payout.id, 'REJECT')}
                    disabled={processingId === payout.id}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <XCircleIcon className="h-5 w-5" />
                    Reject & Refund
                  </button>
                </div>

              </div>
              <div className="px-6 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-400 flex justify-between">
                <span>Request ID: {payout.id}</span>
                <span>Requested: {new Date(payout.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
