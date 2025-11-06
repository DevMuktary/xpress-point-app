"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

// --- (SVG Icons would go here, using text for now) ---
const IconDashboard = () => <span>🏠</span>;
const IconWallet = () => <span>💰</span>;
const IconServices = () => <span>⚙️</span>;
const IconHistory = () => <span>🕒</span>;
const IconProfile = () => <span>👤</span>;
const IconUpgrade = () => <span>🚀</span>;
const IconMenu = () => <span>☰</span>;
const IconClose = () => <span>✕</span>;
// -----------------------------------

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const isActive = (path: string) => pathname === path;

  const toggleCategory = (category: string) => {
    setOpenCategory(openCategory === category ? null : category);
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

        <span className={styles.categoryTitle}>All Services</span>

        {/* Accordion for NIN Services */}
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
          </div>
        )}

        {/* Accordion for BVN Services */}
        <button
          className={`${styles.navLink} ${styles.accordionButton} ${openCategory === 'bvn' ? styles.open : ''}`}
          onClick={() => toggleCategory('bvn')}
        >
          BVN Services
        </button>
        {openCategory === 'bvn' && (
          <div className={styles.subLinkContainer}>
            <Link href="/dashboard/services/bvn-verification" className={styles.subLink}>BVN Verification</Link>
          </div>
        )}

        {/* (Add other service categories here) */}

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
          {isSidebarOpen ? <IconClose /> : <IconMenu />}
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
