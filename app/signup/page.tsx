// This "use client" directive is ESSENTIAL
// It tells Next.js this is an interactive page (a form), not a static page.
"use client";

import React, { useState } from 'react';
import styles from './page.module.css'; // We import our new styles

export default function SignUpPage() {
  // --- State Hooks ---
  // We use state to store what the user types in each field
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  
  // --- Form Submission Handler ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevents the page from reloading
    
    // Check if terms are agreed
    if (!agreed) {
      alert("Please agree to the Terms of Service.");
      return;
    }
    
    // For now, we'll just log the data to the console
    // Later, we will send this data to our API
    console.log({
      firstName,
      lastName,
      businessName,
      address,
      email,
      phoneNumber,
      password
    });

    // Here we will trigger the "global rolling logo"
    alert("Form submitted! (Next step: Call API)");
  };

  // --- JSX (The HTML part) ---
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create Your Agent Account</h1>
      
      <form className={styles.form} onSubmit={handleSubmit}>
        
        <div className={styles.formGroup}>
          <label htmlFor="firstName" className={styles.label}>First Name</label>
          <input
            id="firstName"
            type="text"
            className={styles.input}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="lastName" className={styles.label}>Last Name</label>
          <input
            id="lastName"
            type="text"
            className={styles.input}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="businessName" className={styles.label}>Business Name</label>
          <input
            id="businessName"
            type="text"
            className={styles.input}
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="address" className={styles.label}>Business Address</label>
          <input
            id="address"
            type="text"
            className={styles.input}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>Email Address</label>
          <input
            id="email"
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone" className={styles.label}>WhatsApp Phone Number (+234...)</label>
          <input
            id="phone"
            type="tel"
            className={styles.input}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>

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
        </div>

        <div className={styles.terms}>
          <input
            id="terms"
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <label htmlFor="terms">
            By signing up, you agree to our <a>Terms of Service</a>.
          </label>
        </div>
        
        <button type="submit" className={styles.button}>
          Create Account
        </button>

      </form>
    </div>
  );
}
