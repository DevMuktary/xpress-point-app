import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  ArrowLeftIcon, 
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- Header --- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-gray-900 text-lg">XPRESS POINT</span>
          </div>
          <Link 
            href="/signup" 
            className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Back
          </Link>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Title Section */}
          <div className="p-8 border-b border-gray-100 text-center bg-gray-50/50">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-gray-500 text-sm">Last Updated: December 2024</p>
          </div>

          {/* --- CRITICAL DISCLAIMER BOX --- */}
          <div className="p-6 bg-yellow-50 border-y border-yellow-100 flex gap-4 items-start">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">
                Important Disclaimer: We are an Independent Agent
              </h3>
              <p className="text-sm text-yellow-800 leading-relaxed">
                Xpress Point is a private data processing and facilitation agency. 
                <strong> We are NOT the National Identity Management Commission (NIMC), the Corporate Affairs Commission (CAC), JAMB, or any other government body.</strong>
                <br /><br />
                We act solely as an intermediary to assist you in submitting requests, processing data, and retrieving documents from these official bodies. We do not issue identities; we only facilitate the process on your behalf based on the data you provide.
              </p>
            </div>
          </div>

          {/* Text Content */}
          <div className="p-8 space-y-8 text-gray-700 leading-relaxed">
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-bold">1</span>
                Acceptance of Terms
              </h2>
              <p>
                By accessing or using the Xpress Point platform ("Service"), you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service. These terms apply to all Agents, Aggregators, and individual users.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-bold">2</span>
                Nature of Services
              </h2>
              <p className="mb-3">
                Our services include, but are not limited to, NIN Verification, Modification, Validation, CAC Registration, and Utility Bill Payments.
              </p>
              <ul className="list-disc pl-5 space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <li>We provide a platform for you to submit data for processing.</li>
                <li>We utilize official API channels and authorized third-party gateways to process your requests.</li>
                <li><strong>We do not guarantee</strong> specific outcomes (e.g., approval of a name change) as these decisions rest solely with the respective government agencies (e.g., NIMC, CAC).</li>
                <li>We are not responsible for delays caused by government portal downtimes or network failures.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-bold">3</span>
                User Responsibilities & Data Accuracy
              </h2>
              <p>
                You agree that you are responsible for the accuracy of the data you submit. Xpress Point is not liable for errors resulting from incorrect information provided by you (e.g., wrong spelling of names, incorrect dates of birth, wrong NIN).
              </p>
              <p className="mt-2">
                By submitting data for a third party (if you are an Agent), you confirm that you have obtained the necessary consent from the data subject to process their personal information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-bold">4</span>
                Payments, Wallets, and Refunds
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>Wallet Funding:</strong> Funds deposited into your Xpress Point wallet are for the consumption of services on the platform. Wallet balances are generally non-withdrawable cash.
                </p>
                <p>
                  <strong>No Refund Policy:</strong> Once a service has been successfully processed or submitted to the government portal, it cannot be reversed or refunded.
                </p>
                <p>
                  <strong>Failed Transactions:</strong> If a transaction fails due to a system error on our end, your wallet will be automatically refunded. However, if a transaction fails due to user error (e.g., submitting a request for a non-existent NIN), a processing fee (e.g., ₦500) may be deducted before the remaining balance is returned.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-bold">5</span>
                Timelines and Delays
              </h2>
              <p>
                While we strive for instant or rapid processing (24-48 hours for most services), timelines are estimates. We are not liable for delays caused by:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                <li>National network outages.</li>
                <li>Maintenance on Government (NIMC/CAC) portals.</li>
                <li>Backlogs at the respective agencies.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-bold">6</span>
                Account Termination
              </h2>
              <p>
                We reserve the right to suspend or terminate your account if you are found to be:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                <li>Using the platform for fraudulent activities.</li>
                <li>Submitting fake or forged documents.</li>
                <li>Abusing the API or platform features.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-bold">7</span>
                Limitation of Liability
              </h2>
              <p>
                In no event shall Xpress Point, its directors, employees, or partners, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, or use, arising out of your use of the service.
              </p>
            </section>

            {/* Agreement Checkbox Visual (Static) */}
            <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <DocumentTextIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">
                By signing up or using our services, you acknowledge that you have read and agreed to these terms.
              </p>
            </div>

          </div>
        </div>
      </main>

      {/* --- Footer --- */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Xpress Point. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
