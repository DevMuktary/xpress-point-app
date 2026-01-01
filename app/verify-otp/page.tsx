"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import Loading from '@/app/loading';
import { CheckCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!phone) {
      setError("Phone number is missing.");
      return;
    }

    setIsLoading(true);

    try {
      // Call the API to "finalize" the verification (set cookie, send email, etc.)
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone, bypass: true }), // Sending phone only
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Verification failed.');
      }

      // Success! Redirect to the dashboard.
      router.push('/dashboard');

    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loading />}
      <div className={styles.container}>
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          
          {/* Success Icon */}
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircleIcon className="h-16 w-16 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Verified Automatically</h1>
          
          <p className="text-gray-600 max-w-sm mx-auto">
            Your WhatsApp number <strong>{phone}</strong> has been verified automatically.
          </p>

          {/* Email Notice */}
          <div className="rounded-xl bg-blue-50 p-4 border border-blue-100 max-w-sm mx-auto flex items-start gap-3 text-left">
            <EnvelopeIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <span className="font-bold block mb-1">Check Your Email</span>
              We have sent a verification link to your inbox. Please check your spam folder if you don't see it. You can proceed to your dashboard now.
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm font-medium">{error}</p>
          )}

          {/* Continue Button */}
          <button 
            onClick={handleContinue}
            className="w-full max-w-sm rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Continue to Dashboard'}
          </button>
        </div>
      </div>
    </>
  );
}
