"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loading from '@/app/loading';
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

// --- THIS IS THE "WORLD-CLASS" FIX (Part 1) ---
import PhoneInput from 'react-phone-number-input/input';
// We import the *type* from the main package
import { E164Number } from 'react-phone-number-input'; 
// ---------------------------------------------

// --- "World-Class" Refurbish (Part 1) ---
// Add new "stunning" props for the Aggregator
type Props = {
  aggregatorId?: string;
  aggregatorName?: string;
};

export default function SignupClientPage({ aggregatorId, aggregatorName }: Props) {
// -----------------------------------------

  const router = useRouter();
  
  // --- Form States ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState<E164Number | string>(''); // Use the correct type
  const [password, setPassword] = useState('');
  
  // --- UI States ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // --- Form Submission Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
          aggregatorId: aggregatorId || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      // "Stunning" success! Send to the OTP page
      router.push(`/verify-otp?phone=${encodeURIComponent(phone)}`);

    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loading />}
      
      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-center text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Sign Up Form */}
      <form 
        className="mt-8 space-y-6 rounded-2xl bg-white p-8 shadow-xl" 
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <div className="mt-1">
                <input
                  id="first-name" name="first-name" type="text"
                  value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-lg shadow-sm"
                />
              </div>
            </div>
            {/* Last Name */}
            <div>
              <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <div className="mt-1">
                <input
                  id="last-name" name="last-name" type="text"
                  value={lastName} onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-lg shadow-sm"
                />
              </div>
            </div>
          </div>
          
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
          
          {/* Phone Input */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="mt-1">
              {/* --- THIS IS THE "WORLD-CLASS" FIX (Part 2) --- */}
              <PhoneInput
                id="phone"
                name="phone"
                country="NG"
                value={phone}
                onChange={(value: E164Number | undefined) => setPhone(value || '')}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-lg shadow-sm"
              />
              {/* ------------------------------------- */}
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
                type={showPassword ? "text" : "password"}
                value={password} onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-lg shadow-sm"
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
            className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>
        
        {/* Link to Sign In */}
        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </div>
      </form>
    </>
  );
}
