"use client"; // This component needs to be a client component for form state

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/app/loading'; // Use our global loader
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  
  // --- Form States ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // --- UI States ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Form Submission Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // We call the new, "unprotected" API route
      const response = await fetch('/api/auth/login-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please try again.');
      }

      // Success! Send to the admin dashboard (which will be a 404 for now)
      router.push('/admin/dashboard');

    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loading />}
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          
          <div>
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Home
            </Link>
            <h1 className="mt-4 text-center text-3xl font-bold text-gray-900">
              Admin Login
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              Access the Xpress Point Power House
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-100 p-4 text-center text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <form 
            className="mt-8 space-y-6 rounded-2xl bg-white p-8 shadow-xl" 
            onSubmit={handleSubmit}
          >
            <div className="space-y-4">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email" name="email" type="email"
                    value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-lg shadow-sm"
                  />
                </div>
              </div>
              
              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password" name="password"
                    type="password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-lg shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
