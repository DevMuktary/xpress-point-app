import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting "PENDING" to "PROCESSING" status fix script...');
  
  try {
    const { count } = await prisma.personalizationRequest.updateMany({
      where: {
        status: 'PENDING', // Find all old "PENDING" rows
      },
      data: {
        status: 'PROCESSING', // Update them to the new "PROCESSING" value
      },
    });
    
    console.log(`Successfully updated ${count} rows from "PENDING" to "PROCESSING".`);
    
  } catch (error: any) {
    console.error('Error running fixstatus script:', error.message);
    process.exit(1); // Exit with an error
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
