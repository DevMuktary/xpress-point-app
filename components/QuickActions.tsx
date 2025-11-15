"use client";

import Link from 'next/link';
import {
  CreditCardIcon,
  ClockIcon,
  UserIcon,
  ArrowUpCircleIcon,
  ShieldCheckIcon // Import the icon for Aggregator Tools
} from '@heroicons/react/24/outline';

// This is the definition for a single action button
type Action = {
  title: string;
  href: string;
  icon: React.ElementType;
  color: string;
};

// This is the main component
export default function QuickActions({ userRole }: { userRole: string }) {
  
  // --- THIS IS THE FIX ---
  // We now build the list of actions dynamically based on the user's role

  // 1. These are the "base" actions everyone sees
  const actions: Action[] = [
    {
      title: 'Fund Wallet',
      href: '/dashboard/fund-wallet',
      icon: CreditCardIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'View History',
      href: '/dashboard/history',
      icon: ClockIcon,
      color: 'bg-green-500',
    },
    {
      title: 'My Profile',
      href: '/dashboard/profile',
      icon: UserIcon,
      color: 'bg-yellow-500',
    }
  ];

  // 2. We check the role and add the "conditional" button
  if (userRole === 'AGENT') {
    actions.push({
      title: 'Upgrade',
      href: '/dashboard/upgrade',
      icon: ArrowUpCircleIcon,
      color: 'bg-purple-500',
    });
  } else if (userRole === 'AGGREGATOR') {
    actions.push({
      title: 'Aggregator Tools',
      href: '/dashboard/aggregator',
      icon: ShieldCheckIcon, // Use the new icon
      color: 'bg-purple-500',
    });
  }
  // -------------------------

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className={`group flex flex-col items-center justify-center rounded-2xl 
                       p-4 text-center text-white transition-all 
                       hover:shadow-lg hover:-translate-y-1 ${action.color}`}
          >
            <action.icon className="h-8 w-8" />
            <span className="mt-2 text-sm font-semibold">{action.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
