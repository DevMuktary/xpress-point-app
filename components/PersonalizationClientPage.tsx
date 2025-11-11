"use client"; // This is an interactive component

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PersonalizationRequest, RequestStatus } from '@prisma/client';
import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon, 
  CheckCircleIcon,
  DocumentMagnifyingGlassIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';

// Define the props to receive the initial data from the server
type Props = {
  initialRequests: PersonalizationRequest[];
};

export default function PersonalizationClientPage({ initialRequests }: Props) {
  const router = useRouter();
  
  // --- State Management ---
  const [requests, setRequests] = useState(initialRequests);
  const [trackingId, setTrackingId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingId, setIsCheckingId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // --- Filtered Requests ---
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesSearch = req.trackingId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = (statusFilter === 'ALL' || req.status === statusFilter);
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  // --- API 1: Submit New Request ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    setStatusMessage(null);

    // --- "World-Class" Validation ---
    if (trackingId.length > 15) {
      setSubmitError("Tracking ID cannot be more than 15 characters.");
      setIsSubmitting(false);
      return;
    }
    // ----------------------------

    try {
      const response = await fetch('/api/services/nin/personalization-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingId }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed.');
      }
      
      setSubmitSuccess(data.message);
      setTrackingId('');
      
      const newRequests = await fetchHistory();
      setRequests(newRequests);

    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- API 2: Check Status (Manual Button) ---
  const handleCheckStatus = async (request: PersonalizationRequest) => {
    setIsCheckingId(request.id);
    setSubmitError(null);
    setSubmitSuccess(null);
    setStatusMessage(`Checking ${request.trackingId}...`);

    try {
      const response = await fetch('/api/services/nin/personalization-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingId: request.trackingId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check status.');
      }

      setStatusMessage(data.message);

      const newRequests = await fetchHistory();
      setRequests(newRequests);

    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsCheckingId(null);
    }
  };

  // Helper function to re-fetch the history
  const fetchHistory = async () => {
    const res = await fetch('/api/services/nin/personalization-history');
    if (!res.ok) return [];
    const data = await res.json();
    return data.requests;
  };

  // Helper to format the date
  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };
  
  // Helper to get "world-class" status colors
  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Helper for the "smart" button
  const renderActionButton = (request: PersonalizationRequest) => {
    const isLoading = isCheckingId === request.id;
    
    switch (request.status) {
      case 'COMPLETED':
        return (
          <Link 
            href={`/dashboard/services/nin/personalize/result/${request.id}`}
            className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            View Result
          </Link>
        );
      case 'PROCESSING':
        return (
          <button
            onClick={() => handleCheckStatus(request)}
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              'Check Status'
            )}
          </button>
        );
      case 'FAILED':
        return (
          <span className="text-sm text-red-600" title={request.statusMessage || 'Failed'}>
            Sorry, this failed 😞
          </span>
        );
    }
  };


  return (
    <div className="space-y-6">
      {(isSubmitting) && <Loading />}

      {/* --- 1. The "No Refund" Warning (FIXED) --- */}
      <div className="rounded-lg bg-red-50 p-4 border border-red-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-bold text-red-800">
              Important: No Refunds
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                There is <strong className="font-semibold">no refund</strong> for this service. Please make sure the
                Tracking ID is correct before submitting.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. The "Submit New Request" Form (FIXED) --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900">Submit New Request</h3>
        <p className="text-sm text-gray-600 mt-1">
          Enter Tracking ID to get NIN NUMBER/SLIP.
        </p>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <DocumentMagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter Tracking ID (max 15 characters)"
              maxLength={15} // <-- THIS IS THE FIX
              className="w-full rounded-lg border border-gray-300 p-3 pl-10 text-lg shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          
          {submitSuccess && (
            <p className="mt-2 text-sm font-medium text-green-600">{submitSuccess}</p>
          )}
          {submitError && (
            <p className="mt-2 text-sm font-medium text-red-600">{submitError}</p>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : `Submit Request (Fee: ₦1000)`}
          </button>
        </form>
      </div>
      
      {/* --- 3. The "My Requests" History --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900">My Requests</h3>
        
        {/* --- Filter & Search Bar --- */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by Tracking ID..."
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
            <option value="PROCESSING">Processing</option> 
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
        
        {statusMessage && (
          <p className="mt-4 text-sm font-medium text-center text-blue-600">{statusMessage}</p>
        )}
        
        {/* --- "One-by-One" Card List --- */}
        <div className="mt-6 space-y-4">
          {filteredRequests.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              <p>No requests found.</p>
            </div>
          )}

          {filteredRequests.map((request) => (
            <div 
              key={request.id} 
              className="rounded-lg border border-gray-200 p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-semibold text-gray-900 break-all">
                    {request.trackingId}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(request.createdAt)}
                  </p>
                </div>
                
                <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col sm:items-end gap-2">
                  <span 
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(request.status)}`}
                  >
                    {request.status}
                  </span>
                  
                  <div className="mt-2">
                    {renderActionButton(request)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
