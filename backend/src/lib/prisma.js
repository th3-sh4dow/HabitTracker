import { PrismaClient } from '@prisma/client';

// Re-use the same PrismaClient instance across hot-reloads in development.
// In production there is only ever one instance.
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
