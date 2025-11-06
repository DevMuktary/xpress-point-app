"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // For your logos
import styles from './page.module.css'; // This is the page-specific CSS

export default function DashboardPage() {
  
  // In the future, we will fetch this data
  const userName = "AgentName"; 
  const userBalance = "0.00";
  const isEmailVerified = false; 

  // --- UPDATED list of your services ---
  // Now includes all 8 services from your blueprint
  const services = [
    { name: 'NIN Services', logo: '/logos/nin.png', href: '/dashboard/services/nin' },
    { name: 'BVN Services', logo: '/logos/bvn.png', href: '#' },
    { name: 'JAMB Services', logo: '/logos/jamb.png', href: '#' },
    { name: 'JTB-TIN', logo: '/logos/tin.png', href: '#' },
    { name: 'Result Checker', logo: '/logos/waec.png', href: '#' },
    { name: 'CAC Services', logo: '/logos/cac.png', href: '#' },
    { name: 'VTU Services', logo: '/logos/vtu.png', href: '#' },
    { name: 'Newspaper', logo: '/logos/news.png', href: '#' },
  ];

  return (
    <div className={styles.pageContainer}>

      {/* --- Email Verification Alert --- */}
      {!isEmailVerified && (
        <div className={styles.alertCard}>
          <span>📧</span>
          <div>
            <strong>Verify Your Email</strong>
            <p>Please click the verification link sent to your email to unlock services.</p>
          </div>
          <button className={styles.resendButton}>Resend</button>
        </div>
      )}

      {/* --- New "App-Like" Wallet Card --- */}
      <div className={styles.walletCard}>
        <div className={styles.walletHeader}>
          <span className={styles.userName}>{userName}</span>
          <span className={styles.walletLabel}>Total Balance</span>
        </div>
        <h2 className={styles.walletBalance}>₦{userBalance}</h2>
        <Link href="/dashboard/fund-wallet" className={styles.fundButton}>
          <span>+</span> Fund Wallet
        </Link>
      </div>

      {/* --- "Our Services" Grid --- */}
      <h3 className={styles.sectionTitle}>Our Services</h3>
      <div className={styles.serviceGrid}>
        {services.map((service) => (
          <Link href={service.href} key={service.name} className={styles.serviceItem}>
            <div className={styles.serviceIconWrapper}>
              <Image 
                src={service.logo} 
                alt={`${service.name} Logo`} 
                width={40} 
                height={40}
                onError={(e) => e.currentTarget.src = "/logos/default.png"} // Fallback logo
              />
            </div>
            <span>{service.name}</span>
          </Link>
        ))}
      </div>
      
      {/* --- Quick History Section --- */}
      <h3 className={styles.sectionTitle}>Recent Spending</h3>
      <div className={styles.spendingCard}>
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
