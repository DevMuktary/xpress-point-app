import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, WifiIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DataClientPage from '@/components/DataClientPage';
import SafeImage from '@/components/SafeImage';
import { Decimal } from '@prisma/client/runtime/library';

type DataPlan = {
  id: string;
  name: string;
  duration: string;
  price: number;
};
type DataPlansObject = {
  [network: string]: {
    logo: string;
    categories: {
      [category: string]: DataPlan[];
    };
  };
};

function buildDataPlans(services: any[], userRole: string): DataPlansObject {
  const dataPlans: DataPlansObject = {
    'MTN': { logo: '/logos/mtn.png', categories: {} },
    'GLO': { logo: '/logos/glo.png', categories: {} },
    'AIRTEL': { logo: '/logos/airtel.png', categories: {} },
    '9MOBILE': { logo: '/logos/9mobile.png', categories: {} },
  };

  services.sort((a, b) => a.defaultAgentPrice.comparedTo(b.defaultAgentPrice));

  for (const service of services) {
    // --- THIS IS THE FIX ---
    // All users (Agents and Aggregators) see the *same* price.
    const price = service.defaultAgentPrice.toNumber();
    // -----------------------
    
    let network: string | null = null;
    let category: string | null = null;
    let serviceName = service.name as string;

    if (service.id.includes('MTN_SME')) { network = 'MTN'; category = 'MTN SME'; }
    else if (service.id.includes('MTN_GIFT')) { network = 'MTN'; category = 'MTN Gifting'; }
    else if (service.id.includes('MTN_CG')) { network = 'MTN'; category = 'MTN Corporate (CG)'; }
    else if (service.id.includes('MTN_AWOOF')) { network = 'MTN'; category = 'MTN Awoof'; }
    else if (service.id.includes('MTN_COUPON')) { network = 'MTN'; category = 'MTN Coupon'; }
    else if (service.id.includes('MTN_SHARE')) { network = 'MTN'; category = 'MTN Data Share'; }
    else if (service.id.includes('GLO_GIFT')) { network = 'GLO'; category = 'Glo Gifting'; }
    else if (service.id.includes('GLO_CG')) { network = 'GLO'; category = 'Glo Corporate (CG)'; }
    else if (service.id.includes('GLO_AWOOF')) { network = 'GLO'; category = 'Glo Awoof'; }
    else if (service.id.includes('GLO_CLOUD')) { network = 'GLO'; category = 'Glo Cloud'; }
    else if (service.id.includes('AIRTEL_GIFT')) { network = 'AIRTEL'; category = 'Airtel Gifting'; }
    else if (service.id.includes('AIRTEL_CG')) { network = 'AIRTEL'; category = 'Airtel Corporate (CG)'; }
    else if (service.id.includes('AIRTEL_SME_LITE')) { network = 'AIRTEL'; category = 'Airtel SME Lite'; }
    else if (service.id.includes('AIRTEL_SME')) { network = 'AIRTEL'; category = 'Airtel SME'; }
    else if (service.id.includes('9M_SME')) { network = '9MOBILE'; category = '9mobile SME'; }
    else if (service.id.includes('9M_GIFT')) { network = '9MOBILE'; category = '9mobile Gifting'; }
    else if (service.id.includes('9M_CG')) { network = '9MOBILE'; category = '9mobile Corporate (CG)'; }
    
    if (network && category) {
      if (!dataPlans[network].categories[category]) {
        dataPlans[network].categories[category] = [];
      }
      
      let name = serviceName.replace(network, '').replace(category, '').replace('Data', '').replace('Gifting', '').replace('SME', '').replace('CG', '').replace('Awoof', '').replace('Cloud', '').replace('Coupon', '').replace('Share', '').replace('Lite', '').trim();
      let duration = '';
      
      const durationMatch = name.match(/\((\d+\s*(Day|Days|D|Month|Months|M|Year|Y))\)|\b(\d+)\s*(Day|Days|D|Month|Months|M|Year|Y)\b/i);
      if (durationMatch) {
        duration = durationMatch[0];
        duration = duration.replace(/\b(Day|D)\b/gi, 'Days');
        duration = duration.replace(/\b(Month|M)\b/gi, 'Months');
        duration = duration.replace(/\b(Year|Y)\b/gi, 'Year');
        if (duration.startsWith('1 ')) {
          duration = duration.replace('Days', 'Day');
          duration = duration.replace('Months', 'Month');
          duration = duration.replace('Years', 'Year');
        }
        if (!duration.startsWith('(')) duration = `(${duration})`;
        name = name.replace(durationMatch[0], '').trim();
      }

      dataPlans[network].categories[category].push({
        id: service.id,
        name: name,
        duration: duration,
        price: price,
      });
    }
  }
  return dataPlans;
}

export default async function DataPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  const dataServices = await prisma.service.findMany({
    where: { 
      category: {
        startsWith: 'VTU_DATA'
      },
      isActive: true
    },
  });

  const dataPlans = buildDataPlans(dataServices, user.role);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/vtu" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <WifiIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          Buy Data
        </h1>
      </div>
      <DataClientPage dataPlans={dataPlans} />
    </div>
  );
}
