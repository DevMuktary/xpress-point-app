"use client"; // This is an interactive component

import React, { useState, useMemo } from 'react';
import { VtuRequest, Service } from '@prisma/client';
import { 
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';

// "World-class" type for the request + its service name
type VtuHistoryRequest = VtuRequest & {
  service: { name: string };
};

// Define the props to receive the initial data from the server
type Props = {
  initialRequests: VtuHistoryRequest[];
  category: string; // "Airtime", "Data", or "Electricity"
  searchPlaceholder: string;
};

export default function VtuHistoryClientPage({ initialRequests, category, searchPlaceholder }: Props) {
  
  // --- State Management ---
  const [allRequests, setAllRequests] = useState(initialRequests);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- "World-Class" Filter States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // --- "World-Class" Filtering Logic ---
  const filteredRequests = useMemo(() => {
    return allRequests.filter(req => {
      const searchData = req.phoneNumber || req.meterNumber || '';
      const matchesSearch = searchData.includes(searchTerm);
      const matchesStatus = (statusFilter === 'ALL' || req.status === statusFilter);
      return matchesSearch && matchesStatus;
    });
  }, [allRequests, searchTerm, statusFilter]);

  // Helper to format the date
  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Helper to get "world-class" status info
  const getStatusInfo = (status: string) => {
    if (status === 'COMPLETED') {
      return { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Completed' };
    }
    return { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'Failed' };
  };
  
  return (
    <div className="space-y-6">
      {isLoading && <div className="text-center">Loading...</div>}

      {/* --- 1. "World-Class" Filter & Search Bar --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2.5 pl-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg bg-red-100 p-4 text-center text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* --- 2. The "One-by-One" Card List (Your "Stunning" Design) --- */}
      <div className="space-y-4">
        {!isLoading && filteredRequests.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12" />
            <p className="mt-2 font-semibold">No Requests Found</p>
            <p className="text-sm">No {category.toLowerCase()} requests match your filters.</p>
          </div>
        )}

        {filteredRequests.map((request) => {
          const statusInfo = getStatusInfo(request.status);
          const identifier = request.phoneNumber || request.meterNumber;

          return (
            <div 
              key={request.id} 
              className="rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              <div className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  {/* Left Side (Service & Identifier) */}
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      {request.service.name}
                    </p>
                    <p className="text-sm text-gray-600 break-all">
                      {identifier}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(request.createdAt)}
                    </p>
                  </div>
                  
                  {/* Right Side (Status Badge) */}
                  <div className="mt-4 sm:mt-0 sm:ml-4">
                    <span 
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color}`}
                    >
                      <statusInfo.icon className="h-4 w-4" />
                      {statusInfo.text}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* --- "World-Class" Action Footer (Your Design) --- */}
              <div className="border-t border-gray-100 bg-gray-50 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="text-sm">
                    <span className="text-gray-500">Amount: </span>
                    <span className="font-semibold text-gray-900">₦{request.amount.toString()}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Transaction ID: </span>
                    <span className="font-semibold text-gray-900">{request.userReference}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
