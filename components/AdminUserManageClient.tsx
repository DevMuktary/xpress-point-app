"use client";

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  UserIcon, 
  BanknotesIcon, 
  NoSymbolIcon, 
  CheckCircleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  WalletIcon
} from '@heroicons/react/24/outline';

type UserResult = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  isBlocked: boolean;
  walletBalance: string;
  commissionBalance: string;
};

export default function AdminUserManageClient() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [users, setUsers] = useState<UserResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);

  // Modal States
  const [modalType, setModalType] = useState<'FUND' | 'BLOCK' | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Search ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setIsSearching(true);
    setUsers([]);
    setSelectedUser(null);

    try {
      const res = await fetch('/api/admin/users/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SEARCH', query })
      });
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (e) {
      alert("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  // --- Fund Wallet ---
  const handleFund = async () => {
    if (!selectedUser || !amount) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/admin/users/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'FUND', 
          userId: selectedUser.id, 
          amount: amount, 
          reason: reason 
        })
      });

      if (!res.ok) throw new Error("Failed");

      alert(`Successfully funded ₦${amount}`);
      // Refresh user data locally
      const newBalance = (parseFloat(selectedUser.walletBalance) + parseFloat(amount)).toFixed(2);
      setSelectedUser({ ...selectedUser, walletBalance: newBalance });
      setModalType(null);
      setAmount(''); setReason('');
      
    } catch (e) {
      alert("Funding failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Toggle Block ---
  const handleBlock = async () => {
    if (!selectedUser) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/admin/users/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'TOGGLE_BLOCK', 
          userId: selectedUser.id 
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error("Failed");

      alert(data.message);
      setSelectedUser({ ...selectedUser, isBlocked: data.isBlocked });
      setModalType(null);

    } catch (e) {
      alert("Action failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Search Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-6 w-6 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Email, Phone, Name, or Agent Code..." 
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={isSearching}
            className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center"
          >
            {isSearching ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : "Search"}
          </button>
        </form>
      </div>

      {/* 2. Search Results */}
      {users.length > 0 && !selectedUser && (
        <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Search Results</h3>
          {users.map(user => (
            <button 
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'AGGREGATOR' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                  {user.role}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 3. Selected User Management Panel */}
      {selectedUser && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white border-4 border-blue-50 flex items-center justify-center shadow-sm">
                <UserIcon className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</h2>
                <p className="text-gray-500 text-sm">{selectedUser.email} • {selectedUser.phoneNumber}</p>
                {selectedUser.isBlocked && (
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-bold">
                    <NoSymbolIcon className="h-3 w-3"/> BLOCKED
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => setSelectedUser(null)} className="text-sm text-blue-600 font-medium hover:underline">
              Close
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 border-b border-gray-200">
            <div className="p-6 border-r border-gray-200">
               <p className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                 <WalletIcon className="h-4 w-4"/> Wallet Balance
               </p>
               <p className="text-2xl font-extrabold text-gray-900 mt-1">₦{Number(selectedUser.walletBalance).toLocaleString()}</p>
            </div>
            <div className="p-6">
               <p className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                 <ShieldCheckIcon className="h-4 w-4"/> Commission
               </p>
               <p className="text-2xl font-extrabold text-gray-900 mt-1">₦{Number(selectedUser.commissionBalance).toLocaleString()}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 flex gap-4">
            <button 
              onClick={() => setModalType('FUND')}
              className="flex-1 py-4 rounded-xl bg-green-600 text-white font-bold shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
            >
              <BanknotesIcon className="h-6 w-6" /> Fund Wallet
            </button>
            <button 
              onClick={() => setModalType('BLOCK')}
              className={`flex-1 py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2
                ${selectedUser.isBlocked 
                  ? 'bg-gray-800 text-white hover:bg-gray-900' 
                  : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'}`}
            >
              {selectedUser.isBlocked ? (
                <><CheckCircleIcon className="h-6 w-6" /> Unblock User</>
              ) : (
                <><NoSymbolIcon className="h-6 w-6" /> Suspend User</>
              )}
            </button>
          </div>

        </div>
      )}

      {/* --- MODALS --- */}
      
      {/* 1. Fund Modal */}
      {modalType === 'FUND' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Fund Wallet</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (₦)</label>
                <input 
                  type="number" 
                  className="w-full border-2 border-gray-200 rounded-lg p-3 text-lg font-bold focus:border-green-500 focus:ring-green-500"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Admin Note</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  placeholder="Reason for funding..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModalType(null)} className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg">Cancel</button>
                <button onClick={handleFund} disabled={isProcessing} className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {isProcessing ? 'Processing...' : 'Confirm Fund'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Block Modal */}
      {modalType === 'BLOCK' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
              <NoSymbolIcon className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">
              {selectedUser.isBlocked ? 'Unblock' : 'Suspend'} User?
            </h3>
            <p className="text-center text-gray-500 text-sm mt-2 mb-6">
              {selectedUser.isBlocked 
                ? "This will restore their access to the dashboard immediately." 
                : "This will prevent them from logging in or performing any transactions."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setModalType(null)} className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg">Cancel</button>
              <button onClick={handleBlock} disabled={isProcessing} className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50">
                {isProcessing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
