"use client"; // Sidebars are interactive, so this is a client component

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './layout.module.css'; // We will create this CSS file next

// --- Define Icons (You can replace these with better SVG icons later) ---
const IconDashboard = () => <span>🏠</span>;
const IconWallet = () => <span>💰</span>;
const IconServices = () => <span>⚙️</span>;
const IconHistory = () => <span>🕒</span>;
const IconProfile = () => <span>👤</span>;
const IconUpgrade = () => <span>🚀</span>;
const IconMenu = () => <span>☰</span>;
const IconClose = () => <span>✕</span>;
// --------------------------------------------------------------------

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // This is the sidebar component itself
  const SidebarContent = () => (
    <nav className={styles.sidebarNav}>
      <Link href="/dashboard" className={styles.navLink}>
        <IconDashboard /> Dashboard
      </Link>
      <Link href="/dashboard/fund-wallet" className={styles.navLink}>
        <IconWallet /> Fund Wallet
      </Link>
      
      {/* This is a placeholder for the accordion menu we planned */}
      <div className={styles.navLink}>
        <IconServices /> Services
      </div>
      
      <Link href="/dashboard/history" className={styles.navLink}>
        <IconHistory /> Transaction History
      </Link>
      <Link href="/dashboard/profile" className={styles.navLink}>
        <IconProfile /> Profile Settings
      </Link>
      
      {/* This is the key upgrade button */}
      <div className={styles.upgradeButtonWrapper}>
        <Link href="/dashboard/upgrade" className={styles.upgradeButton}>
          <IconUpgrade /> Upgrade to Aggregator
        </Link>
      </div>
    </nav>
  );

  return (
    <div className={styles.dashboardContainer}>
      {/* --- Mobile Header --- */}
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

      {/* --- Sidebar (Desktop) --- */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/dashboard" className={styles.logo}>
            XPRESS POINT
          </Link>
        </div>
        <SidebarContent />
      </aside>
      
      {/* --- Mobile Sidebar (Overlay) --- */}
      {isSidebarOpen && (
        <div className={styles.mobileSidebarOverlay} onClick={() => setIsSidebarOpen(false)}>
          <aside className={styles.mobileSidebar} onClick={(e) => e.stopPropagation()}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* --- Main Page Content --- */}
      <main className={styles.mainContent}>
        {children} {/* This is where the page.tsx will be rendered */}
      </main>
    </div>
  );
}
