import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// Define our services and their prices
const services = [
  // NIN Services
  {
    id: 'NIN_LOOKUP',
    name: 'NIN Verification Lookup',
    category: 'NIN',
    agentPrice: new Decimal(150.00),
    aggregatorPrice: new Decimal(140.00), // Example of a different price
  },
  {
    id: 'NIN_SLIP_REGULAR',
    name: 'NIN Regular Slip',
    category: 'NIN',
    agentPrice: new Decimal(100.00),
    aggregatorPrice: new Decimal(90.00),
  },
  {
    id: 'NIN_SLIP_STANDARD',
    name: 'NIN Standard Slip',
    category: 'NIN',
    agentPrice: new Decimal(150.00),
    aggregatorPrice: new Decimal(140.00),
  },
  {
    id: 'NIN_SLIP_PREMIUM',
    name: 'NIN Premium Slip',
    category: 'NIN',
    agentPrice: new Decimal(200.00),
    aggregatorPrice: new Decimal(180.00),
  },
  // We can add all other services here
];

async function main() {
  console.log('Start seeding services...');
  
  for (const service of services) {
    const serviceExists = await prisma.service.findUnique({
      where: { id: service.id },
    });
    
    // We use upsert to create or update the service
    await prisma.service.upsert({
      where: { id: service.id },
      update: {
        agentPrice: service.agentPrice,
        aggregatorPrice: service.aggregatorPrice,
      },
      create: service,
    });
  }
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
