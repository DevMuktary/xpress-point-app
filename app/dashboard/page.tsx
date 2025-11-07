// This file is at: /app/dashboard/page.tsx
// This is a Server Component that fetches data.

import React from "react";
import { redirect } from "next/navigation";
import { getUserFromSession } from "@/lib/auth"; // We get the user to secure the page
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ServiceCard from "@/components/ServiceCard";
import { CreditCardIcon, PlusIcon, ArrowUpCircleIcon, ClockIcon } from "@heroicons/react/24/outline";

// --- NEW: Import our interactive component ---
import EmailVerifyAlert from "@/components/EmailVerifyAlert";

const allServices = [
  { title: "NIN Services", description: "Verify NIN, print slips, and more.", logo: "/logos/nin.png", href: "/dashboard/services/nin" },
  { title: "BVN Services", description: "Verify BVN and print slips.", logo: "/logos/bvn.png", href: "#" },
  { title: "CAC Services", description: "Register business names.", logo: "/logos/cac.png", href: "#" },
  { title: "JTB-TIN", description: "Register for personal & business TIN.", logo: "/logos/tin.png", href: "#" },
  { title: "Data & Airtime (VTU)", description: "Buy cheap data, airtime, and pay bills.", logo: "/logos/vtu.png", href: "#" },
  { title: "Exam Pins (WAEC/NECO)", description: "Get WAEC, NECO, and NABTEB result pins.", logo: "/logos/waec.png", href: "#" },
  { title: "JAMB Services", description: "Print result slips, admission letters, etc.", logo: "/logos/jamb.png", href: "#" },
  { title: "Newspaper Publication", description: "Publish change of name.", logo: "/logos/news.png", href: "#" },
];

export default async function DashboardPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect("/login");
  }

  // Get their *real* wallet balance
  const wallet = await prisma.wallet.findUnique({
    where: { userId: user.id },
  });
  
  // Create wallet if it doesn't exist
  let finalWallet;
  if (!wallet) {
    finalWallet = await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 0.00
      }
    });
  } else {
    finalWallet = wallet;
  }
  const walletBalance = finalWallet.balance;

  return (
    <div className="w-full max-w-5xl mx-auto">
      
      {/* --- THIS IS THE UPDATE --- */}
      {/* We now conditionally render the interactive Client Component */}
      {!user.isEmailVerified && (
        <EmailVerifyAlert />
      )}

      {/* ROW 1: WALLET CARD */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-xl">
        <p className="text-sm font-medium uppercase text-blue-200">
          Available Balance
        </p>
        <p className="mt-2 text-3xl font-bold">
          ₦{Number(walletBalance).toFixed(2)}
        </p>
        <div className="mt-8 flex items-center justify-between">
          <span className="text-base font-medium text-blue-100">
            {user.firstName} {user.lastName}
          </span>
          <CreditCardIcon className="h-10 w-10 text-blue-300/50" />
        </div>
      </div>

      {/* ROW 2: QUICK ACTIONS */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Link
            href="/dashboard/fund-wallet"
            className="flex transform flex-col items-center justify-center rounded-2xl 
                       bg-white p-6 shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <PlusIcon className="h-6 w-6 text-blue-600" />
            </div>
            <span className="mt-3 text-sm font-semibold text-gray-900">
              Fund Wallet
            </span>
          </Link>
          <Link
            href="/dashboard/upgrade"
            className="flex transform flex-col items-center justify-center rounded-2xl 
                       bg-white p-6 shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <ArrowUpCircleIcon className="h-6 w-6 text-blue-600" />
            </div>
            <span className="mt-3 text-sm font-semibold text-gray-900">
              Upgrade
            </span>
          </Link>
          <Link
            href="/dashboard/history"
            className="flex transform flex-col items-center justify-center rounded-2xl 
                       bg-white p-6 shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <ClockIcon className="h-6 w-6 text-gray-600" />
            </div>
            <span className="mt-3 text-sm font-semibold text-gray-900">
              History
            </span>
          </Link>
        </div>
      </div>

      {/* ROW 3: ALL SERVICES */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          All Services
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allServices.map((service) => (
            <ServiceCard
              key={service.title}
              title={service.title}
              description={service.description}
              logo={service.logo}
              href={service.href}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
