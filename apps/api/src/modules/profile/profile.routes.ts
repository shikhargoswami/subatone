// apps/api/src/modules/profile/profile.routes.ts
//
// Profile management: update name/currency/timezone, push token, onboarding flag.

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../../middleware/auth.js'
import { prisma } from '@subatone/db'
import { UpdateProfileSchema, CompleteProfileSchema } from '@subatone/validators'

export const profileRoutes = new Hono()

profileRoutes.use('*', requireAuth)

// GET /profile
profileRoutes.get('/', async (c) => {
  const userId = c.get('userId')
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true, clerkId: true, email: true, phone: true, name: true,
      avatarUrl: true, currency: true, timezone: true, city: true,
      coinBalance: true, coinLifetime: true, tier: true,
      streakDays: true, streakMonths: true, plan: true,
      onboardingDone: true, createdAt: true,
    },
  })
  return c.json({ success: true, data: { ...user, createdAt: user.createdAt.toISOString() } })
})

// PATCH /profile
profileRoutes.patch(
  '/',
  zValidator('json', UpdateProfileSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid profile data', details: result.error.flatten() } },
        422,
      )
    }
  }),
  async (c) => {
    const userId = c.get('userId')
    const body = c.req.valid('json')

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.currency !== undefined && { currency: body.currency }),
        ...(body.timezone !== undefined && { timezone: body.timezone }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.expoPushToken !== undefined && { expoPushToken: body.expoPushToken }),
        updatedAt: new Date(),
      },
      select: {
        id: true, name: true, currency: true, timezone: true, city: true,
        expoPushToken: true, updatedAt: true,
      },
    })

    return c.json({ success: true, data: updated })
  },
)

// POST /profile/complete-onboarding
// Marks onboarding as done after user adds their first subscription.
profileRoutes.post('/complete-onboarding', async (c) => {
  const userId = c.get('userId')
  await prisma.user.update({
    where: { id: userId },
    data: { onboardingDone: true },
  })
  return c.json({ success: true, data: { onboardingDone: true } })
})
