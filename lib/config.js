import { Decimal } from '@prisma/client/runtime/library';

// "World-Class" fee for a failed manual submission
// The Admin API will import this when we build the "refund" logic.
export const FAILED_SUBMISSION_FEE = new Decimal(500);

// We can add other shared logic here later, like the 7k DOB fee.
export const DOB_5_YEAR_FEE = new Decimal(7000);
