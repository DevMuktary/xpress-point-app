"use client"; // This is an interactive component

import React, { useState, useEffect, useMemo } from 'react';
import { NewspaperRequest, Service, RequestStatus } from '@prisma/client';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';

// "World-class" type for the request + its service name
type NewspaperHistoryRequest = NewspaperRequest & {
  service: { name: string };
};

// Define the props to receive the initial data from the server
type Props = {
  initialRequests: NewspaperHistoryRequest[];
};

export default function NewspaperHistoryClientPage({ initialRequests }: Props) {
  
  // --- State Management ---
  const [allRequests, setAllRequests] = useState(initialRequests);
  const [isLoading, setIsLoading] = useState(false); // Only for future refreshes
  const [error, setError] = useState<string | null>(null);

  // --- "World-Class" Filter States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // --- "World-Class" API Fetch on Load ---
  // We use this to refresh the data if needed
  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/services/newspaper/history');
      if (!res.ok) {
        throw new Error('Failed to fetch history.');
      }
      const data = await res.json();
      setAllRequests(data.requests);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- "World-Class" Filtering Logic ---
  const filteredRequests = useMemo(() => {
    return allRequests.filter(req => {
      const formData = req.formData as any;
      const searchData = `${formData.oldFirstName} ${formData.oldLastName} ${formData.newFirstName} ${formData.newLastName}`;
      const matchesSearch = searchData.toLowerCase().includes(searchTerm.toLowerCase());
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
  
  // Helper for the "smart" button
  const renderActionButton = (request: NewspaperHistoryRequest) => {
    switch (request.status) {
      case 'COMPLETED':
        return (
          <a 
            href={request.publicationUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            download
            className={`rounded-lg px-3 py-2 text-sm font-semibold text-white flex items-center justify-center gap-2
              ${request.publicationUrl 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-gray-400 cursor-not-allowed'
              }`}
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            Download Publication
          </a>
        );
      case 'FAILED':
        return (
          <div className="text-sm text-center text-red-600 p-2 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold">Sorry, this failed 😞</p>
            <p className="text-xs">{request.statusMessage || 'Please contact support.'}</p>
          </div>
        );
      default: // PENDING or PROCESSING
        return (
          <div className="text-sm text-center text-yellow-800 p-2 rounded-lg bg-yellow-50 border border-yellow-200">
            <p className="font-semibold">{request.status}</p>
            <p className="text-xs">{request.statusMessage}</p>
          </div>
        );
    }
  };


  return (
    <div className="space-y-6">
      {isLoading && <Loading />}

      {/* --- 1. "World-Class" Filter & Search Bar --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name..."
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
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option> 
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
            <p className="text-sm">No newspaper requests match your filters.</p>
          </div>
        )}

        {filteredRequests.map((request) => {
          const statusInfo = getStatusInfo(request.status);
          const formData = request.formData as any; // Cast to access fields

          return (
            <div 
              key={request.id} 
              className="rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              <div className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  {/* Left Side (Service & Names) */}
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      {request.service.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="text-gray-500">Old:</span> {formData.oldFirstName} {formData.oldLastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="text-gray-500">New:</span> {formData.newFirstName} {formData.newLastName}
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
                      <statusInfo.icon className={`h-4 w-4 ${statusInfo.text === 'Processing' ? 'animate-spin' : ''}`} />
                      {statusInfo.text}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* --- "World-Class" Action Footer --- */}
              <div className="border-t border-gray-100 bg-gray-50 p-4">
                {renderActionButton(request)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
