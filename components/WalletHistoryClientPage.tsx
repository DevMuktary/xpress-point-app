"use client";

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  ArrowDownLeftIcon, 
  ArrowUpRightIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';

type TransactionItem = {
  id: string;
  type: string;
  amount: string;
  description: string;
  reference: string;
  status: string;
  createdAt: string;
};

export default function WalletHistoryClientPage({ initialTransactions }: { initialTransactions: TransactionItem[] }) {
  
  const [transactions] = useState(initialTransactions);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Filtering ---
  const filteredTransactions = transactions.filter(tx => {
    const searchStr = `${tx.reference} ${tx.description}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const formatCurrency = (amount: string) => {
    // Remove negative sign for display purposes if we use color coding
    const val = Math.abs(Number(amount));
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val);
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
      
      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          type="text" placeholder="Search by Reference or Description..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2.5 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
           <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-300" />
           <p className="mt-2 font-semibold text-gray-900">No Transactions Found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((tx) => {
            const isDebit = Number(tx.amount) < 0;

            return (
              <div key={tx.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{tx.description}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">{tx.reference}</p>
                  </div>
                  <div className={`text-right font-bold text-lg ${isDebit ? 'text-red-600' : 'text-green-600'}`}>
                    {isDebit ? '-' : '+'}{formatCurrency(tx.amount)}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-50 mt-2">
                   <div className="flex items-center gap-2 text-xs text-gray-500">
                     <span>{new Date(tx.createdAt).toLocaleString()}</span>
                     <span className="hidden sm:inline">•</span>
                     <span className="hidden sm:inline">{tx.type.replace('_', ' ')}</span>
                   </div>
                   {getStatusBadge(tx.status)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
