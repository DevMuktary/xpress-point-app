import React from 'react';
import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth';
import DashboardClientContainer from '@/components/DashboardClientContainer';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromSession();
  
  if (!user) {
    // --- THIS IS THE FIX ---
    // We "refurbish" the redirect to send your "world-class" message
    redirect('/login?error=Please+login+to+continue');
    // -----------------------
  }

  return (
    <DashboardClientContainer user={user}>
      {children}
    </DashboardClientContainer>
  );
}
