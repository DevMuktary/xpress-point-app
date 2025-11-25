"use client";

import React, { useState, useMemo } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  CheckBadgeIcon, 
  XCircleIcon,
  WalletIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

// Define the type based on the serialized data we sent
type SerializedUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  isIdentityVerified: boolean;
  createdAt: string;
  walletBalance: string;
  commissionBalance: string;
  aggregatorName: string | null;
  businessName: string | null;
};

export default function AdminUsersClientPage({ initialUsers }: { initialUsers: SerializedUser[] }) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL'); // 'ALL', 'AGENT', 'AGGREGATOR'

  // --- Filtering Logic ---
  const filteredUsers = useMemo(() => {
    return initialUsers.filter(user => {
      // 1. Search Filter
      const searchString = `${user.firstName} ${user.lastName} ${user.email} ${user.phoneNumber}`.toLowerCase();
      const matchesSearch = searchString.includes(searchTerm.toLowerCase());

      // 2. Role Filter
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [initialUsers, searchTerm, roleFilter]);

  // --- Format Currency ---
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(amount));
  };

  return (
    <div className="space-y-6">
      
      {/* --- 1. Controls Toolbar --- */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-xl border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl self-start md:self-center">
          {['ALL', 'AGENT', 'AGGREGATOR'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all
                ${roleFilter === role 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {role === 'ALL' ? 'All Users' : role}s
            </button>
          ))}
        </div>
      </div>

      {/* --- 2. Users Table --- */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role & Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Balances</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Relationships</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                  
                  {/* User Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{user.firstName} {user.lastName}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">{user.phoneNumber}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role & Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role === 'AGGREGATOR' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                        {user.role}
                      </span>
                      {user.isIdentityVerified ? (
                         <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                           <CheckBadgeIcon className="h-4 w-4" /> Verified
                         </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                           <XCircleIcon className="h-4 w-4" /> Unverified
                         </span>
                      )}
                    </div>
                  </td>

                  {/* Balances */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium flex items-center gap-1">
                      <WalletIcon className="h-4 w-4 text-gray-400" />
                      {formatCurrency(user.walletBalance)}
                    </div>
                    {user.role === 'AGGREGATOR' && (
                       <div className="text-xs text-purple-600 font-medium mt-1">
                         Comm: {formatCurrency(user.commissionBalance)}
                       </div>
                    )}
                  </td>

                  {/* Relationships */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {user.role === 'AGGREGATOR' ? (
                        <div className="flex items-center gap-1">
                          <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-700">{user.businessName || 'No Business Name'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-xs">Upline: </span>
                          <span className="font-medium text-gray-700">{user.aggregatorName || 'None'}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Joined Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-gray-500 bg-gray-50">
              <UserIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p>No users found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-right text-xs text-gray-400 px-2">
        Showing {filteredUsers.length} result(s)
      </div>
    </div>
  );
}
