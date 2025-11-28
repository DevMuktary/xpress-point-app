"use client";

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  ArrowDownLeftIcon, 
  ArrowUpRightIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

type TransactionItem = {
  id: string;
  type: string;
  amount: string;
  description: string;
  reference: string;
  status: string;
  createdAt: string;
  serviceName: string | null;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
};

export default function AdminTransactionsClientPage({ initialTransactions }: { initialTransactions: TransactionItem[] }) {
  
  const [transactions] = useState(initialTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // --- Filtering Logic ---
  const filteredTransactions = transactions.filter(tx => {
    const searchStr = `${tx.reference} ${tx.user.email} ${tx.user.firstName} ${tx.description}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || tx.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(amount));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800"><CheckCircleIcon className="w-3 h-3" /> Success</span>;
      case 'FAILED': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800"><XCircleIcon className="w-3 h-3" /> Failed</span>;
      default: return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800"><ClockIcon className="w-3 h-3" /> Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative flex-1 max-w-md">
           <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
           <input 
             type="text" 
             placeholder="Search Reference, Email, Name..." 
             className="pl-10 w-full rounded-lg border-gray-300 p-2.5 text-sm focus:ring-gray-500 focus:border-gray-500"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['ALL', 'SERVICE_CHARGE', 'FUND_WALLET', 'REFUND'].map(type => (
            <button 
              key={type} 
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filterType === type ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((tx) => {
                const isDebit = Number(tx.amount) < 0;
                return (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{tx.user.firstName} {tx.user.lastName}</div>
                      <div className="text-xs text-gray-500">{tx.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">{tx.description}</div>
                      <div className="text-xs text-gray-400 font-mono">{tx.reference}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {tx.type.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center gap-1 font-bold text-sm ${isDebit ? 'text-red-600' : 'text-green-600'}`}>
                        {isDebit ? <ArrowUpRightIcon className="h-4 w-4"/> : <ArrowDownLeftIcon className="h-4 w-4"/>}
                        {formatCurrency(tx.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {getStatusBadge(tx.status)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
