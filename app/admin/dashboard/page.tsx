*import React from 'react';
import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Decimal } from '@prisma/client/runtime/library';
import {
  UsersIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

// --- Stat Card Component ---
const StatCard = ({ title, value, icon: Icon, color, href }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  href?: string;
}) => {
  const content = (
    <div className={`group flex flex-col items-center justify-center rounded-2xl 
               p-6 text-center text-white shadow-lg transition-all 
               hover:shadow-xl hover:-translate-y-1 ${color} h-full`}>
      <Icon className="h-10 w-10" />
      <p className="mt-4 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm font-medium opacity-90">{title}</p>
    </div>
  );

  return href ? <Link href={href} className="block h-full">{content}</Link> : <div className="h-full">{content}</div>;
};

export default async function AdminDashboardPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login-admin');
  }

  // 1. Fetch User & Payout Stats
  const [totalAgents, totalAggregators, pendingPayouts] = await Promise.all([
    prisma.user.count({ where: { role: 'AGENT' } }),
    prisma.user.count({ where: { role: 'AGGREGATOR' } }),
    prisma.withdrawalRequest.count({ where: { status: 'PENDING' } })
  ]);

  // 2. Fetch Transaction Stats for Profit Calculation
  // We fetch 'SERVICE_CHARGE' transactions that are 'COMPLETED'
  const transactions = await prisma.transaction.findMany({
    where: {
      type: 'SERVICE_CHARGE',
      status: 'COMPLETED',
      serviceId: { not: null } // Must be linked to a service
    },
    select: {
      amount: true,
      service: {
        select: {
          platformPrice: true,
          defaultAgentPrice: true
        }
      }
    }
  });

  // 3. Fetch Job Counts (Manual Requests)
  // We sum up pending counts from all tables (Simplified for performance: Checking main ones)
  const [ninPending, bvnPending, cacPending, tinPending, jambPending, totalSuccessful] = await Promise.all([
    prisma.modificationRequest.count({ where: { status: 'PENDING' } }),
    prisma.bvnRequest.count({ where: { status: 'PENDING' } }),
    prisma.cacRequest.count({ where: { status: 'PENDING' } }),
    prisma.tinRequest.count({ where: { status: 'PENDING' } }),
    prisma.jambRequest.count({ where: { status: 'PENDING' } }),
    prisma.transaction.count({ where: { status: 'COMPLETED', type: 'SERVICE_CHARGE' } })
  ]);

  const totalPendingJobs = ninPending + bvnPending + cacPending + tinPending + jambPending;

  // 4. Calculate Profit
  // Logic: Sum of (Transaction Amount (Revenue) - Service Platform Price (Cost))
  // Note: Transaction amount is stored as negative for charges, so we use absolute value.
  let totalProfit = new Decimal(0);
  let totalRevenue = new Decimal(0);

  for (const tx of transactions) {
    if (tx.service) {
      const revenue = tx.amount.abs(); // What agent paid (e.g. 1000)
      const cost = tx.service.platformPrice; // What it costs you (e.g. 700)
      const profit = revenue.minus(cost); // 300

      totalRevenue = totalRevenue.plus(revenue);
      totalProfit = totalProfit.plus(profit);
    }
  }

  // Main Admin Tools Navigation
  const adminTools = [
    {
      title: "Manage Requests",
      description: "Approve or reject NIN, BVN, CAC, and other pending requests.",
      href: "/admin/requests",
      logo: ClockIcon,
      color: "text-yellow-600"
    },
    {
      title: "Manage Payouts",
      description: "Process pending withdrawal requests.",
      href: "/admin/payouts",
      logo: BanknotesIcon,
      color: "text-green-600"
    },
    {
      title: "Manage Users",
      description: "View, search, fund, and suspend users.",
      href: "/admin/users",
      logo: UserGroupIcon,
      color: "text-blue-600"
    },
    {
      title: "Service Pricing",
      description: "Set prices and toggle availability.",
      href: "/admin/pricing/services",
      logo: CurrencyDollarIcon,
      color: "text-indigo-600"
    },
    {
      title: "Commissions",
      description: "Set global commissions for aggregators.",
      href: "/admin/pricing/commissions",
      logo: ShieldCheckIcon,
      color: "text-purple-600"
    },
    {
      title: "Transaction Log",
      description: "View all financial activities.",
      href: "/admin/transactions",
      logo: DocumentTextIcon,
      color: "text-gray-600"
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Admin Dashboard
      </h1>
      
      {/* --- Financial Stats Row --- */}
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Financials</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Profit" 
          value={`₦${totalProfit.toNumber().toLocaleString()}`} 
          icon={ChartBarIcon} 
          color="bg-emerald-600" 
        />
        <StatCard 
          title="Total Revenue" 
          value={`₦${totalRevenue.toNumber().toLocaleString()}`} 
          icon={CurrencyDollarIcon} 
          color="bg-blue-600" 
        />
        <StatCard 
          title="Pending Payouts" 
          value={pendingPayouts} 
          icon={BanknotesIcon} 
          color={pendingPayouts > 0 ? "bg-red-500" : "bg-green-500"}
          href="/admin/payouts"
        />
         <StatCard 
          title="Total Successful Jobs" 
          value={totalSuccessful.toLocaleString()} 
          icon={CheckCircleIcon} 
          color="bg-teal-500" 
        />
      </div>

      {/* --- Operational Stats Row --- */}
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Operations</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Pending Manual Jobs" 
          value={totalPendingJobs} 
          icon={ClockIcon} 
          color={totalPendingJobs > 0 ? "bg-orange-500" : "bg-gray-400"}
          href="/admin/requests"
        />
        <StatCard 
          title="Total Agents" 
          value={totalAgents} 
          icon={UsersIcon} 
          color="bg-indigo-500" 
          href="/admin/users?role=AGENT"
        />
        <StatCard 
          title="Total Aggregators" 
          value={totalAggregators} 
          icon={ShieldCheckIcon} 
          color="bg-purple-500"
          href="/admin/users?role=AGGREGATOR"
        />
      </div>
      
      {/* --- Tools Grid --- */}
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Access</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminTools.map((tool) => (
          <Link
            key={tool.title}
            href={tool.href}
            className="group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-lg 
                       transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100"
          >
            <div>
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
}*
