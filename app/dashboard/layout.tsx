"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // To highlight the active link
import styles from './layout.module.css';

// --- Define Icons (Placeholders) ---
// We'll use simple text for icons for now.
const IconDashboard = () => <span>🏠</span>;
const IconServices = () => <span>⚙️</span>;
const IconWallet = () => <span>💰</span>;
const IconHistory = () => <span>🕒</span>;
const IconProfile = () => <span>👤</span>;
const IconUpgrade = () => <span>🚀</span>;
// -----------------------------------

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // Get the current URL path

  // A helper function to check if a link is active
  const isActive = (path: string) => pathname === path;

  // --- Main Sidebar for Desktop ---
  const DesktopSidebar = () => (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <Link href="/dashboard" className={styles.logo}>
          XPRESS POINT
        </Link>
      </div>
      <nav className={styles.sidebarNav}>
        <Link 
          href="/dashboard" 
          className={`${styles.navLink} ${isActive('/dashboard') ? styles.active : ''}`}
        >
          <IconDashboard /> Dashboard
        </Link>
        <Link 
          href="/dashboard/fund-wallet" 
          className={`${styles.navLink} ${isActive('/dashboard/fund-wallet') ? styles.active : ''}`}
        >
          <IconWallet /> Fund Wallet
        </Link>
        <Link 
          href="/dashboard/services" 
          className={`${styles.navLink} ${isActive('/dashboard/services') ? styles.active : ''}`}
        >
          <IconServices /> Services
        </Link>
        <Link 
          href="/dashboard/history" 
          className={`${styles.navLink} ${isActive('/dashboard/history') ? styles.active : ''}`}
        >
          <IconHistory /> History
        </Link>
        <Link 
          href="/dashboard/profile" 
          className={`${styles.navLink} ${isActive('/dashboard/profile') ? styles.active : ''}`}
        >
          <IconProfile /> Profile
        </Link>
      </nav>
      <div className={styles.sidebarFooter}>
        <Link href="/dashboard/upgrade" className={styles.upgradeButton}>
          <IconUpgrade /> Upgrade to Aggregator
        </Link>
      </div>
    </aside>
  );

  // --- Bottom Navigation Bar for Mobile ---
  const MobileBottomNav = () => (
    <nav className={styles.bottomNav}>
      <Link 
        href="/dashboard" 
        className={`${styles.bottomNavLink} ${isActive('/dashboard') ? styles.active : ''}`}
      >
        <IconDashboard />
        <span>Dashboard</span>
      </Link>
      <Link 
        href="/dashboard/services" 
        className={`${styles.bottomNavLink} ${isActive('/dashboard/services') ? styles.active : ''}`}
      >
        <IconServices />
        <span>Services</span>
      </Link>
      <Link 
        href="/dashboard/fund-wallet" 
        className={`${styles.bottomNavLink} ${isActive('/dashboard/fund-wallet') ? styles.active : ''}`}
      >
        <IconWallet />
        <span>Wallet</span>
      </Link>
      <Link 
        href="/dashboard/history" 
        className={`${styles.bottomNavLink} ${isActive('/dashboard/history') ? styles.active : ''}`}
      >
        <IconHistory />
        <span>History</span>
      </Link>
    </nav>
  );

  return (
    <div className={styles.dashboardContainer}>
      <DesktopSidebar />
      <main className={styles.mainContent}>
        {children} {/* This is where the page.tsx will be rendered */}
      </main>
      <MobileBottomNav />
    </div>
  );
}
