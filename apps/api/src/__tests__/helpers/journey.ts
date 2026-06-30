// apps/api/src/__tests__/helpers/journey.ts
//
// ─────────────────────────────────────────────────────────────────────────────
// JOURNEY TEST HELPERS
// ─────────────────────────────────────────────────────────────────────────────
//
// Provides:
//   - createTestApp()   : Hono app with auth middleware bypassed
//   - api()             : typed fetch wrapper for the test app
//   - buildUser()       : factory for in-memory user state
//   - buildSubscription(): factory for subscription fixtures
//
// Auth is bypassed by replacing requireAuth with a middleware that injects a
// fixed userId and clerkId — no real Clerk JWT needed.
// DB calls are handled by the jest.mock('@subatone/db') from jest.setup.ts.
// Each journey test file resets mock return values in beforeEach.

import { createApp } from '../../app.js'

// ── Test user fixtures ────────────────────────────────────

export const TEST_USER_ID = 'usr_test_001'
export const TEST_CLERK_ID = 'clerk_test_001'
export const TEST_TOKEN = 'Bearer test-token'

// ── App factory ──────────────────────────────────────────

// We override the auth middleware module so requireAuth always succeeds.
// jest.mock is hoisted to the top of the test file, so each journey file
// calls jest.mock('../../middleware/auth.js', ...) before importing createApp.
// This helper just provides the boilerplate app and request utilities.

export function createTestApp() {
  return createApp()
}

// ── Typed request helper ─────────────────────────────────

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE'

export async function request(
  app: ReturnType<typeof createApp>,
  method: Method,
  path: string,
  body?: unknown,
  headers?: Record<string, string>,
) {
  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: TEST_TOKEN,
      ...headers,
    },
  }
  if (body !== undefined) {
    init.body = JSON.stringify(body)
  }
  const res = await app.request(`http://localhost${path}`, init)
  const json = await res.json()
  return { status: res.status, body: json as Record<string, unknown> }
}

// ── DB fixture factories ──────────────────────────────────

export function makeUser(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: TEST_USER_ID,
    clerkId: TEST_CLERK_ID,
    email: 'testuser@subatone.in',
    phone: '+919876543210',
    name: 'Test User',
    avatarUrl: null,
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    city: null,
    coinBalance: 100,
    coinLifetime: 100,
    tier: 'ROOKIE',
    streakDays: 1,
    streakMonths: 0,
    plan: 'FREE',
    onboardingDone: false,
    deletedAt: null,
    expoPushToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function makeSubscription(overrides: Partial<Record<string, unknown>> = {}) {
  const nextRenewalDate = new Date(Date.now() + 15 * 86_400_000) // 15 days from now
  return {
    id: 'sub_test_001',
    userId: TEST_USER_ID,
    name: 'Netflix',
    category: 'OTT',
    amount: 649,
    currency: 'INR',
    billingCycle: 'MONTHLY',
    status: 'ACTIVE',
    startDate: new Date(),
    nextRenewalDate,
    trialEndDate: null,
    logoUrl: null,
    websiteUrl: null,
    notes: null,
    tags: [],
    isShared: false,
    libraryId: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function makeRecurringPayment(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'rp_test_001',
    userId: TEST_USER_ID,
    name: 'Flat Rent',
    type: 'RENT',
    amount: 15000,
    currency: 'INR',
    dueDayOfMonth: 1,
    nextDueDate: new Date(Date.now() + 5 * 86_400_000),
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function makeCoinLedgerEntry(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'ledger_001',
    userId: TEST_USER_ID,
    delta: 10,
    type: 'EARN_SUBSCRIPTION_ADDED',
    description: 'Added Netflix',
    subscriptionId: 'sub_test_001',
    recurringPaymentId: null,
    expiresAt: new Date(Date.now() + 365 * 86_400_000),
    createdAt: new Date(),
    ...overrides,
  }
}

// Pretty-print a journey step for readability in test output
export function step(label: string) {
  process.stdout.write(`\n  ► ${label}\n`)
}
