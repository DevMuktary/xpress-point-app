import React from 'react';
import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth';
import AdminHeader from '@/components/AdminHeader'; // We will create this

// This is a Server Component that acts as a security firewall
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  // --- CRITICAL SECURITY CHECK ---
  const user = await getUserFromSession();

  if (!user || user.role !== 'ADMIN') {
    // If user is not an admin, send them to the admin login page
    redirect('/admin/login?error=Access+Denied');
  }
  // --------------------------------
  
  // If they are an Admin, show the layout
  return (
    <div className="min-h-screen bg-gray-100">
      {/* We will add a sidebar later */}
      <div className="flex flex-col">
        <AdminHeader user={user} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
