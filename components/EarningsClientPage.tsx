"use client"; // This is an interactive component

import React, { useState, useEffect, useMemo } from 'react';
import { 
  MagnifyingGlassIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { CommissionEarning } from '@/app/dashboard/aggregator/earnings/page'; // Import our type
import Loading from '@/app/loading';

// Define the props to receive the initial data from the server
type Props = {
  initialEarnings: CommissionEarning[];
};

export default function EarningsClientPage({ initialEarnings }: Props) {
  
  // --- State Management ---
  const [earnings, setEarnings] = useState(initialEarnings);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- "World-Class" Filter States ---
  const [searchTerm, setSearchTerm] = useState('');
  // We can add a date filter here later

  // --- "World-Class" Filtering Logic ---
  const filteredEarnings = useMemo(() => {
    return earnings.filter(e => {
      const searchData = `${e.agentName} ${e.serviceName}`.toLowerCase();
      return searchData.includes(searchTerm.toLowerCase());
    });
  }, [earnings, searchTerm]);

  // Helper to format the date
  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <div className="space-y-6">
      {isLoading && <Loading />}

      {/* --- 1. Filter & Search Bar --- */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by Agent Name or Service..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2.5 pl-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-100 p-4 text-center text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* --- 2. The "One-by-One" Card List (Your "Stunning" Design) --- */}
      <div className="space-y-4">
        {filteredEarnings.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12" />
            <p className="mt-2 font-semibold">No Earnings Found</p>
            <p className="text-sm">You have not earned any commission yet.</p>
          </div>
        )}

        {filteredEarnings.map((earning) => (
          <div 
            key={earning.id} 
            className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between">
              {/* Left Side (What happened) */}
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {earning.serviceName}
                </p>
                <p className="text-sm text-gray-600">
                  by <span className="font-medium">{earning.agentName}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(earning.createdAt)}
                </p>
              </div>
              
              {/* Right Side (How much you earned) */}
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">
                  + ₦{earning.commission.toString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
