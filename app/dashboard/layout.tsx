import React from 'react';
import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth';
import DashboardClientContainer from '@/components/DashboardClientContainer';

// We get the "world-class" URL from your Railway variables
const APP_URL = process.env.APP_URL;

if (!APP_URL) {
  console.error("CRITICAL: APP_URL is not set in environment variables!");
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromSession();
  
  if (!user) {
    // Redirect logic using the absolute URL
    const loginUrl = new URL('/login?error=Please+login+to+continue', APP_URL || 'http://localhost:3000');
    redirect(loginUrl.toString());
  }

  return (
    <DashboardClientContainer user={user}>
      {children}
    </DashboardClientContainer>
  );
}
