"use client";

import React, { useState, useMemo } from 'react'; // Added useMemo
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import Loading from '@/app/loading';
import Link from 'next/link'; // <-- Import the Link component

export default function SignUpPage() {
  const router = useRouter(); 
  
  // --- State Hooks ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  
  // --- NEW STATES you requested ---
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- NEW Password Strength Logic ---
  const passwordStrength = useMemo(() => {
    let score = 0;
    if (password.length === 0) return { text: '', className: '' };
    if (password.length > 7) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { text: 'Weak', className: 'weak' };
    if (score <= 2) return { text: 'Medium', className: 'medium' };
    return { text: 'Strong', className: 'strong' };
  }, [password]);

  // --- Form Submission Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    // --- NEW Validation Checks ---
    if (!agreed) {
      setError("Please agree to the Terms of Service.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (passwordStrength.className !== 'strong' && passwordStrength.className !== 'medium') {
      setError("Password is too weak. Please add numbers, symbols, or uppercase letters.");
      return;
    }
    // ----------------------------

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      if (!response.ok) throw new Error(data.error || 'Something went wrong');

      // Success! Redirect to the OTP page.
      router.push(`/verify-otp?phone=${phoneNumber}`);

    } catch (err: any) {
      setError(err.message);
      setIsLoading(false); // Stop loading only on error
    } 
    // On success, we don't set loading to false because we are navigating away.
  };

  return (
    <>
      {isLoading && <Loading />}
    
      <div className={styles.container}>
        <h1 className={styles.title}>Create Your Agent Account</h1>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          
          {/* ... (First Name, Last Name, Business, Address, Email, Phone are unchanged) ... */}
          <div className={styles.formGroup}>
            <label htmlFor="firstName" className={styles.label}>First Name</label>
            <input id="firstName" type="text" className={styles.input} value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="lastName" className={styles.label}>Last Name</label>
            <input id="lastName" type="text" className={styles.input} value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="businessName" className={styles.label}>Business Name (Optional)</label>
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

          {/* --- UPDATED PASSWORD SECTION --- */}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Create Password</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/* The new strength bar */}
            {password.length > 0 && (
              <div className={styles.passwordStrength}>
                <div className={styles.strengthBar}>
                  <div className={`${styles.strengthBarInner} ${styles[passwordStrength.className]}`}></div>
                </div>
                <span className={styles.strengthText}>{passwordStrength.text}</span>
              </div>
            )}
          </div>
          
          {/* --- NEW CONFIRM PASSWORD FIELD --- */}
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* --- UPDATED TERMS OF SERVICE LINK --- */}
          <div className={styles.terms}>
            <input
              id="terms"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <label htmlFor="terms">
              I agree to the <Link href="/terms">Terms of Service</Link>.
            </label>
          </div>
          
          {/* Display error messages */}
          {error && (
            <p style={{ color: '#e74c3c', textAlign: 'center' }}>{error}</p>
          )}
          
          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

        </form>
      </div>
    </>
  );
}
