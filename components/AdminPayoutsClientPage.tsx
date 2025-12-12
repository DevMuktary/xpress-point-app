"use client";

import React, { useState } from 'react';
import { 
  CheckCircleIcon, XCircleIcon, ClipboardDocumentIcon, 
  PencilSquareIcon
} from '@heroicons/react/24/outline';

// --- Type Definitions ---
type UserInfo = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bankName?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
};

type PayoutRequest = {
  id: string;
  amount: string;
  status: string;
  createdAt: string;
  user: UserInfo;
};

type PayoutHistoryItem = {
  id: string;
  amount: string;
  status: string;
  updatedAt: string;
  user: UserInfo;
};

type AccountChangeRequest = {
  id: string;
  userId: string;
  newAccountName: string;
  newAccountNumber: string;
  newBankName: string;
  createdAt: string;
  user: UserInfo;
};

type Props = {
  initialPayouts: PayoutRequest[];
  payoutHistory: PayoutHistoryItem[];
  accountChanges: AccountChangeRequest[];
};

export default function AdminPayoutsClientPage({ initialPayouts, payoutHistory, accountChanges }: Props) {
  
  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY' | 'CHANGES'>('PENDING');
  
  // Explicitly typed state to fix the "prev" error
  const [payouts, setPayouts] = useState<PayoutRequest[]>(initialPayouts);
  const [changes, setChanges] = useState<AccountChangeRequest[]>(accountChanges);
  
  const [processingId, setProcessingId] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
  };

  // --- Process Payout (Approve/Reject) ---
  const handleProcessPayout = async (id: string, action: 'APPROVE' | 'REJECT') => {
    if (!confirm(`Are you sure you want to ${action} this payout?`)) return;
    setProcessingId(id);
    
    try {
      const res = await fetch('/api/admin/payouts/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: id, action })
      });
      
      if (!res.ok) throw new Error("Failed");
      
      // Update state: filter out the processed item
      setPayouts((prev) => prev.filter((p) => p.id !== id));
      
      alert("Success!");
      window.location.reload(); // Reload to update history tab
      
    } catch (error) { 
      alert("Failed to process request."); 
    } finally { 
      setProcessingId(null); 
    }
  };

  // --- Process Account Change ---
  const handleProcessChange = async (id: string, action: 'APPROVE' | 'REJECT') => {
    if (!confirm(`Confirm ${action} for this account change?`)) return;
    setProcessingId(id);
    
    try {
      const res = await fetch('/api/admin/account-changes/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: id, action })
      });
      
      if (!res.ok) throw new Error("Failed");
      
      // Update state: filter out the processed item
      setChanges((prev) => prev.filter((c) => c.id !== id));
      
      alert("Account updated successfully.");
      
    } catch (error) { 
      alert("Failed to update account."); 
    } finally { 
      setProcessingId(null); 
    }
  };

  return (
    <div className="space-y-6">
      
      {/* TABS */}
      <div className="flex gap-4 border-b border-gray-200 overflow-x-auto">
        <button onClick={() => setActiveTab('PENDING')} className={`whitespace-nowrap pb-3 px-4 font-bold text-sm border-b-2 transition-all ${activeTab === 'PENDING' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Pending Payouts ({payouts.length})
        </button>
        <button onClick={() => setActiveTab('CHANGES')} className={`whitespace-nowrap pb-3 px-4 font-bold text-sm border-b-2 transition-all ${activeTab === 'CHANGES' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Account Updates ({changes.length})
        </button>
        <button onClick={() => setActiveTab('HISTORY')} className={`whitespace-nowrap pb-3 px-4 font-bold text-sm border-b-2 transition-all ${activeTab === 'HISTORY' ? 'border-gray-600 text-gray-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Payout History
        </button>
      </div>

      {/* --- TAB 1: PENDING PAYOUTS --- */}
      {activeTab === 'PENDING' && (
        <div className="space-y-6">
          {payouts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <CheckCircleIcon className="h-12 w-12 mx-auto text-green-500 mb-3" />
              <p className="text-gray-500">No pending payouts.</p>
            </div>
          ) : (
            payouts.map((payout) => (
              <div key={payout.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{payout.user.firstName} {payout.user.lastName}</h3>
                  <div className="mt-2 inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-lg text-lg font-extrabold">₦{Number(payout.amount).toLocaleString()}</div>
                </div>
                <div className="flex-1 bg-gray-50 p-4 rounded-lg text-sm">
                  <p><strong>Bank:</strong> {payout.user.bankName}</p>
                  <div className="flex gap-2 items-center">
                    <strong>Acc:</strong> {payout.user.accountNumber} 
                    {payout.user.accountNumber && (
                      <button onClick={() => copyToClipboard(payout.user.accountNumber!)}>
                        <ClipboardDocumentIcon className="h-4 w-4 text-blue-500"/>
                      </button>
                    )}
                  </div>
                  <p><strong>Name:</strong> {payout.user.accountName}</p>
                </div>
                <div className="flex flex-col gap-2 w-full md:w-32">
                  <button 
                    onClick={() => handleProcessPayout(payout.id, 'APPROVE')} 
                    disabled={!!processingId} 
                    className="py-2 bg-green-600 text-white rounded font-bold text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    Pay
                  </button>
                  <button 
                    onClick={() => handleProcessPayout(payout.id, 'REJECT')} 
                    disabled={!!processingId} 
                    className="py-2 bg-red-50 text-red-600 border border-red-200 rounded font-bold text-sm hover:bg-red-100 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- TAB 2: ACCOUNT CHANGES --- */}
      {activeTab === 'CHANGES' && (
        <div className="space-y-6">
          {changes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <PencilSquareIcon className="h-12 w-12 mx-auto text-blue-500 mb-3" />
              <p className="text-gray-500">No pending account update requests.</p>
            </div>
          ) : (
            changes.map((change) => (
              <div key={change.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{change.user.firstName} {change.user.lastName}</h3>
                  <p className="text-sm text-gray-500">{change.user.email}</p>
                </div>
                <div className="flex-1 bg-blue-50 p-4 rounded-lg text-sm">
                  <h4 className="font-bold text-blue-800 mb-2">New Account Details</h4>
                  <p><strong>Bank:</strong> {change.newBankName}</p>
                  <p><strong>Acc:</strong> {change.newAccountNumber}</p>
                  <p><strong>Name:</strong> {change.newAccountName}</p>
                </div>
                <div className="flex flex-col gap-2 w-full md:w-32">
                  <button 
                    onClick={() => handleProcessChange(change.id, 'APPROVE')} 
                    disabled={!!processingId} 
                    className="py-2 bg-blue-600 text-white rounded font-bold text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleProcessChange(change.id, 'REJECT')} 
                    disabled={!!processingId} 
                    className="py-2 bg-red-50 text-red-600 border border-red-200 rounded font-bold text-sm hover:bg-red-100 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- TAB 3: HISTORY --- */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payoutHistory.map((h) => (
                  <tr key={h.id}>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(h.updatedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{h.user.firstName} {h.user.lastName}</td>
                    <td className="px-6 py-4 text-sm font-bold">₦{Number(h.amount).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${h.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
