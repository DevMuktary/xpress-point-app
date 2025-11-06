"use client"; // We need state for the mobile sidebar

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

// --- Define Icons (Placeholders) ---
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

  const isActive = (path: string) => pathname === path;

  // This is the actual sidebar content, shared by mobile and desktop
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
          onClick={() => setIsSidebarOpen(false)} // Close on click
        >
          <IconDashboard /> Dashboard
        </Link>
        <Link
          href="/dashboard/fund-wallet"
          className={`${styles.navLink} ${isActive('/dashboard/fund-wallet') ? styles.active : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        >
          <IconWallet /> Fund Wallet
        </Link>
        
        {/* Placeholder for future accordion menu */}
        <div className={styles.navLink}>
          <IconServices /> Services
        </div>

        <Link
          href="/dashboard/history"
          className={`${styles.navLink} ${isActive('/dashboard/history') ? styles.active : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        >
          <IconHistory /> Transaction History
        </Link>
        <Link
          href="/dashboard/profile"
          className={`${styles.navLink} ${isActive('/dashboard/profile') ? styles.active : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        >
          <IconProfile /> Profile Settings
        </Link>
      </nav>
      <div className={styles.sidebarFooter}>
        <Link href="/dashboard/upgrade" className={styles.upgradeButton}>
          <IconUpgrade /> Upgrade to Aggregator
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
