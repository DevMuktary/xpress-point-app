"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css'; // This is the page-specific CSS

export default function DashboardPage() {
  
  // Placeholder data
  const userName = "AgentName"; 
  const userBalance = "0.00";
  const isEmailVerified = false; 

  // --- UPDATED list of your services ---
  // Now includes descriptions and removed "More"
  const services = [
    { 
      name: 'NIN Services', 
      logo: '/logos/nin.png', 
      href: '/dashboard/services/nin',
      description: 'Verify NIN, print slips, and manage modifications.'
    },
    { 
      name: 'BVN Services', 
      logo: '/logos/bvn.png', 
      href: '#',
      description: 'Check BVN details, retrieve, and print verification.'
    },
    { 
      name: 'JAMB Services', 
      logo: '/logos/jamb.png', 
      href: '#',
      description: 'Print original results, admission letters, and more.'
    },
    { 
      name: 'JTB-TIN', 
      logo: '/logos/tin.png', 
      href: '#',
      description: 'Register and retrieve JTB-TIN certificates.'
    },
    { 
      name: 'Result Checker', 
      logo: '/logos/waec.png', 
      href: '#',
      description: 'Get WAEC, NECO, and NABTEB result pins.'
    },
    { 
      name: 'CAC Services', 
      logo: '/logos/cac.png', 
      href: '#',
      description: 'Register your business name with the CAC.'
    },
    { 
      name: 'VTU Services', 
      logo: '/logos/vtu.png', 
      href: '#',
      description: 'Buy airtime, data, and pay electricity bills.'
    },
    { 
      name: 'Newspaper', 
      logo: '/logos/news.png', 
      href: '#',
      description: 'Publish change of name and other notices.'
    },
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

      {/* --- "App-Like" Wallet Card --- */}
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
                width={36} 
                height={36}
                onError={(e) => e.currentTarget.src = "/logos/default.png"} // Fallback
              />
            </div>
            <div className={styles.serviceText}>
              <strong>{service.name}</strong>
              <p className={styles.serviceDescription}>{service.description}</p>
            </div>
          </Link>
        ))}
      </div>
      
      {/* --- Quick History Section --- */}
      <h3 className={styles.sectionTitle}>Recent Spending</h3>
      <div className={styles.spendingCard}>
        <ul className={styles.spendingList}>
          <li className={styles.spendingItemEmpty}>
            Your recent wallet transactions will appear here.
          </li>
        </ul>
      </div>

    </div>
  );
}
