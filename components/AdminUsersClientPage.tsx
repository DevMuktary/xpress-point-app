"use client";

import React, { useState, useMemo } from 'react';
import { 
  MagnifyingGlassIcon, 
  CheckBadgeIcon, 
  XCircleIcon,
  WalletIcon,
  UserIcon,
  BuildingOfficeIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

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
  agentCount: number; // <--- NEW FIELD
};

export default function AdminUsersClientPage({ initialUsers }: { initialUsers: SerializedUser[] }) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const filteredUsers = useMemo(() => {
    return initialUsers.filter(user => {
      const searchString = `${user.firstName} ${user.lastName} ${user.email} ${user.phoneNumber}`.toLowerCase();
      const matchesSearch = searchString.includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [initialUsers, searchTerm, roleFilter]);

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(amount));
  };

  return (
    <div className="space-y-6">
      
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-xl border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5"
          />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl self-start md:self-center">
          {['ALL', 'AGENT', 'AGGREGATOR'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all
                ${roleFilter === role ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {role === 'ALL' ? 'All Users' : role}s
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role === 'AGGREGATOR' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                        {user.role}
                      </span>
                      {/* --- AGENT COUNT BADGE --- */}
                      {user.role === 'AGGREGATOR' && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                          <UsersIcon className="h-3 w-3" /> {user.agentCount} Agents
                        </span>
                      )}
                      {/* ------------------------- */}
                    </div>
                  </td>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
