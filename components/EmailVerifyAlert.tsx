"use client"; // This is an interactive Client Component

import React, { useState } from 'react';

export default function EmailVerifyAlert() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/auth/resend-email', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email.');
      }
      
      setMessage("A new verification link has been sent to your email.");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:gap-3 rounded-lg bg-yellow-100 p-4 text-yellow-800">
      <span className="text-xl hidden sm:block">📧</span>
      <div className="flex-1">
        <h3 className="font-bold">Verify Your Email</h3>
        <p className="text-sm">
          Please click the verification link sent to your email to unlock services.
        </p>
        
        {/* --- Success/Error Messages --- */}
        {message && (
          <p className="mt-2 text-sm font-bold text-green-700">{message}</p>
        )}
        {error && (
          <p className="mt-2 text-sm font-bold text-red-700">{error}</p>
        )}
      </div>

      <button
        onClick={handleResend}
        disabled={isLoading}
        className="mt-3 sm:mt-0 sm:ml-auto w-full sm:w-auto flex-shrink-0 rounded-md bg-yellow-200 px-4 py-2 text-sm font-bold text-yellow-900 transition-colors hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? 'Sending...' : 'Resend Email'}
      </button>
    </div>
  );
}
