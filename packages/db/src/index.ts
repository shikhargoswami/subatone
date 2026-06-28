// packages/db/src/index.ts
// Re-exports Prisma client so all apps import from one place.
// Using a singleton pattern to prevent connection pool exhaustion
// in development (Next.js / Nodemon hot-reload creates multiple instances).

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env['NODE_ENV'] === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma
}

export * from '@prisma/client'
