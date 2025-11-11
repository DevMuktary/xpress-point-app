"use client"; // This is an interactive component

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PersonalizationRequest } from '@prisma/client';
import { ExclamationTriangleIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
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
  
  // This state is for the MAIN submit button
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // This state is for the individual "Check Status" buttons
  const [isCheckingId, setIsCheckingId] = useState<string | null>(null);

  // States for your "on-screen" messages
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  
  // State for the *history table's* messages
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // --- API 1: Submit New Request ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    setStatusMessage(null);

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
      
      setSubmitSuccess(data.message); // "Request submitted successfully!"
      setTrackingId(''); // Clear the input field
      
      // Add the new request to the top of our history list
      // We need to fetch all requests again to get the new one
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
    setIsCheckingId(request.id); // Set loading for THIS button
    setSubmitError(null);
    setSubmitSuccess(null);
    setStatusMessage(`Checking ${request.trackingId}...`); // On-screen message

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

      // --- "World-Class" On-Screen Message ---
      setStatusMessage(data.message); // e.g., "Request is still processing."

      // Update the list of requests in our state
      const newRequests = await fetchHistory();
      setRequests(newRequests);

    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsCheckingId(null); // Stop loading for this button
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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {(isSubmitting) && <Loading />}

      {/* --- 1. The "No Refund" Warning (Your Design) --- */}
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
                There is **no refund** for this service. Please make sure the
                Tracking ID is correct before submitting.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. The "Submit New Request" Form --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900">Submit New Request</h3>
        <p className="text-sm text-gray-600 mt-1">
          Enter the Tracking ID from your NIN registration slip.
        </p>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="relative">
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter Tracking ID"
              className="w-full rounded-lg border border-gray-300 p-3 text-lg shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          
          {/* On-screen messages for the submit button */}
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
      
      {/* --- 3. The "My Requests" History Table (Your "Smart" Table) --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900">My Requests</h3>
        
        {/* On-screen message for the "Check Status" button */}
        {statusMessage && (
          <p className="mt-2 text-sm font-medium text-center text-blue-600">{statusMessage}</p>
        )}
        
        <div className="mt-4 flow-root">
          <div className="-mx-6 -my-6 overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 px-6 text-left text-sm font-semibold text-gray-900">Tracking ID</th>
                    <th scope="col" className="py-3.5 px-6 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th scope="col" className="py-3.5 px-6 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="py-3.5 px-6 text-left text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 px-6 text-center text-gray-500">
                        You have no pending requests.
                      </td>
                    </tr>
                  )}
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td className="py-4 px-6 text-sm font-medium text-gray-800">{request.trackingId}</td>
                      <td className="py-4 px-6 text-sm text-gray-500">{formatDate(request.createdAt)}</td>
                      <td className="py-4 px-6 text-sm">
                        {request.status === 'COMPLETED' && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Completed
                          </span>
                        )}
                        {request.status === 'PENDING' && (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                            Pending
                          </span>
                        )}
                        {request.status === 'FAILED' && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        {/* --- The "Smart" Button --- */}
                        {request.status === 'COMPLETED' && (
                          <Link 
                            href={`/dashboard/services/nin/personalize/result/${request.id}`}
                            className="rounded bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
                          >
                            View Result
                          </Link>
                        )}
                        {request.status === 'PENDING' && (
                          <button
                            onClick={() => handleCheckStatus(request)}
                            disabled={isCheckingId === request.id}
                            className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            {isCheckingId === request.id ? (
                              <ArrowPathIcon className="h-4 w-4 animate-spin" />
                            ) : (
                              'Check Status'
                            )}
                          </button>
                        )}
                        {request.status === 'FAILED' && (
                          <span className="text-xs text-red-600" title={request.statusMessage || 'Failed'}>
                            Sorry, this failed 😞
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
