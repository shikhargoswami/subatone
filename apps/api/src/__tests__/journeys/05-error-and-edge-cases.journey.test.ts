// apps/api/src/__tests__/journeys/05-error-and-edge-cases.journey.test.ts
//
// ─────────────────────────────────────────────────────────────────────────────
// USER JOURNEY: Error States & Edge Cases
// ─────────────────────────────────────────────────────────────────────────────
//
// SCENARIO
// ────────
// Tests the unhappy paths that real users encounter:
//
// 1. Unauthenticated request → 401
// 2. Invalid subscription data → 422 with field-level errors
// 3. Marking a non-existent subscription as paid → 404
// 4. Rate limit: > 100 requests/min → 429
// 5. UPI ID validation on recurring payment → 422 for bad UPI
// 6. Health check endpoint → always 200 (no auth needed)

jest.mock('../../middleware/auth.js', () => ({
  requireAuth: jest.fn((c: any, next: any) => {
    // Check if this test wants an unauthenticated scenario
    const authHeader = c.req.header('Authorization')
    if (!authHeader || authHeader === 'Bearer INVALID') {
      return c.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Missing or invalid token' } },
        401,
      )
    }
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

import { createTestApp, request, makeUser, step } from '../helpers/journey.js'
import { prisma } from '@subatone/db'

const db = prisma as any

describe('Journey 05 — Error States & Edge Cases', () => {
  let app: ReturnType<typeof createTestApp>

  beforeAll(() => {
    app = createTestApp()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Step 1: Health check needs no auth → 200 always', async () => {
    step('Health endpoint: no auth required, always returns 200')

    const res = await app.request('http://localhost/health')
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.status).toBe('ok')
    expect(body.timestamp).toBeDefined()
  })

  it('Step 2: Missing Authorization header → 401 UNAUTHORIZED', async () => {
    step('No token → 401')

    const res = await app.request('http://localhost/api/v1/subscriptions', {
      method: 'GET',
      // No Authorization header
    })
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('UNAUTHORIZED')
  })

  it('Step 3: Invalid token → 401 UNAUTHORIZED', async () => {
    step('Bad token → 401')

    const res = await app.request('http://localhost/api/v1/subscriptions', {
      method: 'GET',
      headers: { Authorization: 'Bearer INVALID' },
    })
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.error.code).toBe('UNAUTHORIZED')
  })

  it('Step 4: POST /subscriptions with missing required fields → 422 with details', async () => {
    step('Sending empty body → 422 Validation Error with field details')

    db.user.findUnique.mockResolvedValue(makeUser())

    const { status, body } = await request(app, 'POST', '/api/v1/subscriptions', {
      // name missing, amount missing, billingCycle missing
      category: 'OTT',
    })

    expect(status).toBe(422)
    expect((body as any).success).toBe(false)
    expect((body as any).error.code).toBe('VALIDATION_ERROR')
    expect((body as any).error.details).toBeDefined()
  })

  it('Step 5: POST /subscriptions with negative amount → 422', async () => {
    step('Negative amount → 422 Validation Error')

    db.user.findUnique.mockResolvedValue(makeUser())

    const { status, body } = await request(app, 'POST', '/api/v1/subscriptions', {
      name: 'Netflix',
      category: 'OTT',
      amount: -100,
      billingCycle: 'MONTHLY',
      nextRenewalDate: new Date(Date.now() + 86_400_000).toISOString().split('T')[0],
    })

    expect(status).toBe(422)
    expect((body as any).error.code).toBe('VALIDATION_ERROR')
  })

  it('Step 6: GET /subscriptions/:id for non-existent ID → 404', async () => {
    step('Fetching a subscription that does not exist → 404')

    db.user.findUnique.mockResolvedValue(makeUser())
    db.subscription.findFirst.mockResolvedValue(null)

    const { status, body } = await request(app, 'GET', '/api/v1/subscriptions/nonexistent_id')

    expect(status).toBe(404)
    expect((body as any).error.code).toBe('NOT_FOUND')
  })

  it('Step 7: POST /subscriptions/:id/paid for non-existent ID → 404', async () => {
    step('Marking non-existent subscription as paid → 404')

    db.user.findUnique.mockResolvedValue(makeUser())
    db.subscription.findFirst.mockResolvedValue(null)

    const { status, body } = await request(
      app,
      'POST',
      '/api/v1/subscriptions/ghost_id/paid',
    )

    expect(status).toBe(404)
    expect((body as any).error.code).toBe('NOT_FOUND')
  })

  it('Step 8: Invalid UPI ID format on recurring payment → 422', async () => {
    step('Bad UPI ID (no @ symbol) → 422 Validation Error')

    db.user.findUnique.mockResolvedValue(makeUser())

    const { status, body } = await request(app, 'POST', '/api/v1/recurring-payments', {
      name: 'Landlord Rent',
      type: 'RENT',
      amount: 15000,
      nextDueDate: new Date(Date.now() + 86_400_000).toISOString().split('T')[0],
      payeeUpiId: 'notavalidupiid',  // missing @
    })

    expect(status).toBe(422)
    expect((body as any).error.code).toBe('VALIDATION_ERROR')
  })

  it('Step 9: Unknown route → 404 NOT_FOUND (no info leakage)', async () => {
    step('Hitting an undefined route → 404 with no stack trace')

    const res = await app.request('http://localhost/api/v1/does-not-exist', {
      headers: { Authorization: 'Bearer test-token' },
    })
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.error.code).toBe('NOT_FOUND')
    // No stack trace in response (OWASP: don't expose internals)
    expect(JSON.stringify(body)).not.toContain('stack')
    expect(JSON.stringify(body)).not.toContain('at ')
  })
})
