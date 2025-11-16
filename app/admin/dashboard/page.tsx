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
  CogIcon,
  WalletIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// This is the new component for the top stat cards
// It follows your layout: Number on Left, Icon on Right.
const StatCard = ({ title, value, icon: Icon, color }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) => (
  <div className="rounded-2xl bg-white p-6 shadow-lg">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-500">{title}</p>
      </div>
      <div className={`rounded-full p-3 ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

// This is the new component for the main navigation cards
// It has a cleaner design with a colored header.
const AdminToolCard = ({ title, description, href, logo: Icon, color }: {
  title: string;
  description: string;
  href: string;
  logo: React.ElementType;
  color: string;
}) => (
  <Link
    href={href}
    className="group block rounded-2xl bg-white shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
  >
    {/* Colored Header */}
    <div className={`flex items-center gap-4 p-4 ${color}`}>
      <Icon className="h-8 w-8 text-white" />
      <h3 className="text-lg font-bold text-white">{title}</h3>
    </div>
    {/* Description Content */}
    <div className="p-4">
      <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
    </div>
  </Link>
);


// This is the Server Component to fetch stats
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
      color: "bg-yellow-500"
    },
    {
      title: "Manage Payouts",
      description: "Process pending withdrawal requests from your Aggregators.",
      href: "/admin/payouts",
      logo: BanknotesIcon,
      color: "bg-green-500"
    },
    {
      title: "Manage Users",
      description: "View, search, and manage all users and agents on the platform.",
      href: "/admin/users",
      logo: UserGroupIcon,
      color: "bg-blue-500"
    },
    {
      title: "Service Pricing",
      description: "Set the default agent price for all services on the platform.",
      href: "/admin/pricing/services",
      logo: CurrencyDollarIcon,
      color: "bg-indigo-500"
    },
    {
      title: "Aggregator Commissions",
      description: "Set the specific commission each aggregator earns per service.",
      href: "/admin/pricing/commissions",
      logo: ShieldCheckIcon,
      color: "bg-purple-500"
    },
    {
      title: "Transaction Log",
      description: "View a complete log of all transactions across the platform.",
      href: "/admin/transactions",
      logo: DocumentTextIcon,
      color: "bg-gray-500"
    },
  ];

  return (
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
      
      {/* --- Main Navigation Cards (New Design) --- */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Admin Tools
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminTools.map((tool) => (
          <AdminToolCard
            key={tool.title}
            title={tool.title}
            description={tool.description}
            href={tool.href}
            logo={tool.logo}
            color={tool.color}
          />
        ))}
      </div>
    </div>
  );
}
