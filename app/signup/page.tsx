"use client";

import React, { useState } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation'; // Import the router
import Loading from '@/app/loading'; // Import your global loader

export default function SignUpPage() {
  const router = useRouter(); // Initialize the router
  
  // --- State Hooks ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  
  // --- New States for API Interaction ---
  const [isLoading, setIsLoading] = useState(false); // For the loading spinner
  const [error, setError] = useState<string | null>(null); // For error messages

  // --- Form Submission Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreed) {
      setError("Please agree to the Terms of Service.");
      return;
    }

    // 1. Show the global loader
    setIsLoading(true);
    setError(null);

    // 2. Send data to our new API endpoint
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          businessName,
          address,
          email,
          phoneNumber,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If API returns an error (like "Email already in use")
        throw new Error(data.error || 'Something went wrong');
      }

      // 3. Success! Redirect to the OTP page.
      // We will create this page next.
      router.push(`/verify-otp?phone=${phoneNumber}`);

    } catch (err: any) {
      // 4. Handle errors
      setError(err.message);
    } finally {
      // 5. Hide the loader
      setIsLoading(false);
    }
  };

  // --- JSX (The HTML part) ---
  return (
    <>
      {/* This will show your global rolling logo when loading */}
      {isLoading && <Loading />}
    
      <div className={styles.container}>
        <h1 className={styles.title}>Create Your Agent Account</h1>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          
          {/* ... (all your formGroup inputs for name, address, etc. are unchanged) ... */}
          
          <div className={styles.formGroup}>
            <label htmlFor="firstName" className={styles.label}>First Name</label>
            <input id="firstName" type="text" className={styles.input} value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="lastName" className={styles.label}>Last Name</label>
            <input id="lastName" type="text" className={styles.input} value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="businessName" className={styles.label}>Business Name</label>
            <input id="businessName" type="text" className={styles.input} value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="address" className={styles.label}>Business Address</label>
            <input id="address" type="text" className={styles.input} value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input id="email" type="email" className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.label}>WhatsApp Phone Number (+234...)</label>
            <input id="phone" type="tel" className={styles.input} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Create Password</label>
            <input id="password" type="password" className={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className={styles.terms}>
            <input id="terms" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <label htmlFor="terms">
              By signing up, you agree to our <a>Terms of Service</a>.
            </label>
          </div>
          
          {/* Display error messages */}
          {error && (
            <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
          )}
          
          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

        </form>
      </div>
    </>
  );
}
