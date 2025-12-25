import React from "react";
import { redirect } from "next/navigation";
import { getUserFromSession } from "@/lib/auth"; 
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusIcon, SparklesIcon } from "@heroicons/react/24/outline"; // Added SparklesIcon for effect

import EmailVerifyAlert from "@/components/EmailVerifyAlert";
import ServiceItemCard from "@/components/ServiceItemCard";
import QuickActions from "@/components/QuickActions";
import NotificationBanner from "@/components/NotificationBanner"; 
import CommunityChat from "@/components/CommunityChat";          

// --- COMPLETE FLATTENED SERVICE LIST ---
const allServices = [
  // --- NIN SERVICES ---
  { title: "VNIN Slip (Instant)", href: "/dashboard/services/nin/vnin-slip", logo: "/logos/nin.png", color: "bg-green-50" },
  { title: "Verify by NIN", href: "/dashboard/services/nin/verify-by-nin", logo: "/logos/nin.png", color: "bg-green-50" },
  { title: "Verify by Phone", href: "/dashboard/services/nin/verify-by-phone", logo: "/logos/nin.png", color: "bg-green-50" },
  { title: "NIN Modification", href: "/dashboard/services/nin/modification", logo: "/logos/nin.png", color: "bg-green-50" },
  { title: "NIN Validation", href: "/dashboard/services/nin/validation", logo: "/logos/nin.png", color: "bg-green-50" },
  { title: "IPE Clearance", href: "/dashboard/services/nin/ipe-clearance", logo: "/logos/nin.png", color: "bg-green-50" },
  { title: "Delink NIN", href: "/dashboard/services/nin/delink", logo: "/logos/nin.png", color: "bg-green-50" },
  { title: "NIN Personalization", href: "/dashboard/services/nin/personalize", logo: "/logos/nin.png", color: "bg-green-50" },
  
  // --- BVN SERVICES ---
  { title: "BVN Verification", href: "/dashboard/services/bvn/verification", logo: "/logos/bvn.png", color: "bg-red-50" },
  { title: "BVN Retrieval", href: "/dashboard/services/bvn/retrieval", logo: "/logos/bvn.png", color: "bg-red-50" },
  { title: "BVN Modification", href: "/dashboard/services/bvn/modification", logo: "/logos/bvn.png", color: "bg-red-50" },
  { title: "BVN User", href: "/dashboard/services/bvn/enrollment", logo: "/logos/bvn.png", color: "bg-red-50" },
  { title: "VNIN to NIBSS", href: "/dashboard/services/bvn/vnin-to-nibss", logo: "/logos/bvn.png", color: "bg-red-50" },

  // --- JAMB SERVICES ---
  { title: "JAMB Result/Slip", href: "/dashboard/services/jamb/slips", logo: "/logos/jamb.png", color: "bg-yellow-50" },
  { title: "Profile Code Retrieval", href: "/dashboard/services/jamb/profile-code", logo: "/logos/jamb.png", color: "bg-yellow-50" },

  // --- EXAM PINS / CARDS ---
  { title: "Check Result of Exams", href: "/dashboard/services/exam-pins/request-result", logo: "/logos/waec.png", color: "bg-purple-50" },
  { title: "WAEC Pin", href: "/dashboard/services/exam-pins/waec", logo: "/logos/waec.png", color: "bg-purple-50" },
  { title: "NECO Pin", href: "/dashboard/services/exam-pins/neco", logo: "/logos/neco.png", color: "bg-purple-50" },
  { title: "NABTEB Pin", href: "/dashboard/services/exam-pins/nabteb", logo: "/logos/nabteb.png", color: "bg-purple-50" },
  { title: "JAMB Pin", href: "/dashboard/services/exam-pins/jamb", logo: "/logos/jamb.png", color: "bg-purple-50" },

  // --- CORPORATE / OTHER ---
  { title: "CAC Registration/Retrieval", href: "/dashboard/services/cac", logo: "/logos/cac.png", color: "bg-emerald-50" },
  { title: "Tin Certificate/Retrieval", href: "/dashboard/services/tin", logo: "/logos/tin.png", color: "bg-blue-50" },
  { title: "Newspaper Pub", href: "/dashboard/services/newspaper", logo: "/logos/news.png", color: "bg-gray-50" },
  { title: "NPC Attestation", href: "/dashboard/services/npc", logo: "/logos/npc.png", color: "bg-orange-50" },
  
  // --- UTILITIES (VTU) ---
  { title: "Buy Airtime", href: "/dashboard/services/vtu/airtime", logo: "/logos/mtn.png", color: "bg-indigo-50" },
  { title: "Buy Data", href: "/dashboard/services/vtu/data", logo: "/logos/glo.png", color: "bg-indigo-50" },
  { title: "Pay Electricity (unavailable)", href: "/dashboard/services/vtu/electricity", logo: "/logos/vtu.png", color: "bg-indigo-50" },
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
    <div className="w-full max-w-5xl mx-auto relative px-2 sm:px-4 space-y-6">
      
      {bannerContent && <NotificationBanner content={bannerContent} />}
      {!user.isEmailVerified && <EmailVerifyAlert />}

      {/* --- NEW YEAR WIDGET (Animation & Design) --- */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-500 p-1 shadow-lg animate-fade-in-down">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        <div className="relative flex items-center justify-between rounded-lg bg-white/10 backdrop-blur-md px-4 py-3 text-white">
          <div className="flex flex-col">
            <h1 className="flex items-center gap-2 text-lg font-bold">
              <span>🎉</span> Happy New Year, {user.firstName}!
            </h1>
            <p className="text-xs text-white/90 font-medium">
              We wish you a prosperous year ahead filled with success.
            </p>
          </div>
          <div className="hidden sm:block">
             <SparklesIcon className="h-8 w-8 text-yellow-200 animate-pulse" />
          </div>
        </div>
      </div>

      {/* --- Wallet Card (Enhanced) --- */}
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 p-6 text-white shadow-xl transition-all hover:shadow-2xl hover:scale-[1.01] duration-300">
        {/* Decorative Circles */}
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl transition-all group-hover:bg-white/20"></div>
        <div className="absolute -bottom-10 -left-6 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-blue-100 opacity-80">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-ping"></div>
              Available Balance
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200 bg-white/10 px-2 py-1 rounded">
              NGN Wallet
            </span>
          </div>
          
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              ₦{Number(walletBalance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <Link 
            href="/dashboard/fund-wallet" 
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl 
                       bg-white text-blue-900 py-3 text-sm font-bold shadow-md
                       transition-all hover:bg-blue-50 hover:shadow-lg active:scale-95"
          >
            <PlusIcon className="h-5 w-5 stroke-[3px]" />
            Fund Wallet
          </Link>
        </div>
      </div>

      <QuickActions userRole={user.role} />

      {/* --- SERVICE GRID --- */}
      <div className="pb-24">
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="h-6 w-1 bg-blue-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-800">Available Services</h2>
        </div>
        
        {/* grid-cols-2 ensures 2 per line on mobile. gap-3 makes it tight/app-like. */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allServices.map((service) => {
            // --- PROMO LOGIC ---
            // Exclude: Electricity, All Exams (WAEC, NECO, JAMB, NABTEB), and Personalization
            const titleLower = service.title.toLowerCase();
            const isElectricity = titleLower.includes('electricity');
            const isExam = titleLower.includes('exam') || titleLower.includes('waec') || titleLower.includes('neco') || titleLower.includes('nabteb') || titleLower.includes('jamb');
            const isPersonalization = titleLower.includes('personalization');
            
            const showPromo = !isElectricity && !isExam && !isPersonalization;

            return (
              <div key={service.title} className="relative group">
                
                {/* PROMO ANIME BADGE */}
                {showPromo && (
                  <div className="absolute -top-2 -right-1 z-20 flex animate-bounce">
                    <span className="relative inline-flex h-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-600 px-2 text-[10px] font-bold text-white shadow-sm ring-1 ring-white">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-20"></span>
                      PROMO
                    </span>
                  </div>
                )}

                {/* Card Wrapper for Hover Effect */}
                <div className="transition-transform duration-200 hover:-translate-y-1">
                  <ServiceItemCard
                    title={service.title}
                    logo={service.logo}
                    href={service.href}
                    color={service.color}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CommunityChat currentUser={user} />

      {/* Helper styles for specific animations not in standard Tailwind */}
      <style>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
