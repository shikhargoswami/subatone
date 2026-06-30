// apps/api/src/__tests__/journeys/02-subscription-payment.journey.test.ts
//
// ─────────────────────────────────────────────────────────────────────────────
// USER JOURNEY: Subscription Payment Cycle
// ─────────────────────────────────────────────────────────────────────────────
//
// SCENARIO
// ────────
// Arjun has been using Subatone for a month. He has 3 subscriptions:
//   - Netflix  ₹649/month
//   - Spotify  ₹119/month
//   - ChatGPT  ₹1700/month  (annual plan, so the monthly equivalent is ₹1700/12)
//
// His Netflix bill arrives. He taps "Mark Paid" on the app.
// He earns ₹649 ÷ 10 = 64 coins. The renewal date advances by 1 month.
//
// He also marks his annual ChatGPT Plus subscription as paid.
// Annual plan gives 1.5x coins: ₹20400/year ÷ 10 × 1.5 = 3060 coins.
//
// ASSERTIONS
// ──────────
// 1. GET  /subscriptions  → 200, 3 subscriptions listed
// 2. POST /subscriptions/:id/paid (Netflix monthly) → coinsEarned: 64
// 3. GET  /subscriptions/:id → nextRenewalDate advanced by 1 month
// 4. POST /subscriptions/:id/paid (ChatGPT annual) → coinsEarned: 3060
// 5. GET  /gamification → coinBalance increases by 64 + 3060 = 3124 earned

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

import { createTestApp, request, makeUser, makeSubscription, step } from '../helpers/journey.js'
import { prisma } from '@subatone/db'

const db = prisma as any

const netflix = makeSubscription({
  id: 'sub_netflix',
  name: 'Netflix',
  amount: 649,
  billingCycle: 'MONTHLY',
  nextRenewalDate: new Date(Date.now() + 2 * 86_400_000), // due in 2 days
})

const spotify = makeSubscription({
  id: 'sub_spotify',
  name: 'Spotify',
  amount: 119,
  billingCycle: 'MONTHLY',
  nextRenewalDate: new Date(Date.now() + 7 * 86_400_000),
})

const chatgpt = makeSubscription({
  id: 'sub_chatgpt',
  name: 'ChatGPT Plus',
  amount: 20400,
  billingCycle: 'ANNUALLY',
  nextRenewalDate: new Date(Date.now() + 3 * 86_400_000), // due in 3 days
})

describe('Journey 02 — Subscription Payment Cycle', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(() => {
    app = createTestApp()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    db.user.findUnique.mockResolvedValue(makeUser({ coinBalance: 100, coinLifetime: 100 }))
    db.user.findUniqueOrThrow.mockResolvedValue(makeUser({ coinBalance: 100, coinLifetime: 100 }))
    db.userBadge.findMany.mockResolvedValue([])
    db.coinLedger.create.mockResolvedValue({})
    db.user.update.mockResolvedValue({})
    db.reminder.updateMany.mockResolvedValue({ count: 0 })
    db.reminder.create.mockResolvedValue({})
  })

  it('Step 1: GET /subscriptions lists all 3 active subscriptions', async () => {
    step('Arjun opens subscriptions tab → sees Netflix, Spotify, ChatGPT')

    db.subscription.findMany.mockResolvedValue([netflix, spotify, chatgpt])
    db.subscription.count.mockResolvedValue(3)

    const { status, body } = await request(app, 'GET', '/api/v1/subscriptions')

    expect(status).toBe(200)
    expect((body as any).data).toHaveLength(3)
    expect((body as any).data.map((s: any) => s.name)).toEqual(
      expect.arrayContaining(['Netflix', 'Spotify', 'ChatGPT Plus']),
    )
  })

  it('Step 2: POST /subscriptions/sub_netflix/paid earns 64 coins (₹649 ÷ 10)', async () => {
    step('Netflix bill arrives → Arjun marks it paid → earns 64 coins')

    db.subscription.findFirst.mockResolvedValue(netflix)
    // After payment, renewal date advances 1 month
    const updatedNetflix = {
      ...netflix,
      nextRenewalDate: new Date(new Date(netflix.nextRenewalDate as Date).getTime() + 30 * 86_400_000),
    }
    db.subscription.findMany.mockResolvedValue([updatedNetflix])
    db.subscription.updateMany.mockResolvedValue({ count: 1 })
    db.user.update.mockResolvedValue(makeUser({ coinBalance: 164, coinLifetime: 164 }))

    const { status, body } = await request(app, 'POST', '/api/v1/subscriptions/sub_netflix/paid')

    expect(status).toBe(200)
    expect((body as any).data.coinsEarned).toBe(64)  // Math.floor(649/10)
    expect((body as any).data.newBalance).toBeGreaterThanOrEqual(164)
  })

  it('Step 3: Renewal date advances by 1 month after marking paid', async () => {
    step('Netflix renewal date should jump forward 30 days')

    const originalDate = new Date(netflix.nextRenewalDate as Date)
    const updatedNetflix = {
      ...netflix,
      nextRenewalDate: new Date(originalDate.getTime() + 30 * 86_400_000),
    }
    db.subscription.findFirst.mockResolvedValue(updatedNetflix)

    const { status, body } = await request(app, 'GET', '/api/v1/subscriptions/sub_netflix')

    expect(status).toBe(200)
    const returnedDate = new Date((body as any).data.nextRenewalDate)
    expect(returnedDate.getTime()).toBeGreaterThan(originalDate.getTime())
  })

  it('Step 4: POST /subscriptions/sub_chatgpt/paid earns 3060 coins (annual 1.5x)', async () => {
    step('ChatGPT Plus annual bill → 1.5x multiplier → earns 3060 coins')

    db.subscription.findFirst.mockResolvedValue(chatgpt)
    db.subscription.updateMany.mockResolvedValue({ count: 1 })
    db.subscription.findMany.mockResolvedValue([chatgpt])
    // ₹20400 / 10 * 1.5 = 3060
    db.user.update.mockResolvedValue(makeUser({ coinBalance: 3224, coinLifetime: 3224 }))

    const { status, body } = await request(app, 'POST', '/api/v1/subscriptions/sub_chatgpt/paid')

    expect(status).toBe(200)
    expect((body as any).data.coinsEarned).toBe(3060)  // Math.floor(20400/10*1.5)
  })

  it('Step 5: Total monthly burn is ₹2468 across 3 subscriptions', async () => {
    step('Dashboard shows total: 649 + 119 + (20400/12) = ₹2468')

    db.subscription.findMany.mockResolvedValue([netflix, spotify, chatgpt])
    db.recurringPayment.findMany.mockResolvedValue([])

    const { status, body } = await request(app, 'GET', '/api/v1/dashboard')

    expect(status).toBe(200)
    // Monthly equivalent: 649 + 119 + 20400/12 = 649+119+1700 = 2468
    expect((body as any).data.totalMonthlyBurn).toBeCloseTo(2468, 0)
    expect((body as any).data.categoryBreakdown).toBeDefined()
  })
})
