import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, UsersIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AgentsClientPage from '@/components/AgentsClientPage'; 

export default async function MyAgentsPage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'AGGREGATOR') {
    redirect('/dashboard');
  }

  // 1. Get all agents linked to this Aggregator
  // SORTED BY WALLET BALANCE (DESCENDING)
  const agents = await prisma.user.findMany({
    where: { 
      aggregatorId: user.id 
    },
    orderBy: { 
      wallet: {
        balance: 'desc' // <--- Key Change: Sort by Wallet Balance
      }
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      createdAt: true,
      // We might want to pass the balance to the client too if you want to show it
      wallet: {
        select: { balance: true }
      }
    }
  });

  // Serialize Decimal for Client Component
  const serializedAgents = agents.map(agent => ({
    ...agent,
    walletBalance: agent.wallet?.balance.toString() || "0.00" // Flatten the structure
  }));

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/aggregator" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <UsersIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          My Agents
        </h1>
      </div>
      
      {/* 2. Pass the list of agents to the Client Component */}
      <AgentsClientPage initialAgents={serializedAgents} />
    </div>
  );
}
