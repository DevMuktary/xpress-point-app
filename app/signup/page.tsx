"use client";

import React, { useState, useMemo } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import Loading from '@/app/loading';
import Link from 'next/link';

// A helper type for our strength checks
type StrengthChecks = {
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  isLengthOk: boolean;
};

export default function SignUpPage() {
  const router = useRouter(); 
  
  // --- Form States ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  
  // --- UI States ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- Real-time Password Strength Validation ---
  const strengthChecks: StrengthChecks = useMemo(() => {
    return {
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSymbol: /[^A-Za-z0-9]/.test(password),
      isLengthOk: password.length >= 8,
    };
  }, [password]);

  // Check if all rules are met
  const isPasswordStrong = Object.values(strengthChecks).every(Boolean);

  // --- Real-time Password Match Validation ---
  const passwordsMatch = useMemo(() => {
    // Only show match status if confirmPassword is not empty
    if (confirmPassword.length === 0) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  // --- Form Submission Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // --- Final Validation on Submit ---
    if (!agreed) {
      setError("Please agree to the Terms of Service.");
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
    // ------------------------------------

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
      setIsLoading(false); 
    }
  };
  
  // Helper to render checklist items with correct style
  const renderChecklistItem = (text: string, isValid: boolean) => (
    <li className={`${styles.checklistItem} ${isValid ? styles.valid : styles.invalid}`}>
      {text}
    </li>
  );

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
            <label htmlFor="phone" className={styles.label}>WhatsApp Phone Number (+234...)</label>
            <input id="phone" type="tel" className={styles.input} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
          </div>

          {/* --- NEW Password with Icon --- */}
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
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {/* Real-time Checklist */}
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
          
          {/* --- NEW Confirm Password with Icon --- */}
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
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {/* Real-time Match Message */}
            {passwordsMatch === true && (
              <p className={`${styles.matchMessage} ${styles.match}`}>✔ Passwords match</p>
            )}
            {passwordsMatch === false && (
              <p className={`${styles.matchMessage} ${styles.noMatch}`}>✖ Passwords do not match</p>
            )}
          </div>

          {/* --- THIS IS THE CORRECTED LINE --- */}
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
            <p style={{ color: '#e74c3c', textAlign: 'center' }}>{error}</p>
          )}
          
          <button type="submit" className={styles.button} disabled={isLoading || !agreed || !isPasswordStrong || !passwordsMatch}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

        </form>
      </div>
    </>
  );
}
