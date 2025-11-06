"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

// --- REMOVED Emojis ---

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // --- NEW: State to manage the accordion ---
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const isActive = (path: string) => pathname === path;

  // --- NEW: Function to toggle the accordion ---
  const toggleCategory = (category: string) => {
    if (openCategory === category) {
      setOpenCategory(null); // Close it if it's already open
    } else {
      setOpenCategory(category); // Open the new one
    }
  };

  // This is the actual sidebar content
  const SidebarContent = () => (
    <>
      <div className={styles.sidebarHeader}>
        <Link href="/dashboard" className={styles.logo}>
          XPRESS POINT
        </Link>
      </div>
      <nav className={styles.sidebarNav}>
        {/* --- Standard Links --- */}
        <Link
          href="/dashboard"
          className={`${styles.navLink} ${isActive('/dashboard') ? styles.active : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/fund-wallet"
          className={`${styles.navLink} ${isActive('/dashboard/fund-wallet') ? styles.active : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        >
          Fund Wallet
        </Link>

        {/* --- NEW: Unclickable Category Title --- */}
        <span className={styles.categoryTitle}>All Services</span>

        {/* --- NEW: Accordion for NIN Services --- */}
        <button 
          className={`${styles.navLink} ${styles.accordionButton} ${openCategory === 'nin' ? styles.open : ''}`}
          onClick={() => toggleCategory('nin')}
        >
          NIN Services
        </button>
        {openCategory === 'nin' && (
          <div className={styles.subLinkContainer}>
            <Link href="/dashboard/services/nin-verification" className={styles.subLink}>NIN Verification</Link>
            <Link href="/dashboard/services/ipe-clearance" className={styles.subLink}>IPE Clearance</Link>
            {/* Add other NIN sub-links here */}
          </div>
        )}

        {/* --- NEW: Accordion for BVN Services --- */}
        <button 
          className={`${styles.navLink} ${styles.accordionButton} ${openCategory === 'bvn' ? styles.open : ''}`}
          onClick={() => toggleCategory('bvn')}
        >
          BVN Services
        </button>
        {openCategory === 'bvn' && (
          <div className={styles.subLinkContainer}>
            <Link href="/dashboard/services/bvn-verification" className={styles.subLink}>BVN Verification</Link>
            {/* Add other BVN sub-links here */}
          </div>
        )}
        
        {/* (Add other service categories here in the same way) */}

        {/* --- Standard Links --- */}
        <Link
          href="/dashboard/history"
          className={`${styles.navLink} ${isActive('/dashboard/history') ? styles.active : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        >
          Transaction History
        </Link>
        <Link
          href="/dashboard/profile"
          className={`${styles.navLink} ${isActive('/dashboard/profile') ? styles.active : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        >
          Profile Settings
        </Link>
      </nav>
      <div className={styles.sidebarFooter}>
        <Link href="/dashboard/upgrade" className={styles.upgradeButton}>
          Upgrade to Aggregator
        </Link>
      </div>
    </>
  );

  return (
    <div className={styles.dashboardContainer}>
      {/* --- Mobile Header (Fixed Top) --- */}
      <header className={styles.mobileHeader}>
        <Link href="/dashboard" className={styles.logo}>
          XPRESS POINT
        </Link>
        <button
          className={styles.menuButton}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? '✕' : '☰'} {/* Removed Icon Components */}
        </button>
      </header>

      {/* --- Desktop Sidebar (Fixed Left) --- */}
      <aside className={styles.sidebar}>
        <SidebarContent />
      </aside>

      {/* --- Mobile Sidebar (Slide-in) --- */}
      {isSidebarOpen && (
        <div 
          className={styles.mobileSidebarOverlay} 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}
      <aside className={`${styles.mobileSidebar} ${isSidebarOpen ? styles.mobileSidebarOpen : ''}`}>
        <SidebarContent />
      </aside>

      {/* --- Main Page Content --- */}
      <main className={styles.mainContent}>
        {children} {/* This is where the page.tsx will be rendered */}
      </main>
    </div>
  );
}
