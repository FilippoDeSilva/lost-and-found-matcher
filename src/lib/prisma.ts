import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient | null };

let prismaInstance: PrismaClient | null = null;

try {
  prismaInstance =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
} catch (e) {
  console.warn('PrismaClient initialization deferred during build:', e);
  prismaInstance = null;
}

export const prisma = prismaInstance;
