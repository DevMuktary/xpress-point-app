"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import Loading from '@/app/loading';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone');

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  
  // --- NEW Timer States ---
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- NEW Timer Logic ---
  useEffect(() => {
    // Only run the timer if countdown is greater than 0
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      // Cleanup function to clear the timeout
      return () => clearTimeout(timer);
    }
  }, [countdown]); // This effect re-runs every time 'countdown' changes

  // Focus the first input on page load
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (!/^[0-9]$/.test(value) && value !== "") return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResendMessage(null);

    const otpCode = otp.join("");
    if (otpCode.length !== 6 || !phone) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone, otp: otpCode }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Invalid or expired OTP.');
      }

      // Success! Redirect to the dashboard.
      router.push('/dashboard');

    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // --- NEW Resend Function ---
  const handleResend = async () => {
    if (countdown > 0 || isResending || !phone) return;

    setIsResending(true);
    setError(null);
    setResendMessage(null);

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP.');
      }

      setResendMessage("A new code has been sent!");
      setCountdown(60); // Restart the timer
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      {isLoading && <Loading />}
      <div className={styles.container}>
        <h1 className={styles.title}>Verify Your Account</h1>
        <p className={styles.subtitle}>
          Enter the 6-digit code sent to your WhatsApp at <strong>{phone}</strong>
        </p>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.otpGroup}>
            {otp.map((digit, index) => (
              <input
                key={index}
                type="tel" // Use "tel" for number pads on mobile
                maxLength={1}
                className={styles.otpInput}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => { inputRefs.current[index] = el; }}
                disabled={isLoading}
              />
            ))}
          </div>

          {error && (
            <p style={{ color: '#e74c3c', textAlign: 'center' }}>{error}</p>
          )}
          {resendMessage && (
            <p style={{ color: '#2ecc71', textAlign: 'center' }}>{resendMessage}</p>
          )}
          
          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify & Continue'}
          </button>

          {/* --- UPDATED Resend Button --- */}
          <button 
            type="button" 
            className={styles.resendLink} 
            onClick={handleResend}
            disabled={countdown > 0 || isResending}
          >
            {isResending 
              ? 'Sending...' 
              : (countdown > 0 ? `Resend Code (in ${countdown}s)` : 'Resend Code')
            }
          </button>
        </form>
      </div>
    </>
  );
}
