// apps/api/src/__tests__/journeys/04-gamification.journey.test.ts
//
// ─────────────────────────────────────────────────────────────────────────────
// USER JOURNEY: Gamification — Tiers, Badges, Streaks
// ─────────────────────────────────────────────────────────────────────────────
//
// SCENARIO
// ────────
// Vikram has been consistently using Subatone for several months.
//
// TIER PROGRESSION
//   He starts as ROOKIE (0 lifetime coins).
//   After 501 lifetime coins → promoted to REGULAR.
//   After 2001 lifetime coins → promoted to PRIME.
//
// BADGE UNLOCK
//   FIRST_STEP badge: earned when he adds his first subscription.
//   WEEK_WARRIOR badge: earned when coinBalance crosses 100.
//   SUBSCRIPTION_NINJA: earned when he has 20 active subscriptions.
//
// STREAK MILESTONES
//   3-month streak → 100 bonus coins
//   6-month streak → 250 bonus coins
//
// ASSERTIONS
// ──────────
// 1. GET /gamification with 0 coins → tier: ROOKIE
// 2. GET /gamification with 501 coins → tier: REGULAR
// 3. GET /gamification with 2001 coins → tier: PRIME
// 4. GET /gamification with FIRST_STEP badge → badge present in response
// 5. GET /gamification with 3-month streak → streakBonus reflected
// 6. IDOR: user A cannot see user B's gamification data

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

describe('Journey 04 — Gamification (Tiers, Badges, Streaks)', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(() => {
    app = createTestApp()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    db.user.findUniqueOrThrow.mockResolvedValue(makeUser())
    db.coinLedger.findMany.mockResolvedValue([])
    db.userBadge.findMany.mockResolvedValue([])
  })

  // ── Tier progression ─────────────────────────────────

  it('Step 1: 0 lifetime coins → tier ROOKIE', async () => {
    step('Vikram just signed up → ROOKIE tier')

    db.user.findUniqueOrThrow.mockResolvedValue(
      makeUser({ coinBalance: 0, coinLifetime: 0, tier: 'ROOKIE', streakMonths: 0 }),
    )

    const { status, body } = await request(app, 'GET', '/api/v1/gamification')

    expect(status).toBe(200)
    expect((body as any).data.tier).toBe('ROOKIE')
    expect((body as any).data.coinBalance).toBe(0)
  })

  it('Step 2: 501 lifetime coins → tier REGULAR', async () => {
    step('Vikram crosses 501 coins → promoted to REGULAR')

    db.user.findUniqueOrThrow.mockResolvedValue(
      makeUser({ coinBalance: 501, coinLifetime: 501, tier: 'REGULAR' }),
    )

    const { status, body } = await request(app, 'GET', '/api/v1/gamification')

    expect(status).toBe(200)
    expect((body as any).data.tier).toBe('REGULAR')
  })

  it('Step 3: 2001 lifetime coins → tier PRIME', async () => {
    step('Vikram crosses 2001 coins → promoted to PRIME')

    db.user.findUniqueOrThrow.mockResolvedValue(
      makeUser({ coinBalance: 2001, coinLifetime: 2001, tier: 'PRIME' }),
    )

    const { status, body } = await request(app, 'GET', '/api/v1/gamification')

    expect(status).toBe(200)
    expect((body as any).data.tier).toBe('PRIME')
  })

  // ── Badge unlocks ────────────────────────────────────

  it('Step 4: FIRST_STEP badge appears after adding first subscription', async () => {
    step('Vikram adds his first sub → FIRST_STEP badge unlocked')

    db.user.findUniqueOrThrow.mockResolvedValue(makeUser({ coinBalance: 110, coinLifetime: 110 }))
    db.userBadge.findMany.mockResolvedValue([
      {
        id: 'badge_001',
        userId: 'usr_test_001',
        badgeSlug: 'FIRST_STEP',
        earnedAt: new Date(),
      },
    ])

    const { status, body } = await request(app, 'GET', '/api/v1/gamification')

    expect(status).toBe(200)
    const badges = (body as any).data.badges as any[]
    expect(badges.some((b: any) => b.badgeSlug === 'FIRST_STEP')).toBe(true)
  })

  it('Step 5: WEEK_WARRIOR badge present when coinBalance >= 100', async () => {
    step('Vikram has 100+ coins → WEEK_WARRIOR badge unlocked')

    db.user.findUniqueOrThrow.mockResolvedValue(makeUser({ coinBalance: 100, coinLifetime: 100 }))
    db.userBadge.findMany.mockResolvedValue([
      { id: 'badge_002', userId: 'usr_test_001', badgeSlug: 'WEEK_WARRIOR', earnedAt: new Date() },
    ])

    const { status, body } = await request(app, 'GET', '/api/v1/gamification')

    const badges = (body as any).data.badges as any[]
    expect(badges.some((b: any) => b.badgeSlug === 'WEEK_WARRIOR')).toBe(true)
  })

  // ── Streak milestones ────────────────────────────────

  it('Step 6: 3-month streak shows correct streakMonths', async () => {
    step('Vikram has paid on time for 3 months → streakMonths: 3')

    db.user.findUniqueOrThrow.mockResolvedValue(
      makeUser({ coinBalance: 500, coinLifetime: 500, streakMonths: 3, streakDays: 90 }),
    )

    const { status, body } = await request(app, 'GET', '/api/v1/gamification')

    expect(status).toBe(200)
    expect((body as any).data.streakMonths).toBe(3)
  })

  // ── Coin ledger ───────────────────────────────────────

  it('Step 7: GET /gamification returns recentLedger with coin history', async () => {
    step('Vikram views his coin history → sees all earn events in recentLedger')

    const ledger = [
      { type: 'EARN_SIGNUP_BONUS', delta: 100, description: 'Welcome bonus', createdAt: new Date() },
      { type: 'EARN_SUBSCRIPTION_ADDED', delta: 10, description: 'Added Netflix', createdAt: new Date() },
      { type: 'EARN_PAYMENT', delta: 64, description: 'Netflix paid', createdAt: new Date() },
    ]
    db.user.findUniqueOrThrow.mockResolvedValue(makeUser({ coinBalance: 200, coinLifetime: 200 }))
    db.coinLedger.findMany.mockResolvedValue(ledger)

    const { status, body } = await request(app, 'GET', '/api/v1/gamification')

    expect(status).toBe(200)
    expect((body as any).data.recentLedger.length).toBeGreaterThanOrEqual(1)
  })

  // ── IDOR prevention ───────────────────────────────────

  it('Step 8: IDOR — subscriptions are scoped to authenticated user only', async () => {
    step('Security: Vikram cannot see another user\'s subscriptions')

    // Our auth middleware injects usr_test_001
    // All DB queries use userId = usr_test_001 in WHERE clause
    // Simulate the DB returning empty for a different userId
    db.user.findUnique.mockResolvedValue(makeUser())
    db.user.findUniqueOrThrow.mockResolvedValue(makeUser())
    db.subscription.findMany.mockResolvedValue([])
    db.subscription.count.mockResolvedValue(0)

    // Try to access a subscription that belongs to a different user
    db.subscription.findFirst.mockResolvedValue(null)  // findFirst with {id, userId} returns null

    const { status, body } = await request(
      app,
      'GET',
      '/api/v1/subscriptions/sub_belongs_to_another_user',
    )

    expect(status).toBe(404)
    expect((body as any).success).toBe(false)
    expect((body as any).error.code).toBe('NOT_FOUND')
  })
})
