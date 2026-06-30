// packages/db/src/__mocks__/index.ts
// Jest mock for @subatone/db.
// In CJS mode (no "type":"module" in apps/api/package.json),
// the jest global is available at module evaluation time.

/* eslint-disable @typescript-eslint/no-explicit-any */
const fn = () => jest.fn().mockResolvedValue(null as any)
const fnArr = () => jest.fn().mockResolvedValue([] as any)

export const prisma = {
  user: {
    findUnique: fn(), findFirst: fn(), findUniqueOrThrow: fn(), create: fn(), update: fn(),
    updateMany: fn(), delete: fn(), count: fn(), findMany: fnArr(),
  },
  subscription: {
    findUnique: fn(), findFirst: fn(), findUniqueOrThrow: fn(), create: fn(), update: fn(),
    updateMany: fn(), delete: fn(), count: fn(), findMany: fnArr(),
  },
  recurringPayment: {
    findUnique: fn(), findFirst: fn(), findUniqueOrThrow: fn(), create: fn(), update: fn(),
    updateMany: fn(), delete: fn(), count: fn(), findMany: fnArr(),
  },
  coinLedger: { create: fn(), findMany: fnArr(), aggregate: fn() },
  userBadge: { findMany: fnArr(), upsert: fn(), create: fn() },
  reminder: { create: fn(), findFirst: fn(), findMany: fnArr(), update: fn(), updateMany: fn() },
  serviceLibrary: { findMany: fnArr(), findUnique: fn() },
  auditLog: { create: fn() },
  $transaction: jest.fn(async (ops: any) => {
    if (Array.isArray(ops)) return Promise.all(ops)
    if (typeof ops === 'function') return ops(prisma)
    return ops
  }),
  $connect: fn(),
  $disconnect: fn(),
}
