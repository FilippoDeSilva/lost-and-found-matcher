// @ts-nocheck
import { defineConfig } from '@prisma/config';

export default defineConfig({
  earlyAccess: true,
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    seed: 'node --import tsx/esm ./prisma/seed.ts',
  },
});
