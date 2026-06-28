// apps/api/src/modules/auth/auth.routes.ts
//
// ─────────────────────────────────────────────────────────────────────────────
// MODULE: Authentication
// ─────────────────────────────────────────────────────────────────────────────
//
// FUNCTIONAL SPEC
// ───────────────
// Current customer state:
//   User has authenticated via Clerk (phone OTP or Google SSO) on the mobile app.
//   The Clerk SDK on mobile handles the OTP flow entirely. Our API never sees raw
//   credentials — only the signed JWT that Clerk issues after authentication.
//
// What we are changing:
//   The first time a user authenticates, they have no Subatone profile. This module
//   creates the profile, awards the sign-up bonus coins, and returns the full user
//   object to the mobile app in one round trip.
//
// How we are changing it:
//   POST /auth/sync — called after every Clerk sign-in. Idempotent. Creates the
//   user profile on first call; returns existing profile on subsequent calls.
//   POST /auth/delete — initiates account deletion (DPDP Act compliance).
//
// SECURITY
// ────────
// - All endpoints require a valid Clerk JWT (requireAuth middleware).
// - Account deletion uses soft-delete; hard delete runs after 30-day grace period.
// - Rate limit: 10 requests / minute per IP (auth tier).
//
// USER STORY
// ──────────
// "As a new user, when I sign in with my phone number, I want my profile to be
//  created automatically so that I can start tracking subscriptions immediately."

import { Hono } from 'hono'
import { requireAuth } from '../../middleware/auth.js'
import { AuthService } from './auth.service.js'

export const authRoutes = new Hono()
const authService = new AuthService()

// ── POST /auth/sync ──────────────────────────────────────
// Creates user profile on first auth; returns existing profile on re-auth.
//
// Request:  Headers: Authorization: Bearer <clerk_jwt>
//           Body: { expoPushToken?: string }
// Response: 200 { success: true, data: UserProfile, meta: { isNewUser: boolean } }
// Auth:     Required (Clerk JWT)
// Rate limit: 10/min per IP

authRoutes.post('/sync', requireAuth, async (c) => {
  const clerkId = c.get('clerkId')
  const body = await c.req.json().catch(() => ({})) as { expoPushToken?: string }

  const { user, isNewUser } = await authService.syncUser(clerkId, body.expoPushToken)

  return c.json(
    { success: true, data: user, meta: { isNewUser } },
    isNewUser ? 201 : 200,
  )
})

// ── DELETE /auth/account ─────────────────────────────────
// Initiates soft delete. User data is purged after 30-day grace period.
//
// Response: 200 { success: true, data: { scheduledDeletionAt: string } }
// Auth:     Required

authRoutes.delete('/account', requireAuth, async (c) => {
  const userId = c.get('userId')
  const scheduledDeletionAt = await authService.initiateAccountDeletion(userId)

  return c.json({
    success: true,
    data: {
      message: 'Account deletion scheduled. You have 30 days to cancel this.',
      scheduledDeletionAt: scheduledDeletionAt.toISOString(),
    },
  })
})
