import React from 'react';
import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth';
import DashboardClientContainer from '@/components/DashboardClientContainer';

// --- THIS IS THE FIX (Part 1) ---
// We get the "world-class" URL from your Railway variables
const APP_URL = process.env.APP_URL;

if (!APP_URL) {
  console.error("CRITICAL: APP_URL is not set in environment variables!");
}
// ------------------------------

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromSession();
  
  if (!user) {
    // --- THIS IS THE FIX (Part 2) ---
    // We "refurbish" the redirect to use the full, absolute URL.
    const loginUrl = new URL('/login?error=Please+login+to+continue', APP_URL);
    redirect(loginUrl.toString());
    // -----------------------
  }

  return (
    <DashboardClientContainer user={user}>
      {children}
    </DashboardClientContainer>
  );
}
