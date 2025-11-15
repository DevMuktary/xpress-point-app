import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import ServiceItemCard from '@/components/ServiceItemCard'; // We re-use our "world-class" card
import { 
  UsersIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth';

// This is a Server Component, so it's very fast.
export default async function AggregatorHubPage() {
  
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }
  // "Stunning" security: If a normal AGENT tries to see this, send them away.
  if (user.role !== 'AGGREGATOR') {
    redirect('/dashboard');
  }

  // --- This is the "Stunning" 4-Card Hub (Your Design) ---
  const aggregatorTools = [
    {
      title: 'My Agents',
      description: 'View a "world-class" list of all agents registered under you.',
      href: '/dashboard/aggregator/agents', // We will build this next
      logo: UsersIcon,
    },
    {
      title: 'My Earnings',
      description: 'See the "stunning" commission history you have earned from your agents.',
      href: '/dashboard/aggregator/earnings', // We will build this next
      logo: CurrencyDollarIcon,
    },
    {
      title: 'My Payouts',
      description: 'Withdraw your "world-class" commission balance to your bank account.',
      href: '/dashboard/aggregator/payouts', // We will build this NOW
      logo: BanknotesIcon,
    },
    {
      title: 'My Brand',
      description: 'Get your "stunning" and "instant" subdomain link to share.',
      href: '/dashboard/aggregator/brand', // We will build this next
      logo: LinkIcon,
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <UsersIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          Aggregator Tools
        </h1>
      </div>

      {/* --- "Refurbished" Card List (1-column, stable on phone) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {aggregatorTools.map((service) => (
          // This is a "refurbished" ServiceItemCard, using the Icon
          <Link
            key={service.title}
            href={service.href}
            className="group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-lg 
                       transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div>
              <service.logo className="h-10 w-10 text-blue-600" />
              <h3 className="mt-4 text-lg font-bold text-gray-900">{service.title}</h3>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">{service.description}</p>
            </div>
            <div className="mt-6">
              <span 
                className="inline-block rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 
                           transition-all group-hover:bg-blue-600 group-hover:text-white"
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
