// apps/api/src/modules/dashboard/dashboard.routes.ts
//
// ─────────────────────────────────────────────────────────────────────────────
// MODULE: Dashboard
// ─────────────────────────────────────────────────────────────────────────────
//
// FUNCTIONAL SPEC
// ───────────────
// Current customer state:
//   User has no single view of their total recurring financial burden.
//   They discover spend only after money leaves their account.
//
// What we are changing:
//   The dashboard computes and returns, in a single API call:
//   - Total monthly and annual burn
//   - Upcoming renewals (next 30 days)
//   - Category breakdown
//   - Coin balance and streak (for gamification)
//
// This is the "revelation moment" screen — the number that hooks the user.

import { Hono } from 'hono'
import { requireAuth } from '../../middleware/auth.js'
import { prisma } from '@subatone/db'
import type { DashboardSummary, UpcomingRenewal, CategoryBreakdown } from '@subatone/types'

export const dashboardRoutes = new Hono()

dashboardRoutes.use('*', requireAuth)

// GET /dashboard
dashboardRoutes.get('/', async (c) => {
  const userId = c.get('userId')

  const [subscriptions, recurringPayments, user] = await Promise.all([
    prisma.subscription.findMany({
      where: { userId, status: { in: ['ACTIVE', 'TRIAL'] }, deletedAt: null },
      select: {
        id: true, name: true, amount: true, currency: true,
        billingCycle: true, nextRenewalDate: true, category: true, logoUrl: true,
      },
    }),
    prisma.recurringPayment.findMany({
      where: { userId, deletedAt: null },
      select: {
        id: true, name: true, amount: true, currency: true,
        nextDueDate: true, type: true,
      },
    }),
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { coinBalance: true, streakMonths: true, tier: true, currency: true },
    }),
  ])

  const now = new Date()
  const thirtyDaysLater = new Date(now)
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)

  // ── Monthly burn calculation ──────────────────────────────
  // Normalise all subscriptions to monthly equivalent

  const cycleToMonthlyFactor: Record<string, number> = {
    WEEKLY: 4.33,
    MONTHLY: 1,
    QUARTERLY: 1 / 3,
    HALF_YEARLY: 1 / 6,
    ANNUALLY: 1 / 12,
    CUSTOM: 1,
  }

  let totalMonthlyBurn = 0
  for (const sub of subscriptions) {
    const factor = cycleToMonthlyFactor[sub.billingCycle] ?? 1
    totalMonthlyBurn += sub.amount * factor
  }

  // Recurring payments are always monthly
  for (const rp of recurringPayments) {
    totalMonthlyBurn += rp.amount
  }

  const totalAnnualBurn = totalMonthlyBurn * 12

  // ── Upcoming renewals ─────────────────────────────────────

  const upcomingRenewals: UpcomingRenewal[] = [
    ...subscriptions
      .filter((s) => new Date(s.nextRenewalDate) <= thirtyDaysLater)
      .map((s) => ({
        id: s.id,
        name: s.name,
        amount: s.amount,
        currency: s.currency,
        nextRenewalDate: s.nextRenewalDate.toISOString(),
        daysUntilRenewal: Math.ceil(
          (new Date(s.nextRenewalDate).getTime() - now.getTime()) / 86400_000,
        ),
        logoUrl: s.logoUrl,
        type: 'subscription' as const,
      })),
    ...recurringPayments
      .filter((rp) => new Date(rp.nextDueDate) <= thirtyDaysLater)
      .map((rp) => ({
        id: rp.id,
        name: rp.name,
        amount: rp.amount,
        currency: rp.currency,
        nextRenewalDate: rp.nextDueDate.toISOString(),
        daysUntilRenewal: Math.ceil(
          (new Date(rp.nextDueDate).getTime() - now.getTime()) / 86400_000,
        ),
        logoUrl: null,
        type: 'recurring' as const,
      })),
  ].sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal)

  // ── Category breakdown ────────────────────────────────────

  const categoryTotals = new Map<string, { total: number; count: number }>()
  for (const sub of subscriptions) {
    const entry = categoryTotals.get(sub.category) ?? { total: 0, count: 0 }
    const factor = cycleToMonthlyFactor[sub.billingCycle] ?? 1
    entry.total += sub.amount * factor
    entry.count++
    categoryTotals.set(sub.category, entry)
  }

  const categoryBreakdown: CategoryBreakdown[] = Array.from(categoryTotals.entries())
    .map(([category, { total, count }]) => ({
      category,
      totalAmount: Math.round(total),
      count,
      percentage:
        totalMonthlyBurn > 0 ? Math.round((total / totalMonthlyBurn) * 100) : 0,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)

  const summary: DashboardSummary = {
    totalMonthlyBurn: Math.round(totalMonthlyBurn),
    totalAnnualBurn: Math.round(totalAnnualBurn),
    currency: user.currency,
    activeSubscriptionCount: subscriptions.length,
    upcomingRenewals,
    categoryBreakdown,
    coinBalance: user.coinBalance,
    streakMonths: user.streakMonths,
    tier: user.tier,
  }

  return c.json({ success: true, data: summary })
})
