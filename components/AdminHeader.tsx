import React from 'react';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton'; // We will create this

// This is a simple header component
export default function AdminHeader({ user }: { user: any }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto flex h-16 max-w-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-lg font-bold text-blue-600">
            XPRESS POINT ADMIN
          </Link>
          {/* We will add navigation links here */}
          <nav className="hidden md:flex gap-4">
            <Link href="/admin/dashboard" className="text-sm font-medium text-gray-700 hover:text-blue-600">Dashboard</Link>
            {/* Add more links later */}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">
            {user.email}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
