import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheckIcon, 
  UserGroupIcon, 
  BoltIcon, 
  AcademicCapIcon, 
  DocumentTextIcon, 
  GlobeAltIcon,
  CheckBadgeIcon,
  PhoneIcon,
  FingerPrintIcon
} from '@heroicons/react/24/outline';

// --- Components ---

const ServiceCard = ({ title, description, icon: Icon, colorClass, delay }: any) => (
  <div className={`group relative overflow-hidden rounded-2xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-gray-100 animate-fade-in-up ${delay}`}>
    <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150 ${colorClass}`}></div>
    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${colorClass} text-white shadow-lg`}>
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3">
    <div className="flex-shrink-0 rounded-full bg-green-100 p-1">
      <CheckBadgeIcon className="h-5 w-5 text-green-600" />
    </div>
    <span className="text-gray-700 font-medium">{text}</span>
  </div>
);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            {/* Replace with your logo image if available */}
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
              XP
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">XpressPoint</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#services" className="hover:text-blue-600 transition-colors">Services</a>
            <a href="#features" className="hover:text-blue-600 transition-colors">Why Us</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="hidden md:block text-sm font-semibold text-gray-700 hover:text-blue-600"
            >
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-blue-300 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
        <div className="absolute inset-0 z-0">
           <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-100 blur-3xl opacity-50 mix-blend-multiply animate-blob"></div>
           <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-purple-100 blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-200"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          <div className="animate-fade-in-up">
            <span className="mb-6 inline-block rounded-full bg-blue-50 border border-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700 shadow-sm">
              🚀 The #1 Platform for Digital Agents
            </span>
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl mb-6">
              Empowering Agents, <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Simplifying Services
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 mb-10 leading-relaxed">
              Access a comprehensive suite of identity and utility services. 
              From NIN & BVN modifications to JAMB pins and airtime — fast, reliable, and secure.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/signup" 
                className="w-full sm:w-auto rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 hover:-translate-y-1"
              >
                Become an Agent
              </Link>
              <Link 
                href="/login" 
                className="w-full sm:w-auto rounded-xl bg-white px-8 py-4 text-base font-bold text-gray-700 border border-gray-200 shadow-sm transition-all hover:bg-gray-50 hover:text-blue-600 hover:-translate-y-1"
              >
                Access Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- SERVICES GRID --- */}
      <section id="services" className="py-24 bg-white relative">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Everything You Need</h2>
            <p className="mt-4 text-lg text-gray-600">A complete marketplace for digital services at your fingertips.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard 
              title="Identity Management" 
              description="NIN Verification, Modification, Validation, and Slip Printing. Seamless integration with official databases."
              icon={FingerPrintIcon}
              colorClass="bg-green-600"
              delay="animation-delay-200"
            />
            <ServiceCard 
              title="BVN Services" 
              description="Enrollment, Modification, and Retrieval services. Ensure your customers are banking compliant."
              icon={ShieldCheckIcon}
              colorClass="bg-red-500"
              delay="animation-delay-400"
            />
             <ServiceCard 
              title="Education & Exams" 
              description="Purchase WAEC, NECO, and NABTEB pins. Process JAMB Profile Codes and Regularization easily."
              icon={AcademicCapIcon}
              colorClass="bg-purple-600"
              delay="animation-delay-600"
            />
            <ServiceCard 
              title="Business Registration" 
              description="Fast-track CAC registration and history checks. Help businesses get legal quickly."
              icon={DocumentTextIcon}
              colorClass="bg-orange-500"
              delay=""
            />
             <ServiceCard 
              title="Utilities & VTU" 
              description="Instant Airtime, Data bundles for all networks, and Electricity bill payments."
              icon={BoltIcon}
              colorClass="bg-yellow-500"
              delay="animation-delay-200"
            />
            <ServiceCard 
              title="Official Attestations" 
              description="NPC Birth Attestations, Change of Name Publications, and more."
              icon={GlobeAltIcon}
              colorClass="bg-teal-500"
              delay="animation-delay-400"
            />
          </div>
        </div>
      </section>

      {/* --- FEATURES / WHY US --- */}
      <section id="features" className="py-24 bg-blue-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="animate-fade-in-up">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-6">
                Built for Speed and Reliability
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We understand that downtime costs money. That's why XpressPoint is engineered for high availability and instant transaction processing.
              </p>
              
              <div className="space-y-4">
                <FeatureItem text="Instant Wallet Funding" />
                <FeatureItem text="Real-time Transaction Receipts" />
                <FeatureItem text="Automated Commission System" />
                <FeatureItem text="24/7 Dedicated Support" />
                <FeatureItem text="Secure & Encrypted Data" />
              </div>
            </div>

            {/* Right Image/Graphic Placeholder */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-full">
              <div className="relative rounded-2xl bg-white p-8 shadow-2xl border border-gray-100 animate-float">
                {/* Abstract UI representation */}
                <div className="flex items-center gap-4 mb-6">
                   <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                     <UserGroupIcon className="h-6 w-6 text-blue-600" />
                   </div>
                   <div>
                     <p className="text-sm text-gray-500">Total Agents</p>
                     <p className="text-xl font-bold text-gray-900">5,000+</p>
                   </div>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full mb-6 overflow-hidden">
                  <div className="h-full w-3/4 bg-blue-600 rounded-full"></div>
                </div>
                <div className="space-y-3">
                   <div className="h-10 w-full bg-gray-50 rounded-lg flex items-center px-4">
                      <div className="h-2 w-1/3 bg-gray-200 rounded"></div>
                   </div>
                   <div className="h-10 w-full bg-gray-50 rounded-lg flex items-center px-4">
                      <div className="h-2 w-1/2 bg-gray-200 rounded"></div>
                   </div>
                   <div className="h-10 w-full bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-200">
                      Process Request
                   </div>
                </div>
              </div>
              {/* Decor elements */}
              <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-yellow-400 opacity-20 blur-xl"></div>
              <div className="absolute -top-6 -left-6 h-32 w-32 rounded-full bg-blue-600 opacity-10 blur-xl"></div>
            </div>

          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="rounded-3xl bg-blue-600 px-6 py-16 md:px-12 md:py-20 shadow-2xl overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
               <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                 <path d="M0 100 L100 0 L100 100 Z" fill="white" />
               </svg>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">
                Ready to Boost Your Business?
              </h2>
              <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
                Join thousands of agents using XpressPoint to deliver essential services to their communities. Sign up today and start earning.
              </p>
              <Link 
                href="/signup" 
                className="inline-block rounded-full bg-white px-8 py-4 text-base font-bold text-blue-700 shadow-lg transition-transform hover:scale-105"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-50 pt-16 pb-8 border-t border-gray-200" id="contact">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                 <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">XP</div>
                 <span className="text-lg font-bold text-gray-900">XpressPoint</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Your trusted partner for identity verification, utility payments, and digital services in Nigeria.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-blue-600">NIN Services</Link></li>
                <li><Link href="#" className="hover:text-blue-600">BVN Enrollment</Link></li>
                <li><Link href="#" className="hover:text-blue-600">JAMB & WAEC</Link></li>
                <li><Link href="#" className="hover:text-blue-600">Airtime & Data</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-blue-600">About Us</Link></li>
                <li><Link href="#" className="hover:text-blue-600">Become an Agent</Link></li>
                <li><Link href="/terms" className="hover:text-blue-600">Terms & Conditions</Link></li>
                <li><Link href="#" className="hover:text-blue-600">Privacy Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4" />
                  <span>+1 XPRESSPOINT</span>
                </li>
                <li>contact@xpresspoint</li>
                <li>United Nations</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} XpressPoint. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
