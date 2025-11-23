import React from 'react';
import { getUserFromSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';

// This is a SERVER component. It fetches data.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromSession();

  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* We pass the userRole to the Client Sidebar.
        This allows the Sidebar to conditionally render 
        "Upgrade" vs "Aggregator Tools" instantly.
      */}
      <DashboardSidebar userRole={user.role} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
