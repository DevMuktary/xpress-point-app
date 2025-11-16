import React from 'react';
import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  UsersIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// --- Stat Card Component ---
// This component now has the layout you requested:
// Number on the Left, Icon on the Right.
const StatCard = ({ title, value, icon: Icon, color }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) => (
  <div className="rounded-2xl bg-white p-6 shadow-lg">
    <div className="flex items-center justify-between">
      {/* Left Side: Number and Title */}
      <div className="space-y-1">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-500">{title}</p>
      </div>
      {/* Right Side: Icon */}
      <div className={`rounded-full p-3 ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);


// This is the Server Component
export default async function AdminDashboardPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login-admin');
  }

  // Fetch all stats in parallel
  const [totalUsers, totalAggregators, pendingPayouts] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'AGGREGATOR' } }),
    prisma.withdrawalRequest.count({ where: { status: 'PENDING' } })
  ]);

  // Main Admin Tools Navigation
  const adminTools = [
    {
      title: "Manage Manual Requests",
      description: "Approve or reject NIN, BVN, CAC, and other pending requests.",
      href: "/admin/requests",
      logo: ClockIcon,
      color: "text-yellow-600"
    },
    {
      title: "Manage Payouts",
      description: "Process pending withdrawal requests from your Aggregators.",
      href: "/admin/payouts",
      logo: BanknotesIcon,
      color: "text-green-600"
    },
    {
      title: "Manage Users",
      description: "View, search, and manage all users and agents on the platform.",
      href: "/admin/users",
      logo: UserGroupIcon,
      color: "text-blue-600"
    },
    {
      title: "Service Pricing",
      description: "Set the default agent price for all services on the platform.",
      href: "/admin/pricing/services",
      logo: CurrencyDollarIcon,
      color: "text-indigo-600"
    },
    {
      title: "Aggregator Commissions",
      description: "Set the specific commission each aggregator earns per service.",
      href: "/admin/pricing/commissions",
      logo: ShieldCheckIcon,
      color: "text-purple-600"
    },
    {
      title: "Transaction Log",
      description: "View a complete log of all transactions across the platform.",
      href: "/admin/transactions",
      logo: DocumentTextIcon,
      color: "text-gray-600"
    },
  ];

  return (
    // This 'max-w-7xl' ensures the page is stable and aligns with the header
    <div className="w-full max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Welcome, {user.firstName}!
      </h1>
      
      {/* --- Stat Cards (New Design) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={totalUsers} 
          icon={UsersIcon} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Total Aggregators" 
          value={totalAggregators} 
          icon={ShieldCheckIcon} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Pending Payouts" 
          value={pendingPayouts} 
          icon={BanknotesIcon} 
          color={pendingPayouts > 0 ? "bg-red-500" : "bg-green-500"} 
        />
      </div>
      
      {/* --- Main Navigation Cards (Using the History Page Design) --- */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Admin Tools
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminTools.map((tool) => (
          <Link
            key={tool.title}
            href={tool.href}
            className="group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-lg 
                       transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div>
              {/* This is the card design from the User History page */}
              <tool.logo className={`h-10 w-10 ${tool.color}`} />
              <h3 className="mt-4 text-lg font-bold text-gray-900">{tool.title}</h3>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">{tool.description}</p>
            </div>
            <div className="mt-6">
              <span 
                className={`inline-block rounded-lg ${tool.color.replace('text', 'bg').replace('600', '100')} px-4 py-2 text-sm font-medium ${tool.color}
                           transition-all group-hover:bg-opacity-0 ${tool.color.replace('text', 'hover:bg')}`}
              >
                Open Tool →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
