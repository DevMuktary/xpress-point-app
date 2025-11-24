import React from 'react';
import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import JambSlipsPage from '@/components/JambSlipsPage';

export default async function JambPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // --- 1. Fetch Real Prices from DB ---
  const serviceIds = ['JAMB_RESULT_SLIP', 'JAMB_REG_SLIP', 'JAMB_ADMISSION_LETTER'];
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } }
  });

  // --- 2. Create Price Map ---
  const prices: Record<string, number> = {};
  serviceIds.forEach(id => {
    const service = services.find(s => s.id === id);
    // Always use defaultAgentPrice as discussed
    prices[id] = service ? Number(service.defaultAgentPrice) : 0;
  });

  return <JambSlipsPage prices={prices} />;
}
