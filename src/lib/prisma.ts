import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';

const { Pool } = pkg;
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/found-lost?schema=public';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma?: PrismaClient | null };

let prismaInstance: PrismaClient | null = null;

try {
  prismaInstance =
    globalForPrisma.prisma ||
    new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
} catch (e) {
  console.warn('PrismaClient initialization fallback:', e);
  prismaInstance = null;
}

export const prisma = prismaInstance;
