import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting "PENDING" to "PROCESSING" status fix script...');
  
  try {
    // This script uses a raw query to be safe.
    // It finds all "PENDING" and updates them to "PROCESSING".
    const count = await prisma.$executeRawUnsafe(
      `UPDATE "personalization_requests" SET "status" = 'PROCESSING' WHERE "status" = 'PENDING';`
    );
    
    console.log(`Successfully updated ${count} rows from "PENDING" to "PROCESSING".`);
    
  } catch (error: any) {
    // If the "PENDING" enum no longer exists, it means the fix has already run.
    if (error.message && error.message.includes('invalid input value for enum')) {
      console.log('No "PENDING" values found to fix. This is safe to ignore.');
    } else {
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
