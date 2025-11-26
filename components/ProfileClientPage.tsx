"use client";

import React, { useState } from 'react';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  ShieldCheckIcon, 
  CreditCardIcon, 
  KeyIcon, 
  ClockIcon, 
  CheckBadgeIcon, 
  BuildingLibraryIcon, 
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import SafeImage from '@/components/SafeImage';

type Props = {
  user: any;
  walletBalance: number;
  commissionBalance: number;
  totalTransactions: number;
};

const InfoCard = ({ label, value, icon: Icon, copyable = false }: any) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all">
      <div className="p-2 bg-white rounded-lg border border-gray-100 text-gray-400">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-sm font-semibold text-gray-900 truncate">{value || 'N/A'}</p>
          {copyable && value && (
            <button 
              onClick={handleCopy}
              className="text-gray-400 hover:text-blue-600 transition-colors"
              title="Copy"
            >
              {copied ? <CheckBadgeIcon className="h-4 w-4 text-green-500" /> : <DocumentDuplicateIcon className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ProfileClientPage({ user, walletBalance, commissionBalance, totalTransactions }: Props) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SECURITY'>('OVERVIEW');

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      
      {/* --- 1. Profile Header Card --- */}
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-blue-800" />
        
        <div className="relative px-6 pt-16 pb-6">
          <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center">
                {user.image ? (
                  <SafeImage 
                    src={user.image} 
                    alt="Profile" 
                    width={96} 
                    height={96} 
                    className="object-cover" 
                    fallbackSrc="/logos/default.png"
                  />
                ) : (
                  <UserCircleIcon className="h-20 w-20 text-gray-300" />
                )}
              </div>
              {user.isIdentityVerified && (
                <div className="absolute bottom-1 right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white" title="Verified Account">
                  <CheckBadgeIcon className="h-4 w-4" />
                </div>
              )}
            </div>

            <div className="flex-1 mb-2 w-full">
              {/* FIX: Name scaling for mobile */}
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 break-words leading-tight">
                {user.firstName} {user.lastName}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <EnvelopeIcon className="h-4 w-4" />
                  {user.email}
                </span>
                <span className="hidden md:inline text-gray-300">|</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${user.role === 'AGGREGATOR' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex px-6 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'OVERVIEW' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('SECURITY')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'SECURITY' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Security & Login
          </button>
        </div>
      </div>

      {/* --- 2. Tab Content --- */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard label="First Name" value={user.firstName} icon={UserCircleIcon} />
                <InfoCard label="Last Name" value={user.lastName} icon={UserCircleIcon} />
                <InfoCard label="Email Address" value={user.email} icon={EnvelopeIcon} />
                <InfoCard label="Phone Number" value={user.phoneNumber || 'Not Set'} icon={PhoneIcon} />
                <InfoCard label="User ID" value={user.id} icon={ShieldCheckIcon} copyable />
                <InfoCard label="Member Since" value={joinDate} icon={ClockIcon} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Financial Overview</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Main Wallet Balance</p>
                  <p className="text-2xl font-bold mt-1">₦{walletBalance.toLocaleString()}</p>
                </div>
                
                {user.role === 'AGGREGATOR' && (
                   <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-purple-900">
                    <p className="text-xs text-purple-600 uppercase tracking-wide font-bold">Commission Balance</p>
                    <p className="text-2xl font-bold mt-1">₦{commissionBalance.toLocaleString()}</p>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <CreditCardIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Total Transactions</p>
                      <p className="text-xs text-gray-500">Successful Only</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-gray-900">{totalTransactions}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'SECURITY' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 max-w-2xl">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Security Settings</h3>
          <div className="space-y-6">
            <div className="pb-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                   <div className="p-2 bg-gray-100 text-gray-600 rounded-lg h-fit">
                      <KeyIcon className="h-6 w-6" />
                   </div>
                   <div>
                     <p className="font-semibold text-gray-900">Password</p>
                     <p className="text-sm text-gray-500 mt-1">Last changed: Never</p>
                   </div>
                </div>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Update</button>
              </div>
            </div>
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                 <div className="p-2 bg-gray-100 text-gray-600 rounded-lg h-fit">
                    <BuildingLibraryIcon className="h-6 w-6" />
                 </div>
                 <div>
                   <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                   <p className="text-sm text-gray-500 mt-1">Add an extra layer of security.</p>
                 </div>
              </div>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Enable</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
