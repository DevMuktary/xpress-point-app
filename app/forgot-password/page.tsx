"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LockClosedIcon, ArrowLeftIcon, CheckCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import Loading from '@/app/loading';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Request, 2: Verify & Reset
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }), // Sending email only
      });
      
      const data = await res.json();

      if (res.ok) {
        setStep(2);
        setMsg({ type: 'success', text: data.message || "OTP sent to your Email & WhatsApp." });
      } else {
        setMsg({ type: 'error', text: data.error || "Failed to send OTP." });
      }
    } catch (err) {
      setMsg({ type: 'error', text: "Connection error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: otp, newPassword }),
      });
      
      const data = await res.json();

      if (res.ok) {
        alert("Password Reset Successful! Please Login.");
        router.push('/login');
      } else {
        setMsg({ type: 'error', text: data.error || "Reset failed." });
      }
    } catch (err) {
      setMsg({ type: 'error', text: "Connection error." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {isLoading && <Loading />}
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <LockClosedIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 1 ? "Forgot Password?" : "Reset Password"}
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            {step === 1 
              ? "Enter your registered email address." 
              : "Enter the 6-digit code sent to your Email/WhatsApp."}
          </p>
        </div>

        {msg && (
           <div className={`mb-6 p-4 rounded-lg text-sm text-center font-medium flex items-center justify-center gap-2
             ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
             {msg.type === 'success' && <CheckCircleIcon className="h-5 w-5"/>}
             {msg.text}
           </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
            >
               Send Reset Code
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP Code</label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 shadow-sm text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-blue-500"
                maxLength={6}
                placeholder="000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
            >
               Update Password
            </button>
          </form>
        )}
        
        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <Link href="/login" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
             <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
