import React from "react";
import { redirect } from "next/navigation";
import { getUserFromSession } from "@/lib/auth"; 
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";

import EmailVerifyAlert from "@/components/EmailVerifyAlert";
import ServiceItemCard from "@/components/ServiceItemCard";
import QuickActions from "@/components/QuickActions";
import NotificationBanner from "@/components/NotificationBanner"; 
import CommunityChat from "@/components/CommunityChat";         

// --- FLATTENED SERVICE LIST ---
// listing every tool individually
const allServices = [
  // --- NIN ---
  { title: "NIN Slip Print", href: "/dashboard/services/nin/vnin-slip", logo: "/logos/nin.png", color: "bg-green-50" },
  { title: "NIN Modification", href: "/dashboard/services/nin/modification", logo: "/logos/nin.png", color: "bg-green-50" },
  { title: "NIN Validation", href: "/dashboard/services/nin/validation", logo: "/logos/nin.png", color: "bg-green-50" },
  { title: "NIN Delink", href: "/dashboard/services/nin/delink", logo: "/logos/nin.png", color: "bg-green-50" },
  
  // --- BVN ---
  { title: "BVN Verification", href: "/dashboard/services/bvn/verification", logo: "/logos/bvn.png", color: "bg-red-50" },
  { title: "BVN Retrieval", href: "/dashboard/services/bvn/retrieval", logo: "/logos/bvn.png", color: "bg-red-50" },
  { title: "BVN Modification", href: "/dashboard/services/bvn/modification", logo: "/logos/bvn.png", color: "bg-red-50" },
  { title: "BVN Enrollment", href: "/dashboard/services/bvn/enrollment", logo: "/logos/bvn.png", color: "bg-red-50" },

  // --- JAMB ---
  { title: "JAMB Result/Slip", href: "/dashboard/services/jamb/slips", logo: "/logos/jamb.png", color: "bg-yellow-50" },
  { title: "Profile Code", href: "/dashboard/services/jamb/profile-code", logo: "/logos/jamb.png", color: "bg-yellow-50" },

  // --- OTHERS ---
  { title: "CAC Registration", href: "/dashboard/services/cac", logo: "/logos/cac.png", color: "bg-emerald-50" },
  { title: "Tin Certificate", href: "/dashboard/services/tin", logo: "/logos/tin.png", color: "bg-blue-50" },
  { title: "Exam Pins", href: "/dashboard/services/exam-pins", logo: "/logos/waec.png", color: "bg-purple-50" },
  { title: "Newspaper Pub", href: "/dashboard/services/newspaper", logo: "/logos/news.png", color: "bg-gray-50" },
  { title: "NPC Attestation", href: "/dashboard/services/npc", logo: "/logos/npc.png", color: "bg-orange-50" },
  
  // --- UTILITIES ---
  { title: "Buy Airtime", href: "/dashboard/services/vtu/airtime", logo: "/logos/mtn.png", color: "bg-indigo-50" },
  { title: "Buy Data", href: "/dashboard/services/vtu/data", logo: "/logos/glo.png", color: "bg-indigo-50" },
];

export default async function DashboardPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect("/login?error=Please+login+to+continue");
  }

  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  
  let finalWallet;
  if (!wallet) {
    finalWallet = await prisma.wallet.create({ data: { userId: user.id, balance: 0.00 } });
  } else {
    finalWallet = wallet;
  }
  const walletBalance = finalWallet.balance;

  const bannerSetting = await prisma.systemSetting.findUnique({ where: { key: 'dashboard_banner' } });
  const bannerContent = bannerSetting?.value || null;

  return (
    <div className="w-full max-w-5xl mx-auto relative px-2 sm:px-4">
      
      {bannerContent && <NotificationBanner content={bannerContent} />}
      {!user.isEmailVerified && <EmailVerifyAlert />}

      {/* --- Wallet Card --- */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-900 p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-100">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
            Wallet Balance
          </span>
        </div>
        <p className="mt-1 text-2xl font-bold">
          ₦{Number(walletBalance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </p>
        <Link 
          href="/dashboard/fund-wallet" 
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg 
                     bg-white/10 py-2.5 text-xs font-bold text-white 
                     backdrop-blur-sm transition-all hover:bg-white/20 border border-white/20"
        >
          <PlusIcon className="h-4 w-4" />
          Fund Wallet
        </Link>
      </div>

      <QuickActions userRole={user.role} />

      {/* --- COMPACT SERVICE GRID --- */}
      <div className="mt-6">
        <h2 className="mb-3 text-lg font-bold text-gray-800 px-1">
          Available Services
        </h2>
        {/* grid-cols-2 ensures 2 per line on mobile. gap-3 makes it tight/app-like. */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {allServices.map((service) => (
            <ServiceItemCard
              key={service.title}
              title={service.title}
              logo={service.logo}
              href={service.href}
              color={service.color}
            />
          ))}
        </div>
      </div>

      <CommunityChat currentUser={user} />
    </div>
  );
}
