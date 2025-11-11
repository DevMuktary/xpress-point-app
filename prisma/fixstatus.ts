import { PrismaClient } from '@prisma/client';

// This script will run using ts-node
const prisma = new PrismaClient();

async function main() {
  console.log('Starting "PENDING" to "PROCESSING" status fix script...');
  
  try {
    // We use a raw SQL query because the Prisma "PENDING" enum
    // might not exist for the client at this stage. This is safer.
    const count = await prisma.$executeRawUnsafe(
      `UPDATE "personalization_requests" SET "status" = 'PROCESSING' WHERE "status" = 'PENDING';`
    );
    
    console.log(`Successfully updated ${count} rows from PENDING to PROCESSING.`);
    
  } catch (error: any) {
    // If we get an error that "PENDING" doesn't exist,
    // it means the fix has already run, which is "world-class".
    if (error.message && error.message.includes('invalid input value for enum')) {
      console.log('No "PENDING" values found to fix. This is safe to ignore.');
    } else {
      // A different, real error
      console.error('Error running fixstatus script:', error.message);
      process.exit(1); // Exit with an error to stop the build
    }
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
