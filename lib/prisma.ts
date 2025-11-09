import { PrismaClient } from '@prisma/client';

// This new structure is the "world-class" standard for
// ensuring you only have one Prisma client, even in
// serverless and development environments.

declare global {
  // We use `var` to declare a global variable that persists
  // across hot-reloads in development.
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// We initialize the client and attach it to the `global` object
// if it doesn't already exist.
export const prisma =
  global.prisma ||
  new PrismaClient({
    // We add more logs so we can see what's happening
    log: ['query', 'info', 'warn', 'error'],
  })

// In development, we save the client to the global object.
if (process.env.NODE_ENV !== 'production') global.prisma = prisma
