// packages/db/src/__mocks__/index.ts
// Stub for @subatone/db used in Jest tests.
// Returns plain spy functions so tests can mock individual methods.
// The actual test files use jest.spyOn or jest.mocked to set return values.

const noop = () => Promise.resolve(null as any)

export const prisma = {
  user: {
    findUnique: noop, findFirst: noop, create: noop, update: noop,
    updateMany: noop, delete: noop, count: noop, findMany: noop,
  },
  subscription: {
    findUnique: noop, findFirst: noop, create: noop, update: noop,
    updateMany: noop, delete: noop, count: noop, findMany: noop,
  },
  recurringPayment: {
    findUnique: noop, findFirst: noop, create: noop, update: noop,
    updateMany: noop, delete: noop, count: noop, findMany: noop,
  },
  coinLedger: { create: noop, findMany: noop, aggregate: noop },
  userBadge: { findMany: noop, upsert: noop, create: noop },
  reminder: { create: noop, findFirst: noop, findMany: noop, update: noop, updateMany: noop },
  serviceLibrary: { findMany: noop, findUnique: noop },
  auditLog: { create: noop },
  $transaction: async (ops: any) => {
    if (Array.isArray(ops)) return Promise.all(ops)
    if (typeof ops === 'function') return ops(prisma)
    return ops
  },
  $connect: noop,
  $disconnect: noop,
}
