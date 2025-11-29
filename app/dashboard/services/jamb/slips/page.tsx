import React from 'react';
import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import JambSlipsPage from '@/components/JambSlipsPage';
// 1. Import the Unavailable Component
import ServiceUnavailable from '@/components/ServiceUnavailable';

export default async function JambPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // --- 1. Fetch Real Prices & Status from DB ---
  const serviceIds = ['JAMB_RESULT_SLIP', 'JAMB_REG_SLIP', 'JAMB_ADMISSION_LETTER'];
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, defaultAgentPrice: true, isActive: true }
  });

  // --- 2. Check Global Availability ---
  // If we found no services, or ALL found services are inactive
  const allServicesDown = services.length > 0 && services.every(s => !s.isActive);

  if (allServicesDown) {
    return (
      <ServiceUnavailable message="All JAMB Slip printing services are currently undergoing maintenance. Please check back later." />
    );
  }

  // --- 3. Create Maps for Price and Availability ---
  const prices: Record<string, number> = {};
  const availability: Record<string, boolean> = {};

  serviceIds.forEach(id => {
    const service = services.find(s => s.id === id);
    if (service) {
      prices[id] = Number(service.defaultAgentPrice);
      availability[id] = service.isActive;
    } else {
      prices[id] = 0;
      availability[id] = false;
    }
  });

  // --- 4. Pass both maps to the client ---
  return <JambSlipsPage prices={prices} availability={availability} />;
}
