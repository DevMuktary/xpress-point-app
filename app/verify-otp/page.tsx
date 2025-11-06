"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import Loading from '@/app/loading';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone'); // Get phone number from URL

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first input on page load
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    // Only allow numbers
    if (!/^[0-9]$/.test(value) && value !== "") return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // If a number is entered, move focus to the next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // If backspace is pressed and the input is empty, move to the previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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

      // Success! We will log the user in.
      // Next.js doesn't have a simple "login" function.
      // We will handle this by setting a cookie, which the API will do.
      // For now, let's just redirect to the dashboard.
      router.push('/dashboard'); // We will create this page next.

    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
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
                type="text"
                maxLength={1}
                className={styles.otpInput}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputRefs.current[index] = el)}
                disabled={isLoading}
              />
            ))}
          </div>

          {error && (
            <p style={{ color: '#e74c3c', textAlign: 'center' }}>{error}</p>
          )}
          
          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify & Continue'}
          </button>

          <button type="button" className={styles.resendLink} disabled={true}>
            Resend Code (in 60s)
          </button>
        </form>
      </div>
    </>
  );
}
