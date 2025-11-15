import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { 
  UsersIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth';

// This is a new, local card component to allow for different colors
const AggregatorToolCard = ({
  title, description, href, logo: Icon, color,
}: {
  title: string;
  description: string;
  href: string;
  logo: React.ElementType;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}) => {
  
  // Color mapping
  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', hoverBg: 'hover:bg-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600', hoverBg: 'hover:bg-green-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', hoverBg: 'hover:bg-yellow-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', hoverBg: 'hover:bg-purple-600' },
  };
  const colors = colorClasses[color];

  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-lg 
                 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <div>
        <Icon className={`h-10 w-10 ${colors.text}`} />
        <h3 className="mt-4 text-lg font-bold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{description}</p>
      </div>
      <div className="mt-6">
        <span 
          className={`inline-block rounded-lg px-4 py-2 text-sm font-medium 
                     ${colors.bg} ${colors.text}
                     transition-all group-hover:text-white ${colors.hoverBg}`}
        >
          Open Tool →
        </span>
      </div>
    </Link>
  );
};


// This is a Server Component, so it's very fast.
export default async function AggregatorHubPage() {
  
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }
  if (user.role !== 'AGGREGATOR') {
    redirect('/dashboard');
  }

  // This is the list of Aggregator Tools with new color assignments
  const aggregatorTools = [
    {
      title: 'My Agents',
      description: 'View a list of all agents registered under you.',
      href: '/dashboard/aggregator/agents',
      logo: UsersIcon,
      color: 'blue' as const,
    },
    {
      title: 'My Earnings',
      description: 'See the commission history you have earned from your agents.',
      href: '/dashboard/aggregator/earnings',
      logo: CurrencyDollarIcon,
      color: 'green' as const,
    },
    {
      title: 'My Payouts',
      description: 'Withdraw your commission balance to your bank account.',
      href: '/dashboard/aggregator/payouts',
      logo: BanknotesIcon,
      color: 'yellow' as const,
    },
    {
      title: 'My Brand & Links',
      description: 'Get your unique subdomain link to share with new agents.',
      href: '/dashboard/aggregator/brand',
      logo: LinkIcon,
      color: 'purple' as const,
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

      {/* --- Card List (1-column on mobile) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {aggregatorTools.map((tool) => (
          <AggregatorToolCard
            key={tool.title}
            href={tool.href}
            title={tool.title}
            description={tool.description}
            logo={tool.logo}
            color={tool.color}
          />
        ))}
      </div>
    </div>
  );
}
