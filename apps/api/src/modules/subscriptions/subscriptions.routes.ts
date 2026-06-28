// apps/api/src/modules/subscriptions/subscriptions.routes.ts
//
// ─────────────────────────────────────────────────────────────────────────────
// MODULE: Subscription Management
// ─────────────────────────────────────────────────────────────────────────────
//
// FUNCTIONAL SPEC
// ───────────────
// Current customer state:
//   User has no record of their subscriptions. They pay Netflix, Jio, ChatGPT,
//   and gym membership every month from memory, and occasionally discover they
//   are paying for services they forgot about.
//
// What we are changing:
//   Users can now maintain a live, accurate register of every subscription.
//   Every add/edit is reflected immediately on the dashboard. The system knows
//   upcoming renewal dates and can trigger reminders.
//
// How we are changing it:
//   Full CRUD for subscriptions with:
//   - Server-side validation (Zod)
//   - Automatic reminder scheduling on create/update
//   - Coin award on subscription creation (10 coins)
//   - Soft delete (data is preserved for analytics)
//   - IDOR prevention: every query is scoped to the authenticated userId
//
// USER STORY
// ──────────
// "As a user, I want to add my Netflix subscription so that I can see it in my
//  dashboard and receive a reminder 3 days before it renews."
//
// API CONTRACTS
// ─────────────
// GET    /subscriptions         → list all active subscriptions
// POST   /subscriptions         → create a subscription
// GET    /subscriptions/:id     → get single subscription
// PATCH  /subscriptions/:id     → update subscription
// DELETE /subscriptions/:id     → soft delete
// POST   /subscriptions/:id/paid → mark as manually paid (awards coins)

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAuth } from '../../middleware/auth.js'
import { SubscriptionsService } from './subscriptions.service.js'
import { CreateSubscriptionSchema, UpdateSubscriptionSchema, PaginationQuerySchema } from '@subatone/validators'

export const subscriptionRoutes = new Hono()
const service = new SubscriptionsService()

// All subscription routes require auth
subscriptionRoutes.use('*', requireAuth)

// ── GET /subscriptions ───────────────────────────────────
// Returns all non-deleted subscriptions for the authenticated user.
//
// Query:  ?status=ACTIVE|TRIAL|PAUSED|CANCELLED&page=1&pageSize=20
// Response: 200 { success: true, data: Subscription[], meta: PaginationMeta }

subscriptionRoutes.get(
  '/',
  zValidator('query', PaginationQuerySchema.extend({
    status: z.enum(['ACTIVE', 'TRIAL', 'PAUSED', 'CANCELLED']).optional(),
  })),
  async (c) => {
    const userId = c.get('userId')
    const { page, pageSize, status } = c.req.valid('query')

    const result = await service.listSubscriptions(userId, { page, pageSize, status })

    return c.json({ success: true, data: result.items, meta: result.pagination })
  },
)

// ── POST /subscriptions ──────────────────────────────────
// Creates a new subscription and schedules reminders.
//
// Body: CreateSubscriptionInput (validated by Zod)
// Response: 201 { success: true, data: Subscription, meta: { coinsEarned: number } }

subscriptionRoutes.post(
  '/',
  zValidator('json', CreateSubscriptionSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid subscription data',
            details: result.error.flatten(),
          },
        },
        422,
      )
    }
  }),
  async (c) => {
    const userId = c.get('userId')
    const body = c.req.valid('json')

    const { subscription, coinsEarned } = await service.createSubscription(userId, body)

    return c.json({ success: true, data: subscription, meta: { coinsEarned } }, 201)
  },
)

// ── GET /subscriptions/:id ───────────────────────────────

subscriptionRoutes.get('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  const subscription = await service.getSubscription(userId, id)

  if (!subscription) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Subscription not found' } },
      404,
    )
  }

  return c.json({ success: true, data: subscription })
})

// ── PATCH /subscriptions/:id ─────────────────────────────

subscriptionRoutes.patch(
  '/:id',
  zValidator('json', UpdateSubscriptionSchema.omit({ id: true }), (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid update data',
            details: result.error.flatten(),
          },
        },
        422,
      )
    }
  }),
  async (c) => {
    const userId = c.get('userId')
    const id = c.req.param('id')
    const body = c.req.valid('json')

    const subscription = await service.updateSubscription(userId, id, body)

    if (!subscription) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Subscription not found' } },
        404,
      )
    }

    return c.json({ success: true, data: subscription })
  },
)

// ── DELETE /subscriptions/:id ────────────────────────────

subscriptionRoutes.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  const deleted = await service.deleteSubscription(userId, id)

  if (!deleted) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Subscription not found' } },
      404,
    )
  }

  return c.json({ success: true, data: null }, 200)
})

// ── POST /subscriptions/:id/paid ─────────────────────────
// Marks a subscription as manually paid for the current cycle.
// Awards Suba Coins based on amount and billing cycle.
//
// Response: 200 { success: true, data: { coinsEarned: number, newBalance: number } }

subscriptionRoutes.post('/:id/paid', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  const result = await service.markAsPaid(userId, id)

  if (!result) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Subscription not found' } },
      404,
    )
  }

  return c.json({ success: true, data: result })
})
