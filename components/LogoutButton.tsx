"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftStartOnRectangleIcon } from '@heroicons/react/24/outline';

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      // Redirect to admin login and refresh
      router.push('/login-admin');
      router.refresh(); 
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
    >
      <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
      {isLoading ? 'Logging out...' : 'Logout'}
    </button>
  );
}
