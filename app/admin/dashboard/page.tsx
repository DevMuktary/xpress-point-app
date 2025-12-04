import React from 'react';
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
  WalletIcon,
  WrenchScrewdriverIcon,
  MegaphoneIcon
} from '@heroicons/react/24/outline';

// --- Import the Chat Widget ---
import CommunityChat from '@/components/CommunityChat'; 

// --- Constants for Dynamic Fee Calculation ---
const DOB_GAP_FEE_MEDIUM = new Decimal(35000);
const DOB_GAP_FEE_HIGH = new Decimal(45000);
const NO_DOB_GAP_BANKS = ['FCMB', 'First Bank', 'Keystone Bank'];

// --- Helper: Calculate Profit for a Single Request ---
// Returns the profit (Revenue - Commission - Cost)
const calculateRequestProfit = (req: any) => {
  // If the request model doesn't have a linked service (e.g. IPE, Delink), we return 0
  if (!req.service) return new Decimal(0);

  let price = new Decimal(req.service.defaultAgentPrice);
  const cost = new Decimal(req.service.platformPrice);
  let commission = new Decimal(0);

  // 1. Handle Dynamic Pricing (Specifically BVN DOB)
  if (req.service.id.includes('BVN_MOD_DOB') && req.formData) {
    try {
      // Check if it's a BvnRequest with formData (User input)
      // We parse formData safely
      const data = typeof req.formData === 'string' ? JSON.parse(req.formData) : req.formData;
      const { oldDob, newDob, bankType } = data;

      if (oldDob && newDob) {
        const oldDate = new Date(oldDob);
        const newDate = new Date(newDob);
        const diffTime = Math.abs(newDate.getTime() - oldDate.getTime());
        const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);

        if (diffYears > 5) {
           // If bank is not in the exclusion list, add the fee
           if (!NO_DOB_GAP_BANKS.includes(bankType)) {
              if (diffYears > 10) {
                price = price.plus(DOB_GAP_FEE_HIGH);
              } else {
                price = price.plus(DOB_GAP_FEE_MEDIUM);
              }
           }
        }
      }
    } catch (e) {
      // If date parsing fails, ignore dynamic fee (fallback to base)
    }
  }

  // 2. Handle Aggregator Commission
  if (req.user?.role === 'AGGREGATOR') {
    // Check for specific aggregator price first
    const specificPrice = req.service.AggregatorPrice?.find((ap: any) => ap.aggregatorId === req.user?.id);
    if (specificPrice) {
      commission = new Decimal(specificPrice.commission);
    } else {
      commission = new Decimal(req.service.defaultCommission);
    }
  }

  // Profit = (Charged Price - Commission) - Platform Cost
  return price.minus(commission).minus(cost);
};

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
  if (!user || user.role !== 'ADMIN') {
    redirect('/login-admin');
  }

  // --- Date Logic for Monthly Profit ---
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // --- INCLUDE OBJECTS ---
  
  // 1. For models that HAVE a 'service' relation
  const requestIncludeService = {
    service: {
      include: {
        AggregatorPrice: true 
      }
    },
    user: {
      select: {
        id: true,
        role: true
      }
    }
  };

  // 2. For models that DO NOT have a 'service' relation (Ipe, Delink, Validation, Personalization)
  const requestIncludeUser = {
    user: {
      select: {
        id: true,
        role: true
      }
    }
  };

  // --- 1. Execute Main Queries ---
  const [
    totalAgents,
    totalAggregators,
    pendingPayouts,
    walletAggregate,
    
    // --- Monthly Completed Jobs (For Profit Calculation) ---
    // Models with 'service' relation:
    monthlyBvnReqs,
    monthlyModReqs, 
    monthlyCacReqs,
    monthlyTinReqs,
    monthlyJambReqs,
    monthlyResultReqs,
    monthlyNewsReqs,
    monthlyVtuReqs,
    monthlyExamReqs,
    monthlyNpcReqs,
    monthlyVninReqs,
    
    // Models WITHOUT 'service' relation:
    monthlyDelinkReqs,
    monthlyValReqs,
    monthlyIpeReqs,
    monthlyPersReqs,

    monthlyNinVerifications, // Instant verification via Transaction

    // --- Pending Counts (Lifetime) ---
    ninModPending, ninDelinkPending, bvnPending, cacPending, 
    tinPending, jambPending, resultPending, newspaperPending,
    
    // --- Completed Counts (Lifetime) ---
    ninModSuccess, ninDelinkSuccess, ninValSuccess, ipeSuccess, 
    persSuccess, bvnSuccess, cacSuccess, tinSuccess, 
    jambSuccess, resultSuccess, newspaperSuccess, vtuSuccess, examPinSuccess
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'AGENT' } }),
    prisma.user.count({ where: { role: 'AGGREGATOR' } }),
    prisma.withdrawalRequest.count({ where: { status: 'PENDING' } }),
    prisma.wallet.aggregate({ _sum: { balance: true } }),

    // --- COMPLETED REQUESTS (WITH SERVICE) ---
    prisma.bvnRequest.findMany({ where: { status: 'COMPLETED', updatedAt: { gte: firstDayOfMonth } }, include: requestIncludeService }),
    prisma.modificationRequest.findMany({ where: { status: 'COMPLETED', updatedAt: { gte: firstDayOfMonth } }, include: requestIncludeService }),
    prisma.cacRequest.findMany({ where: { status: 'COMPLETED', updatedAt: { gte: firstDayOfMonth } }, include: requestIncludeService }),
    prisma.tinRequest.findMany({ where: { status: 'COMPLETED', updatedAt: { gte: firstDayOfMonth } }, include: requestIncludeService }),
    prisma.jambRequest.findMany({ where: { status: 'COMPLETED', updatedAt: { gte: firstDayOfMonth } }, include: requestIncludeService }),
    prisma.resultRequest.findMany({ where: { status: 'COMPLETED', updatedAt: { gte: firstDayOfMonth } }, include: requestIncludeService }),
    prisma.newspaperRequest.findMany({ where: { status: 'COMPLETED', updatedAt: { gte: firstDayOfMonth } }, include: requestIncludeService }),
    // VTU & ExamPin use createdAt
    prisma.vtuRequest.findMany({ where: { status: 'COMPLETED', createdAt: { gte: firstDayOfMonth } }, include: requestIncludeService }),
    prisma.examPinRequest.findMany({ where: { status: 'COMPLETED', createdAt: { gte: firstDayOfMonth } }, include: requestIncludeService }),
    prisma.npcRequest.findMany({ where: { status: 'COMPLETED', updatedAt: { gte: firstDayOfMonth } }, include: requestIncludeService }),
    prisma.vninRequest.findMany({ where: { status: 'COMPLETED', updatedAt: { gte: firstDayOfMonth } }, include: requestIncludeService }),

    // --- COMPLETED REQUESTS (WITHOUT SERVICE) ---
    prisma.delinkRequest.findMany({ where: { status: 'COMPLETED', updatedAt: { gte: firstDayOfMonth } }, include: requestIncludeUser }),
    prisma.validationRequest.findMany({ where: { status: 'COMPLETED', updatedAt: { gte: firstDayOfMonth } }, include: requestIncludeUser }),
    prisma.ipeRequest.findMany({ where: { status: 'COMPLETED', updatedAt: { gte: firstDayOfMonth } }, include: requestIncludeUser }),
    prisma.personalizationRequest.findMany({ where: { status: 'COMPLETED', updatedAt: { gte: firstDayOfMonth } }, include: requestIncludeUser }),
    
    // For NIN Verification (Instant), we use Transactions
    prisma.transaction.findMany({
      where: {
        verificationId: { not: null }, 
        status: 'COMPLETED',
        createdAt: { gte: firstDayOfMonth }
      },
      include: {
        service: true
      }
    }),

    // --- PENDING COUNTS ---
    prisma.modificationRequest.count({ where: { status: 'PENDING' } }),
    prisma.delinkRequest.count({ where: { status: 'PENDING' } }),
    prisma.bvnRequest.count({ where: { status: 'PENDING' } }),
    prisma.cacRequest.count({ where: { status: 'PENDING' } }),
    prisma.tinRequest.count({ where: { status: 'PENDING' } }),
    prisma.jambRequest.count({ where: { status: 'PENDING' } }),
    prisma.resultRequest.count({ where: { status: 'PENDING' } }),
    prisma.newspaperRequest.count({ where: { status: 'PENDING' } }),

    // --- COMPLETED COUNTS (Lifetime) ---
    prisma.modificationRequest.count({ where: { status: 'COMPLETED' } }),
    prisma.delinkRequest.count({ where: { status: 'COMPLETED' } }),
    prisma.validationRequest.count({ where: { status: 'COMPLETED' } }),
    prisma.ipeRequest.count({ where: { status: 'COMPLETED' } }),
    prisma.personalizationRequest.count({ where: { status: 'COMPLETED' } }),
    prisma.bvnRequest.count({ where: { status: 'COMPLETED' } }),
    prisma.cacRequest.count({ where: { status: 'COMPLETED' } }),
    prisma.tinRequest.count({ where: { status: 'COMPLETED' } }),
    prisma.jambRequest.count({ where: { status: 'COMPLETED' } }),
    prisma.resultRequest.count({ where: { status: 'COMPLETED' } }),
    prisma.newspaperRequest.count({ where: { status: 'COMPLETED' } }),
    prisma.vtuRequest.count({ where: { status: 'COMPLETED' } }),
    prisma.examPinRequest.count({ where: { status: 'COMPLETED' } })
  ]);

  // --- 2. Calculations ---
  const totalPendingJobs = ninModPending + ninDelinkPending + bvnPending + cacPending + tinPending + jambPending + resultPending + newspaperPending;
  const totalSuccessful = ninModSuccess + ninDelinkSuccess + ninValSuccess + ipeSuccess + persSuccess + bvnSuccess + cacSuccess + tinSuccess + jambSuccess + resultSuccess + newspaperSuccess + vtuSuccess + examPinSuccess;

  // --- Calculate Monthly Profit (Based on Completed Jobs) ---
  let monthlyProfit = new Decimal(0);

  const allMonthlyCompleted = [
    ...monthlyBvnReqs, ...monthlyModReqs, ...monthlyCacReqs, ...monthlyTinReqs,
    ...monthlyJambReqs, ...monthlyResultReqs, ...monthlyNewsReqs, ...monthlyVtuReqs,
    ...monthlyExamReqs, ...monthlyNpcReqs, ...monthlyVninReqs,
    // These will return 0 profit because they have no linked service in DB
    ...monthlyDelinkReqs, ...monthlyValReqs, ...monthlyIpeReqs, ...monthlyPersReqs
  ];

  // Process Requests
  allMonthlyCompleted.forEach(req => {
    monthlyProfit = monthlyProfit.plus(calculateRequestProfit(req));
  });

  // Process Instant Verifications (Transaction based)
  monthlyNinVerifications.forEach(tx => {
    if (tx.service) {
      const revenue = tx.amount.abs();
      const cost = tx.service.platformPrice;
      // Note: Assuming no commission logic for instant verifications for now
      monthlyProfit = monthlyProfit.plus(revenue.minus(cost));
    }
  });


  const totalUserFunds = walletAggregate._sum.balance || new Decimal(0);

  // --- 3. Admin Tools Configuration ---
  const adminTools = [
    {
      title: "Broadcast Message",
      description: "Send email notifications to all users.",
      href: "/admin/broadcast",
      logo: MegaphoneIcon,
      color: "text-red-600"
    },
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
      title: "User Operations", 
      description: "Search specific users to Fund Wallet or Block Account.",
      href: "/admin/users/manage",
      logo: WrenchScrewdriverIcon,
      color: "text-slate-700"
    },
    {
      title: "View All Users",
      description: "See a list of all Agents and Aggregators.",
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
      description: "View all financial activities across the platform.",
      href: "/admin/transactions",
      logo: DocumentTextIcon,
      color: "text-gray-600"
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto relative">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Admin Dashboard
      </h1>
      
      {/* --- Financial Stats Row --- */}
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Financial Overview (Current Month)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Monthly Profit" 
          value={`₦${monthlyProfit.toNumber().toLocaleString()}`} 
          icon={ChartBarIcon} 
          color="bg-emerald-600" 
        />
        <StatCard 
          title="Total User Funds" 
          value={`₦${totalUserFunds.toNumber().toLocaleString()}`} 
          icon={WalletIcon} 
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

      {/* --- ADMIN COMMUNITY CHAT WIDGET --- */}
      <CommunityChat currentUser={user} />
      
    </div>
  );
}
