import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminUsersClientPage from '@/components/AdminUsersClientPage';

export default async function AdminUsersPage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login-admin?error=Access+Denied');
  }

  // 1. Fetch ONLY AGENTS and sort by their balance
  const users = await prisma.user.findMany({
    where: {
      role: 'AGENT' // <--- CRITICAL FIX: Only fetch Agents
    },
    orderBy: {
      wallet: {
        balance: 'desc' // Now this sorts the AGENTS by their balance
      }
    },
    include: {
      wallet: true,
      aggregator: {
        select: {
          firstName: true,
          lastName: true,
          businessName: true
        }
      },
      _count: {
        select: { agents: true }
      }
    }
  });

  // 2. Serialize Data
  const serializedUsers = users.map(u => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phoneNumber: u.phoneNumber,
    role: u.role,
    isIdentityVerified: u.isIdentityVerified,
    createdAt: u.createdAt.toISOString(),
    walletBalance: u.wallet?.balance.toString() || "0.00",
    commissionBalance: u.wallet?.commissionBalance.toString() || "0.00",
    aggregatorName: u.aggregator 
      ? `${u.aggregator.firstName} ${u.aggregator.lastName}` 
      : null,
    businessName: u.businessName,
    agentCount: u._count.agents
  }));

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
          <UserGroupIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Management</h1>
          <p className="text-sm text-gray-500">View and manage Agents (Sorted by Highest Balance).</p>
        </div>
      </div>

      {/* Client Component */}
      <AdminUsersClientPage initialUsers={serializedUsers} />
    </div>
  );
}
