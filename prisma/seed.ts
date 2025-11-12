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
    aggregatorPrice: new Decimal(140.00),
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
  {
    id: 'NIN_PERSONALIZATION',
    name: 'NIN Personalization',
    category: 'NIN',
    agentPrice: new Decimal(1000.00),
    aggregatorPrice: new Decimal(950.00),
  },
  {
    id: 'NIN_IPE_CLEARANCE',
    name: 'NIN IPE Clearance',
    category: 'NIN',
    agentPrice: new Decimal(2500.00),
    aggregatorPrice: new Decimal(2450.00),
  },
  {
    id: 'NIN_VALIDATION_47',
    name: 'NIN Validation (No Record)',
    category: 'NIN',
    agentPrice: new Decimal(500.00),
    aggregatorPrice: new Decimal(480.00),
  },
  {
    id: 'NIN_VALIDATION_48',
    name: 'NIN Validation (Sim Card Issues)',
    category: 'NIN',
    agentPrice: new Decimal(550.00),
    aggregatorPrice: new Decimal(530.00),
  },
  {
    id: 'NIN_VALIDATION_49',
    name: 'NIN Validation (Bank Validation)',
    category: 'NIN',
    agentPrice: new Decimal(500.00),
    aggregatorPrice: new Decimal(480.00),
  },
  {
    id: 'NIN_VALIDATION_50',
    name: 'NIN Validation (Photographer error)',
    category: 'NIN',
    agentPrice: new Decimal(600.00),
    aggregatorPrice: new Decimal(580.00),
  },
  {
    id: 'NIN_MOD_NAME',
    name: 'NIN Modification (Name)',
    category: 'NIN',
    agentPrice: new Decimal(2000.00),
    aggregatorPrice: new Decimal(1950.00),
  },
  {
    id: 'NIN_MOD_PHONE',
    name: 'NIN Modification (Phone)',
    category: 'NIN',
    agentPrice: new Decimal(1000.00),
    aggregatorPrice: new Decimal(950.00),
  },
  {
    id: 'NIN_MOD_ADDRESS',
    name: 'NIN Modification (Address)',
    category: 'NIN',
    agentPrice: new Decimal(1500.00),
    aggregatorPrice: new Decimal(1450.00),
  },
  {
    id: 'NIN_MOD_DOB',
    name: 'NIN Modification (Date of Birth)',
    category: 'NIN',
    agentPrice: new Decimal(15000.00),
    aggregatorPrice: new Decimal(14500.00),
  },
  {
    id: 'NIN_DELINK',
    name: 'NIN Delink / Retrieve Email',
    category: 'NIN',
    agentPrice: new Decimal(2500.00),
    aggregatorPrice: new Decimal(2450.00),
  },
  {
    id: 'NEWSPAPER_NAME_CHANGE',
    name: 'Newspaper Change of Name',
    category: 'NEWSPAPER',
    agentPrice: new Decimal(4500.00),
    aggregatorPrice: new Decimal(4450.00),
  },
  {
    id: 'CAC_REG_BN',
    name: 'CAC Business Name Registration',
    category: 'CAC',
    agentPrice: new Decimal(18000.00),
    aggregatorPrice: new Decimal(17500.00),
  },
  {
    id: 'CAC_DOC_RETRIEVAL',
    name: 'CAC Document Retrieval',
    category: 'CAC',
    agentPrice: new Decimal(5000.00),
    aggregatorPrice: new Decimal(4800.00),
  },

  // --- NEW JTB TIN SERVICES ---
  {
    id: 'TIN_REG_PERSONAL',
    name: 'TIN Registration (Personal)',
    category: 'TIN',
    agentPrice: new Decimal(3000.00), // Placeholder price
    aggregatorPrice: new Decimal(2800.00),
  },
  {
    id: 'TIN_REG_BUSINESS',
    name: 'TIN Registration (Business)',
    category: 'TIN',
    agentPrice: new Decimal(5000.00), // Placeholder price
    aggregatorPrice: new Decimal(4800.00),
  },
  {
    id: 'TIN_RETRIEVAL_PERSONAL',
    name: 'TIN Retrieval (Personal)',
    category: 'TIN',
    agentPrice: new Decimal(1500.00), // Placeholder price
    aggregatorPrice: new Decimal(1400.00),
  },
  {
    id: 'TIN_RETRIEVAL_BUSINESS',
    name: 'TIN Retrieval (Business)',
    category: 'TIN',
    agentPrice: new Decimal(2500.00), // Placeholder price
    aggregatorPrice: new Decimal(2400.00),
  },
  // ----------------------------
];

async function main() {
  console.log('Start seeding services...');
  
  for (const service of services) {
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
