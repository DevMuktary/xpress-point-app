import React from 'react';
import Link from 'next/link';
import { WrenchScrewdriverIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Icon */}
        <div className="mx-auto h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center">
          <WrenchScrewdriverIcon className="h-10 w-10 text-blue-600" />
        </div>

        {/* Text */}
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Registration Paused
          </h2>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            We are currently upgrading our systems to serve you better.
            <br />
            <span className="font-bold text-blue-600">We are working to bring back registration shortly.</span>
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-4">
          <Link 
            href="/login"
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
          >
            Login to Existing Account
          </Link>
          
          <Link 
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
