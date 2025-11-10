"use client"; // This component is interactive

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClockIcon, ArrowUpCircleIcon, BuildingStorefrontIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Role } from '@prisma/client'; // Import the Role enum from Prisma

// Define the props
type QuickActionsProps = {
  userRole: Role; // Pass the user's role from the server
};

export default function QuickActions({ userRole }: QuickActionsProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // This is the "smart" click handler
  const handleAggregatorClick = () => {
    if (userRole === 'AGGREGATOR') {
      // If they are an Aggregator, go to the tools page
      router.push('/dashboard/aggregator-tools'); // We will build this page later
    } else {
      // If they are an Agent, show the upgrade modal
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {/* --- ROW 2: QUICK ACTIONS --- */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Quick Actions
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {/* 1. History Button */}
          <Link
            href="/dashboard/history"
            className="flex transform flex-col items-center justify-center rounded-2xl 
                       bg-white p-6 shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <ClockIcon className="h-6 w-6 text-gray-600" />
            </div>
            <span className="mt-3 text-sm text-center font-semibold text-gray-900">
              History
            </span>
          </Link>

          {/* 2. Upgrade Button */}
          <Link
            href="/dashboard/upgrade"
            className="flex transform flex-col items-center justify-center rounded-2xl 
                       bg-white p-6 shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <ArrowUpCircleIcon className="h-6 w-6 text-blue-600" />
            </div>
            <span className="mt-3 text-sm text-center font-semibold text-gray-900">
              Upgrade
            </span>
          </Link>

          {/* 3. Aggregator Tools Button (Smart) */}
          <button
            onClick={handleAggregatorClick}
            className="flex transform flex-col items-center justify-center rounded-2xl 
                       bg-white p-6 shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <BuildingStorefrontIcon className="h-6 w-6 text-blue-600" />
            </div>
            <span className="mt-3 text-sm text-center font-semibold text-gray-900">
              Aggregator Tools
            </span>
          </button>
        </div>
      </div>

      {/* --- The "Upgrade" Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Upgrade Required
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <p className="text-center text-gray-600">
                You are not an aggregator. Please upgrade your account to access Aggregator Tools.
              </p>
            </div>
            
            {/* Modal Footer */}
            <div className="flex gap-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-2xl">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-lg bg-white py-2.5 px-4 text-sm font-semibold text-gray-800 border border-gray-300 transition-colors hover:bg-gray-100"
              >
                CANCEL
              </button>
              <Link
                href="/dashboard/upgrade"
                className="flex-1 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white text-center transition-colors hover:bg-blue-700"
              >
                UPGRADE NOW
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
