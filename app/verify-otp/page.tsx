"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import Loading from '@/app/loading';
import { CheckCircleIcon, EnvelopeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone');

  // State
  const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'ERROR'>('LOADING');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Prevent double-firing in React Strict Mode
  const hasRun = useRef(false);

  // --- AUTOMATIC TRIGGER ON LOAD ---
  useEffect(() => {
    if (!phone) {
      setStatus('ERROR');
      setErrorMessage("Phone number is missing.");
      return;
    }

    if (hasRun.current) return;
    hasRun.current = true;

    const performAutoVerification = async () => {
      try {
        // Call the API immediately to verify and send email
        const response = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: phone }), 
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Verification failed.');
        }

        // If successful, show the Success UI
        setStatus('SUCCESS');
      } catch (err: any) {
        setStatus('ERROR');
        setErrorMessage(err.message || "Something went wrong.");
      }
    };

    performAutoVerification();
  }, [phone]);

  // --- Navigation Handler ---
  const handleContinue = () => {
    router.push('/dashboard');
  };

  return (
    <>
      <div className={styles.container}>
        <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-md mx-auto p-4">
          
          {/* --- LOADING STATE --- */}
          {status === 'LOADING' && (
            <div className="flex flex-col items-center animate-in fade-in">
              <ArrowPathIcon className="h-16 w-16 text-blue-600 animate-spin mb-4" />
              <h2 className="text-xl font-bold text-gray-900">Finalizing Account...</h2>
              <p className="text-gray-500">Please wait while we verify your details.</p>
            </div>
          )}

          {/* --- SUCCESS STATE --- */}
          {status === 'SUCCESS' && (
            <div className="flex flex-col items-center animate-in zoom-in duration-300">
              {/* Success Icon */}
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <CheckCircleIcon className="h-16 w-16 text-green-600" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900">Verified Automatically!</h1>
              
              <p className="text-gray-600 mt-2">
                Your WhatsApp number <strong>{phone}</strong> has been verified.
              </p>

              {/* Email Notice Box */}
              <div className="mt-6 rounded-xl bg-blue-50 p-4 border border-blue-100 flex items-start gap-3 text-left w-full">
                <EnvelopeIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <span className="font-bold block mb-1">Check Your Email</span>
                  We have sent a verification link to your inbox. Please check your <strong>Spam/Junk</strong> folder if you don't see it.
                </div>
              </div>

              {/* Continue Button (Just Redirects) */}
              <button 
                onClick={handleContinue}
                className="mt-8 w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all hover:-translate-y-0.5"
              >
                Continue to Dashboard
              </button>
            </div>
          )}

          {/* --- ERROR STATE --- */}
          {status === 'ERROR' && (
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-red-100 p-3 mb-4">
                <ArrowPathIcon className="h-12 w-12 text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-red-700">Verification Issue</h2>
              <p className="text-gray-600 mt-2">{errorMessage}</p>
              
              <button 
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              >
                Try Again
              </button>
            </div>
          )}
          
        </div>
      </div>
    </>
  );
}
