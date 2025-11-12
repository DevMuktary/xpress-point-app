"use client"; // This is an interactive component

import React, { useState } from 'react';
import { 
  InformationCircleIcon,
  IdentificationIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';

export default function DelinkClientPage() {
  
  // --- State Management ---
  const [nin, setNin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null); // Your "Sweet Alert" message

  // --- API: Handle Form Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSuccess(null);

    // "World-class" validation
    if (nin.length !== 11 || !/^[0-9]+$/.test(nin)) {
      setSubmitError("NIN must be exactly 11 digits.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/services/nin/delink-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nin }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed.');
      }
      
      setSuccess(data.message); // Your "Sweet Alert" - style message
      setNin(''); // Reset the form
      
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {(isSubmitting) && <Loading />}
      
      {/* --- 1. The "World-Class" Instructions (Your Design) --- */}
      <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-bold text-blue-800">
              How This Service Works
            </h3>
            <div className="mt-2 text-sm text-blue-700 space-y-2">
              <p>
                Send your NIN to Delink Your Self Service Account or Retrieve your Self Service Email (Only).
              </p>
              <p className="font-semibold">
                This service costs ₦2500. You will get the result within 24 hrs.
              </p>
              <p>
                <strong className="font-semibold">DELINKING</strong> means removing the NIN from being logged in on one browser, so it can be used on another browser.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* --- Your "Sweet Alert" Style Message --- */}
      {success && (
        <div className="rounded-lg bg-green-50 p-4 border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-green-800">
                Request Submitted Successfully!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Your request is now <strong className="font-semibold">PENDING</strong>. You can monitor its status on the
                  <Link href="/dashboard/history/delink" className="font-semibold underline hover:text-green-600">
                    NIN Delink History
                  </Link> page.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 2. The "Submit New Request" Form --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* NIN Input */}
          <div>
            <label htmlFor="nin" className="text-lg font-semibold text-gray-900">
              Enter NIN
            </label>
            <p className="text-sm text-gray-600 mt-1">
              Enter the 11-digit NIN to delink or retrieve email for.
            </p>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <IdentificationIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="nin"
                type="tel"
                value={nin}
                onChange={(e) => setNin(e.target.value)}
                placeholder="Enter 11-digit NIN"
                maxLength={11}
                className="w-full rounded-lg border border-gray-300 p-3 pl-10 text-lg shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          {submitError && (
            <p className="!mt-2 text-sm font-medium text-red-600 text-center">{submitError}</p>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Delink Request (Fee: ₦2500)'}
          </button>
        </form>
      </div>
    </div>
  );
}
