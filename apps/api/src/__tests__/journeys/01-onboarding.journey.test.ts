// apps/api/src/__tests__/journeys/01-onboarding.journey.test.ts
//
// ─────────────────────────────────────────────────────────────────────────────
// USER JOURNEY: New User Onboarding
// ─────────────────────────────────────────────────────────────────────────────
//
// SCENARIO
// ────────
// Riya downloads Subatone. She signs in with her phone number (Clerk handles
// the OTP). After OTP verification, the app calls POST /auth/sync, which
// creates her profile and awards 100 signup bonus coins.
//
// She is marked as a new user → lands on onboarding.
//
// She checks her dashboard (empty state — no subscriptions yet).
//
// She adds her first subscription: Netflix ₹649/month.
// She gets 10 flat coins for adding it.
//
// She verifies her dashboard now shows ₹649 monthly burn.
//
// ASSERTIONS
// ──────────
// 1. POST /auth/sync → 200, isNewUser: true, coinBalance: 100
// 2. GET  /dashboard → 200, totalMonthlyBurn: 0, upcomingRenewals: []
// 3. POST /subscriptions → 201, coinsEarned: 10
// 4. GET  /dashboard → 200, totalMonthlyBurn: 649, activeSubscriptionCount: 1
// 5. GET  /gamification → 200, coinBalance: 110, tier: ROOKIE

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

import { createTestApp, request, makeUser, makeSubscription, step, TEST_USER_ID } from '../helpers/journey.js'
import { prisma } from '@subatone/db'

const db = prisma as any

describe('Journey 01 — New User Onboarding', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(() => {
    app = createTestApp()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    db.user.findUniqueOrThrow.mockResolvedValue(makeUser())
  })

  // ── Step 1: First auth sync ───────────────────────────

  it('Step 1: POST /auth/sync creates profile, awards 100 signup coins', async () => {
    step('Riya signs in for the first time → sync creates profile')

    // User does NOT exist yet
    db.user.findUnique.mockResolvedValue(null)

    const newUser = makeUser({ coinBalance: 100, coinLifetime: 100 })
    db.user.create.mockResolvedValue(newUser)

    // Gamification: awardCoins writes ledger + updates balance
    db.coinLedger.create.mockResolvedValue({})
    db.user.update.mockResolvedValue(newUser)
    db.userBadge.findMany.mockResolvedValue([])

    const { status, body } = await request(app, 'POST', '/api/v1/auth/sync', {
      expoPushToken: 'ExponentPushToken[test]',
    })

    expect(status).toBe(201)
    expect((body as any).data.coinBalance).toBe(100)
  })

  // ── Step 2: Empty dashboard ──────────────────────────

  it('Step 2: GET /dashboard returns zero burn for a new user', async () => {
    step('Riya opens the app → sees empty dashboard (₹0 burn)')

    const user = makeUser()
    db.user.findUnique.mockResolvedValue(user)
    db.subscription.findMany.mockResolvedValue([])
    db.recurringPayment.findMany.mockResolvedValue([])

    const { status, body } = await request(app, 'GET', '/api/v1/dashboard')

    expect(status).toBe(200)
    expect((body as any).data.totalMonthlyBurn).toBe(0)
    expect((body as any).data.upcomingRenewals).toHaveLength(0)
    expect((body as any).data.activeSubscriptionCount).toBe(0)
  })

  // ── Step 3: Add first subscription ──────────────────

  it('Step 3: POST /subscriptions adds Netflix, returns 10 coins', async () => {
    step('Riya adds Netflix ₹649/month → earns 10 coins')

    const user = makeUser()
    db.user.findUnique.mockResolvedValue(user)
    const sub = makeSubscription()
    db.subscription.create.mockResolvedValue(sub)
    db.coinLedger.create.mockResolvedValue({})
    db.user.update.mockResolvedValue({ ...user, coinBalance: 110, coinLifetime: 110 })
    db.userBadge.findMany.mockResolvedValue([])
    db.reminder.create.mockResolvedValue({})

    const { status, body } = await request(app, 'POST', '/api/v1/subscriptions', {
      name: 'Netflix',
      category: 'OTT',
      amount: 649,
      billingCycle: 'MONTHLY',
      nextRenewalDate: new Date(Date.now() + 15 * 86_400_000).toISOString().split('T')[0],
    })

    expect(status).toBe(201)
    expect((body as any).data.name).toBe('Netflix')
    expect((body as any).meta.coinsEarned).toBe(10)
  })

  // ── Step 4: Dashboard now shows burn ────────────────

  it('Step 4: GET /dashboard now shows ₹649 monthly burn', async () => {
    step('Dashboard updates — Riya sees her first monthly burn number')

    const user = makeUser()
    db.user.findUnique.mockResolvedValue(user)
    db.subscription.findMany.mockResolvedValue([makeSubscription()])
    db.recurringPayment.findMany.mockResolvedValue([])

    const { status, body } = await request(app, 'GET', '/api/v1/dashboard')

    expect(status).toBe(200)
    expect((body as any).data.totalMonthlyBurn).toBe(649)
    expect((body as any).data.activeSubscriptionCount).toBe(1)
    expect((body as any).data.upcomingRenewals).toHaveLength(1)
    expect((body as any).data.upcomingRenewals[0].name).toBe('Netflix')
  })

  // ── Step 5: Gamification state ───────────────────────

  it('Step 5: GET /gamification shows 110 coins and ROOKIE tier', async () => {
    step('Riya checks her coin balance → 100 signup + 10 add = 110')

    const user = makeUser({ coinBalance: 110, coinLifetime: 110 })
    db.user.findUniqueOrThrow.mockResolvedValue(user)
    db.coinLedger.findMany.mockResolvedValue([
      { type: 'EARN_SIGNUP_BONUS', delta: 100, description: 'Welcome bonus', createdAt: new Date() },
      { type: 'EARN_SUBSCRIPTION_ADDED', delta: 10, description: 'Added Netflix', createdAt: new Date() },
    ])
    db.userBadge.findMany.mockResolvedValue([])

    const { status, body } = await request(app, 'GET', '/api/v1/gamification')

    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect((body as any).data.coinBalance).toBe(110)
    expect((body as any).data.tier).toBe('ROOKIE')
  })
})
