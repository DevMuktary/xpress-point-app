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
  DocumentTextIcon,
  WrenchScrewdriverIcon // Imported for the new tool
} from '@heroicons/react/24/outline';

// --- Quick Action Stat Card ---
const StatCard = ({ title, value, icon: Icon, color, href }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  href: string;
}) => (
  <Link
    href={href}
    className={`group flex flex-col items-center justify-center rounded-2xl 
               p-6 text-center text-white shadow-lg transition-all 
               hover:shadow-xl hover:-translate-y-1 ${color}`}
  >
    <Icon className="h-10 w-10" />
    <p className="mt-4 text-3xl font-bold">{value}</p>
    <p className="mt-1 text-sm font-medium">{title}</p>
  </Link>
);

// --- Admin Tool Card ---
const ToolCard = ({ tool }: { tool: any }) => (
  <Link
    href={tool.href}
    className="group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm border border-gray-100
               transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-200"
  >
    <div>
      <div className={`p-3 rounded-xl w-fit ${tool.bg} ${tool.color}`}>
        <tool.logo className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
        {tool.title}
      </h3>
      <p className="mt-1 text-sm text-gray-500 leading-relaxed">
        {tool.description}
      </p>
    </div>
    <div className="mt-6 pt-4 border-t border-gray-50">
      <span className="text-sm font-semibold text-blue-600 flex items-center gap-2 group-hover:gap-3 transition-all">
        Open Tool <span>→</span>
      </span>
    </div>
  </Link>
);

export default async function AdminDashboardPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login-admin');
  }

  // Fetch stats
  const [totalAgents, totalAggregators, pendingPayouts] = await Promise.all([
    prisma.user.count({ where: { role: 'AGENT' } }),
    prisma.user.count({ where: { role: 'AGGREGATOR' } }),
    prisma.withdrawalRequest.count({ where: { status: 'PENDING' } })
  ]);

  // Admin Tools Configuration
  const adminTools = [
    {
      title: "Request Manager",
      description: "Process manual requests for NIN, BVN, CAC, etc.",
      href: "/admin/requests",
      logo: ClockIcon,
      color: "text-yellow-700",
      bg: "bg-yellow-50"
    },
    {
      title: "User Operations", // <--- NEW CARD
      description: "Search users to Fund Wallet, Block, or Unblock accounts.",
      href: "/admin/users/manage",
      logo: WrenchScrewdriverIcon,
      color: "text-red-600",
      bg: "bg-red-50"
    },
    {
      title: "Payout Requests",
      description: "View and process pending withdrawal requests.",
      href: "/admin/payouts",
      logo: BanknotesIcon,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "User List",
      description: "View database of all registered Agents and Aggregators.",
      href: "/admin/users",
      logo: UserGroupIcon,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Service Pricing",
      description: "Set default agent prices for services.",
      href: "/admin/pricing/services",
      logo: CurrencyDollarIcon,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      title: "Commissions",
      description: "Manage global commission rates for aggregators.",
      href: "/admin/pricing/commissions",
      logo: ShieldCheckIcon,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "Transaction Log",
      description: "Audit financial records and service history.",
      href: "/admin/transactions",
      logo: DocumentTextIcon,
      color: "text-gray-600",
      bg: "bg-gray-50"
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto pb-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Dashboard
      </h1>
      <p className="text-gray-500 mb-8">Welcome back, {user.firstName}. Here is your overview.</p>
      
      {/* --- Stat Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard 
          title="Total Agents" 
          value={totalAgents} 
          icon={UsersIcon} 
          color="bg-gradient-to-br from-blue-500 to-blue-600" 
          href="/admin/users?role=AGENT"
        />
        <StatCard 
          title="Total Aggregators" 
          value={totalAggregators} 
          icon={ShieldCheckIcon} 
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          href="/admin/users?role=AGGREGATOR"
        />
        <StatCard 
          title="Pending Payouts" 
          value={pendingPayouts} 
          icon={BanknotesIcon} 
          color={pendingPayouts > 0 ? "bg-gradient-to-br from-red-500 to-red-600" : "bg-gradient-to-br from-green-500 to-green-600"}
          href="/admin/payouts"
        />
      </div>
      
      {/* --- Tools Grid --- */}
      <h2 className="text-xl font-bold text-gray-900 mb-5 border-b border-gray-200 pb-2">
        Administration Tools
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {adminTools.map((tool) => (
          <ToolCard key={tool.title} tool={tool} />
        ))}
      </div>
    </div>
  );
}
