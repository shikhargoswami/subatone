// apps/api/src/__tests__/journeys/03-rent-and-coins.journey.test.ts
//
// ─────────────────────────────────────────────────────────────────────────────
// USER JOURNEY: Rent Tracking + 3× Coin Earn
// ─────────────────────────────────────────────────────────────────────────────
//
// SCENARIO
// ────────
// Priya pays ₹18,000 rent every month. She adds it as a recurring payment.
// When she marks it paid, she earns 3× coins vs subscriptions:
//   ₹18,000 ÷ 10 × 3 = 5,400 coins
//
// This is the gamification hook for high-value payments.
// She also adds her electricity bill: ₹2,200/month → 660 coins on payment.
//
// ASSERTIONS
// ──────────
// 1. POST /recurring-payments (rent)        → 201
// 2. POST /recurring-payments (electricity) → 201
// 3. GET  /recurring-payments               → 200, 2 items
// 4. POST /recurring-payments/:id/paid (rent)        → coinsEarned: 5400
// 5. POST /recurring-payments/:id/paid (electricity) → coinsEarned: 660
// 6. Dashboard totalMonthlyBurn includes rent + electricity

jest.mock('../../middleware/auth.js', () => ({
  requireAuth: jest.fn((c: any, next: any) => {
    c.set('userId', 'usr_test_001')
    c.set('clerkId', 'clerk_test_001')
    return next()
  }),
}))

jest.mock('../../lib/queue.js', () => ({
  scheduleReminder: jest.fn().mockResolvedValue(undefined),
  cancelReminder: jest.fn().mockResolvedValue(undefined),
  enqueueCoinCredit: jest.fn().mockResolvedValue(undefined),
  reminderQueue: { add: jest.fn() },
  coinQueue: { add: jest.fn() },
}))

import { createTestApp, request, makeUser, makeRecurringPayment, step } from '../helpers/journey.js'
import { prisma } from '@subatone/db'

const db = prisma as any

const rent = makeRecurringPayment({
  id: 'rp_rent',
  name: 'Flat Rent',
  type: 'RENT',
  amount: 18000,
})

const electricity = makeRecurringPayment({
  id: 'rp_elec',
  name: 'BESCOM Electricity',
  type: 'UTILITY',
  amount: 2200,
})

describe('Journey 03 — Rent Tracking + 3× Coins', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(() => {
    app = createTestApp()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    db.user.findUnique.mockResolvedValue(makeUser())
    db.user.findUniqueOrThrow.mockResolvedValue(makeUser())
    db.coinLedger.create.mockResolvedValue({})
    db.user.update.mockResolvedValue({})
    db.userBadge.findMany.mockResolvedValue([])
  })

  it('Step 1: POST /recurring-payments adds rent ₹18,000', async () => {
    step('Priya adds her monthly rent as a recurring payment')

    db.recurringPayment.create.mockResolvedValue(rent)

    const { status, body } = await request(app, 'POST', '/api/v1/recurring-payments', {
      name: 'Flat Rent',
      type: 'rent',
      amount: 18000,
      dueDayOfMonth: 5,
    })

    expect(status).toBe(201)
    expect((body as any).data.name).toBe('Flat Rent')
    expect((body as any).data.amount).toBe(18000)
  })

  it('Step 2: POST /recurring-payments adds electricity bill ₹2,200', async () => {
    step('Priya adds her electricity bill')

    db.recurringPayment.create.mockResolvedValue(electricity)

    const { status, body } = await request(app, 'POST', '/api/v1/recurring-payments', {
      name: 'BESCOM Electricity',
      type: 'utility',
      amount: 2200,
      dueDayOfMonth: 10,
    })

    expect(status).toBe(201)
    expect((body as any).data.amount).toBe(2200)
  })

  it('Step 3: GET /recurring-payments lists both entries', async () => {
    step('Priya opens recurring payments → sees 2 entries')

    db.recurringPayment.findMany.mockResolvedValue([rent, electricity])
    db.recurringPayment.count.mockResolvedValue(2)

    const { status, body } = await request(app, 'GET', '/api/v1/recurring-payments')

    expect(status).toBe(200)
    expect((body as any).data).toHaveLength(2)
  })

  it('Step 4: POST /recurring-payments/rp_rent/paid earns 5400 coins (3× multiplier)', async () => {
    step('Rent paid → ₹18,000 ÷ 10 × 3 = 5,400 coins')

    db.recurringPayment.findFirst.mockResolvedValue(rent)
    db.recurringPayment.updateMany.mockResolvedValue({ count: 1 })
    db.recurringPayment.findMany.mockResolvedValue([rent])
    db.user.update.mockResolvedValue(makeUser({ coinBalance: 5500, coinLifetime: 5500 }))

    const { status, body } = await request(app, 'POST', '/api/v1/recurring-payments/rp_rent/paid')

    expect(status).toBe(200)
    expect((body as any).data.coinsEarned).toBe(5400)  // 18000/10 * 3
  })

  it('Step 5: POST /recurring-payments/rp_elec/paid earns 660 coins', async () => {
    step('Electricity bill paid → ₹2,200 ÷ 10 × 3 = 660 coins')

    db.recurringPayment.findFirst.mockResolvedValue(electricity)
    db.recurringPayment.updateMany.mockResolvedValue({ count: 1 })
    db.recurringPayment.findMany.mockResolvedValue([electricity])
    db.user.update.mockResolvedValue(makeUser({ coinBalance: 6160, coinLifetime: 6160 }))

    const { status, body } = await request(app, 'POST', '/api/v1/recurring-payments/rp_elec/paid')

    expect(status).toBe(200)
    expect((body as any).data.coinsEarned).toBe(660)  // 2200/10 * 3
  })

  it('Step 6: Dashboard monthly burn includes rent (₹18k) and electricity (₹2.2k)', async () => {
    step('Dashboard total: rent + electricity = ₹20,200')

    db.subscription.findMany.mockResolvedValue([])
    db.recurringPayment.findMany.mockResolvedValue([rent, electricity])

    const { status, body } = await request(app, 'GET', '/api/v1/dashboard')

    expect(status).toBe(200)
    expect((body as any).data.totalMonthlyBurn).toBe(20200)
  })
})
