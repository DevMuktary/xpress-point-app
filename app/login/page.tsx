"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Loading from '@/app/loading';
import { EyeIcon, EyeSlashIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); 
  
  // --- Form States ---
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  // --- UI States ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // --- Check for URL Errors ---
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(urlError.replace(/\+/g, ' ')); 
    }
  }, [searchParams]);

  // --- Form Submission Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier, // <--- FIXED: Mapped to 'identifier' for backend compatibility
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      // Redirect to dashboard
      window.location.href = '/dashboard';

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
          {/* Header */}
          <div>
            <h1 className="text-center text-3xl font-bold text-gray-900">
              XPRESS POINT
            </h1>
            <h2 className="mt-2 text-center text-lg text-gray-600">
              Sign in to your Agent account
            </h2>
          </div>

          {/* --- Error Message Display --- */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <InformationCircleIcon className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form 
            className="mt-8 space-y-6 rounded-2xl bg-white p-8 shadow-xl" 
            onSubmit={handleSubmit}
          >
            <div className="space-y-4">
              {/* Email or Phone Input */}
              <div>
                <label htmlFor="login-id" className="block text-sm font-medium text-gray-700">
                  Email or Phone Number
                </label>
                <div className="mt-1">
                  <input
                    id="login-id"
                    name="login-id"
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-lg shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-lg shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
            
            {/* Link to Sign Up */}
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Create one now
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
