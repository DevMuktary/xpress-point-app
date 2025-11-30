// This is a Server Component that fetches data.
import React from "react";
import { redirect } from "next/navigation";
import { getUserFromSession } from "@/lib/auth"; 
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";

import EmailVerifyAlert from "@/components/EmailVerifyAlert";
import ServiceItemCard from "@/components/ServiceItemCard";
import QuickActions from "@/components/QuickActions";
import NotificationBanner from "@/components/NotificationBanner"; // <--- New
import CommunityChat from "@/components/CommunityChat";         // <--- New

// --- Services List ---
const allServices = [
  { 
    title: "NIN Services", 
    description: "Verify NIN, print slips, and manage modifications.", 
    logo: "/logos/nin.png", 
    href: "/dashboard/services/nin" 
  },
  { 
    title: "BVN Services", 
    description: "Verify BVN details, retrieve, and print verification.", 
    logo: "/logos/bvn.png", 
    href: "/dashboard/services/bvn" 
  },
  { 
    title: "JAMB Services", 
    description: "Print original results, admission letters, etc.", 
    logo: "/logos/jamb.png", 
    href: "/dashboard/services/jamb" 
  },
  { 
    title: "JTB-TIN", 
    description: "Register and retrieve JTB-TIN certificates.", 
    logo: "/logos/tin.png", 
    href: "/dashboard/services/tin" 
  },
  { 
    title: "Result Checker", 
    description: "Get WAEC, NECO, and NABTEB result pins.", 
    logo: "/logos/waec.png", 
    href: "/dashboard/services/exam-pins" 
  },
  { 
    title: "CAC Services", 
    description: "Register your business name with the CAC.", 
    logo: "/logos/cac.png", 
    href: "/dashboard/services/cac" 
  },
  { 
    title: "VTU Services", 
    description: "Buy airtime, data, and pay electricity bills.", 
    logo: "/logos/vtu.png", 
    href: "/dashboard/services/vtu" 
  },
  { 
    title: "Newspaper", 
    description: "Publish change of name and other notices.", 
    logo: "/logos/news.png", 
    href: "/dashboard/services/newspaper" 
  },
];
// -----------------------------------------

export default async function DashboardPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect("/login?error=Please+login+to+continue");
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

  // Fetch Banner Content
  const bannerSetting = await prisma.systemSetting.findUnique({
    where: { key: 'dashboard_banner' }
  });
  const bannerContent = bannerSetting?.value || null;

  return (
    <div className="w-full max-w-5xl mx-auto relative">
      
      {/* --- Notification Banner (Admin Controlled) --- */}
      {bannerContent && <NotificationBanner content={bannerContent} />}

      {/* --- Email Verification Alert --- */}
      {!user.isEmailVerified && (
        <EmailVerifyAlert />
      )}

      {/* --- "App-Like" Wallet Card --- */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-blue-100">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-sm font-medium uppercase text-blue-200">
            Available Balance
          </span>
        </div>
        <p className="mt-2 text-3xl font-bold">
          ₦{Number(walletBalance).toFixed(2)}
        </p>
        <Link 
          href="/dashboard/fund-wallet" 
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg 
                     bg-white/10 py-3 text-sm font-semibold text-white 
                     backdrop-blur-sm transition-all hover:bg-white/20"
        >
          <PlusIcon className="h-5 w-5" />
          Fund Wallet
        </Link>
      </div>

      {/* --- Quick Actions --- */}
      <QuickActions userRole={user.role} />

      {/* --- "Our Services" Grid --- */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          All Services
        </h2>
        {/* "grid-cols-1" = 1 card per row on mobile (stable) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allServices.map((service) => (
            <ServiceItemCard
              key={service.title}
              title={service.title}
              description={service.description}
              logo={service.logo}
              href={service.href}
            />
          ))}
        </div>
      </div>

      {/* --- Community Chat Widget --- */}
      <CommunityChat currentUser={user} />
    </div>
  );
}
