"use client";

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css'; // We'll create this file next

export default function DashboardPage() {
  
  // In the future, we will fetch user data here.
  // For now, we'll use a placeholder name.
  const userName = "Agent"; 
  const userBalance = "0.00";
  const isEmailVerified = false; // We'll pretend email is not verified

  return (
    <div className={styles.gridContainer}>

      {/* --- Email Verification Alert --- */}
      {!isEmailVerified && (
        <div className={styles.alertCard}>
          <span>📧</span>
          <div>
            <strong>Verify Your Email</strong>
            <p>To use services, please click the verification link we sent to your email.</p>
          </div>
          <button className={styles.resendButton}>Resend Email</button>
        </div>
      )}

      {/* --- Welcome & Wallet Card --- */}
      <div className={styles.welcomeCard}>
        <h2>Welcome, {userName}!</h2>
        <div className={styles.walletInfo}>
          <p>Wallet Balance</p>
          <h3>₦{userBalance}</h3>
        </div>
        <Link href="/dashboard/fund-wallet" className={styles.fundButton}>
          Fund Wallet
        </Link>
      </div>

      {/* --- Services Grid --- */}
      <div className={styles.servicesCard}>
        <h3>Our Services</h3>
        <div className={styles.serviceGrid}>
          {/* We'll just put NIN for now as a placeholder */}
          <Link href="/dashboard/services/nin" className={styles.serviceItem}>
            <div className={styles.serviceIcon}>[NIN]</div>
            <p>NIN Services</p>
          </Link>
          <div className={styles.serviceItem}>
            <div className={styles.serviceIcon}>[BVN]</div>
            <p>BVN Services</p>
          </div>
          <div className={styles.serviceItem}>
            <div className={styles.serviceIcon}>[JAMB]</div>
            <p>JAMB Services</p>
          </div>
        </div>
      </div>

      {/* --- Service History Hub (as planned) --- */}
      <div className={styles.historyHubCard}>
        <h3>Service History</h3>
        <Link href="/dashboard/history/nin" className={styles.historyLink}>
          View NIN History →
        </Link>
        <Link href="/dashboard/history/bvn" className={styles.historyLink}>
          View BVN History →
        </Link>
      </div>

      {/* --- Recent Spending (as planned) --- */}
      <div className={styles.spendingCard}>
        <h3>Recent Spending</h3>
        <ul className={styles.spendingList}>
          {/* Placeholder for when it's empty */}
          <li className={styles.spendingItemEmpty}>
            Your recent wallet transactions will appear here.
          </li>
        </ul>
      </div>

    </div>
  );
}
