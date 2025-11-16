import React from 'react';
import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth';
import AdminHeader from '@/components/AdminHeader';

// This is a Server Component that acts as a security firewall
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  // --- THIS IS THE FIX (Part 2) ---
  // The login page is no longer in this folder,
  // so this code is now 100% safe.
  
  const user = await getUserFromSession();

  // If user is not an admin, send them to the NEW admin login page
  if (!user || user.role !== 'ADMIN') {
    redirect('/login-admin?error=Access+Denied');
  }
  // --------------------------------
  
  // If they are an Admin, show the layout
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col">
        <AdminHeader user={user} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
