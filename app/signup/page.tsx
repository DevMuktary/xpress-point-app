"use client";

import React, { useState, useMemo, useEffect } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import Loading from '@/app/loading';
import Link from 'next/link';

// --- NEW IMPORTS for Phone Input ---
import 'react-phone-number-input/style.css'; 
import PhoneInput from 'react-phone-number-input';
import { E164Number } from 'libphonenumber-js/core';

// --- ICONS ---
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

type StrengthChecks = {
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  isLengthOk: boolean;
};

export default function SignUpPage() {
  const router = useRouter(); 
  
  // --- CSS Flash Fix ---
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // --- Form States ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState<E164Number | undefined>();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  
  // --- UI States ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- Password Validation ---
  const strengthChecks: StrengthChecks = useMemo(() => {
    return {
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSymbol: /[^A-Za-z0-9]/.test(password),
      isLengthOk: password.length >= 8,
    };
  }, [password]);

  const isPasswordStrong = Object.values(strengthChecks).every(Boolean);

  const passwordsMatch = useMemo(() => {
    if (confirmPassword.length === 0) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  // --- Submit Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreed) {
      setError("Please agree to the Terms of Service.");
      return;
    }
    if (!phoneNumber) {
      setError("Please enter your WhatsApp phone number.");
      return;
    }
    if (!isPasswordStrong) {
      setError("Please ensure your password meets all the requirements.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

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
          phone: phoneNumber, 
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');

      router.push(`/verify-otp?phone=${encodeURIComponent(phoneNumber)}`);

    } catch (err: any) {
      setError(err.message);
      setIsLoading(false); 
    }
  };
  
  const renderChecklistItem = (text: string, isValid: boolean) => (
    <li className={`${styles.checklistItem} ${isValid ? styles.valid : styles.invalid}`}>
      {text}
    </li>
  );

  // Prevent FOUC (Flash of Unstyled Content)
  if (!mounted) return null;

  return (
    <>
      {isLoading && <Loading />}
    
      <div className={styles.container}>
        <h1 className={styles.title}>Create Your Agent Account</h1>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          
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
            <label htmlFor="phone" className={styles.label}>WhatsApp Phone Number</label>
            <PhoneInput
              id="phone"
              international
              defaultCountry="NG" 
              value={phoneNumber}
              onChange={setPhoneNumber}
              className={styles.phoneInput}
              inputClassName={styles.PhoneInputInput}
              countrySelectProps={{ className: styles.PhoneInputCountry }}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Create Password</label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`${styles.input} ${styles.passwordInput}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" className={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {password.length > 0 && (
              <ul className={styles.passwordChecklist}>
                {renderChecklistItem("At least 8 characters", strengthChecks.isLengthOk)}
                {renderChecklistItem("One lowercase letter (a-z)", strengthChecks.hasLower)}
                {renderChecklistItem("One uppercase letter (A-Z)", strengthChecks.hasUpper)}
                {renderChecklistItem("One number (0-9)", strengthChecks.hasNumber)}
                {renderChecklistItem("One symbol (#,$,!, etc)", strengthChecks.hasSymbol)}
              </ul>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
            <div className={styles.passwordWrapper}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className={`${styles.input} ${styles.passwordInput}`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="button" className={styles.eyeIcon} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {passwordsMatch === true && (
              <p className={`${styles.matchMessage} ${styles.match}`}>✔ Passwords match</p>
            )}
            {passwordsMatch === false && (
              <p className={`${styles.matchMessage} ${styles.noMatch}`}>✖ Passwords do not match</p>
            )}
          </div>

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
          
          {error && (
            <p style={{ color: '#e74c3c', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600' }}>{error}</p>
          )}
          
          <button type="submit" className={styles.button} disabled={isLoading || !agreed || !isPasswordStrong || !passwordsMatch}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* --- ADDED LOGIN LINK --- */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
            Have an account?{' '}
            <Link href="/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
              Login
            </Link>
          </div>

        </form>
      </div>
    </>
  );
}
