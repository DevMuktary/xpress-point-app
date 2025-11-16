import React from 'react';
import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth';
import AdminHeader from '@/components/AdminHeader';
import { headers } from 'next/headers'; // Import headers to read the URL

// This is a Server Component that acts as a security firewall
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  // --- THIS IS THE FIX ---
  // We need to find out what page the user is *currently* on.
  const headersList = headers();
  const pathname = headersList.get('x-next-pathname') || '';

  // If the user is on the login page, DO NOTHING.
  // Let them see the page.
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }
  // -------------------------
  
  // --- CRITICAL SECURITY CHECK (for all other admin pages) ---
  const user = await getUserFromSession();

  if (!user || user.role !== 'ADMIN') {
    // If user is not an admin, send them to the admin login page
    redirect('/admin/login?error=Access+Denied');
  }
  // --------------------------------
  
  // If they ARE an Admin and NOT on the login page, show the layout
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
