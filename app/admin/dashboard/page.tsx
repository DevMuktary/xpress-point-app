import React from 'react';
import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// This is a Server Component to fetch stats
export default async function AdminDashboardPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/admin/login');
  }

  // We will add more stats here later
  const totalUsers = await prisma.user.count();
  const totalAggregators = await prisma.user.count({ where: { role: 'AGGREGATOR' } });

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Welcome, {user.firstName}!
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Users Card */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalUsers}</p>
        </div>
        
        {/* Total Aggregators Card */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Aggregators</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalAggregators}</p>
        </div>
        
        {/* Pending Requests Card (Placeholder) */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Pending Payouts</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>
      </div>
      
      {/* We will add a table of recent activities here later */}
      
    </div>
  );
}
