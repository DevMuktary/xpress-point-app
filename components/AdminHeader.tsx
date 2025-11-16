import React from 'react';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';

export default function AdminHeader({ user }: { user: any }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 w-full">
      {/* This container fixes the alignment. 
        It now has 'max-w-7xl' and 'mx-auto' to match the dashboard page.
      */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Side */}
        <div className="flex items-center gap-6">
          <Link href="/admin/dashboard" className="text-lg font-bold text-blue-600">
            XPRESS POINT ADMIN
          </Link>
          <nav className="hidden md:flex gap-4">
            <Link href="/admin/dashboard" className="text-sm font-medium text-gray-700 hover:text-blue-600">Dashboard</Link>
            {/* We will add more links here, like 'Manage Users' */}
          </nav>
        </div>
        
        {/* Right Side */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {user.email}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
