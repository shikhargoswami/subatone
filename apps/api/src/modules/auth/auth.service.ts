// apps/api/src/modules/auth/auth.service.ts
// Business logic for user creation and lifecycle.

import { AuthRepository } from './auth.repository.js'
import { GamificationService } from '../gamification/gamification.service.js'
import { pinoLogger } from '../../lib/logger.js'
import type { UserProfile } from '@subatone/types'

export class AuthService {
  private repo = new AuthRepository()
  private gamification = new GamificationService()

  async syncUser(
    clerkId: string,
    expoPushToken?: string,
  ): Promise<{ user: UserProfile; isNewUser: boolean }> {
    const existing = await this.repo.findByClerkId(clerkId)

    if (existing) {
      // Update push token if changed
      if (expoPushToken && existing.expoPushToken !== expoPushToken) {
        await this.repo.updatePushToken(existing.id, expoPushToken)
        existing.expoPushToken = expoPushToken
      }
      return { user: this.toProfile(existing), isNewUser: false }
    }

    // First time: create profile
    const user = await this.repo.createUser({
      clerkId,
      ...(expoPushToken !== undefined ? { expoPushToken } : {}),
    })

    // Award sign-up bonus (100 coins) — fire and forget, don't block auth
    this.gamification
      .awardCoins(user.id, {
        delta: 100,
        type: 'EARN_SIGNUP_BONUS',
        description: 'Welcome bonus — 100 Suba Coins for joining!',
      })
      .catch((err) => pinoLogger.error({ err }, 'Failed to award signup bonus'))

    pinoLogger.info({ userId: user.id }, 'New user created')
    return { user: this.toProfile(user), isNewUser: true }
  }

  async initiateAccountDeletion(userId: string): Promise<Date> {
    const scheduledDeletionAt = new Date()
    scheduledDeletionAt.setDate(scheduledDeletionAt.getDate() + 30)

    await this.repo.softDeleteUser(userId, scheduledDeletionAt)

    pinoLogger.info({ userId, scheduledDeletionAt }, 'Account deletion initiated')
    return scheduledDeletionAt
  }

  // Strips sensitive DB fields before returning to client
  private toProfile(user: {
    id: string
    clerkId: string
    email: string | null
    phone: string | null
    name: string | null
    avatarUrl: string | null
    currency: string
    timezone: string
    city: string | null
    coinBalance: number
    coinLifetime: number
    tier: string
    streakDays: number
    streakMonths: number
    plan: string
    onboardingDone: boolean
    createdAt: Date
    expoPushToken?: string | null
  }): UserProfile {
    return {
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      phone: user.phone,
      name: user.name,
      avatarUrl: user.avatarUrl,
      currency: user.currency,
      timezone: user.timezone,
      city: user.city,
      coinBalance: user.coinBalance,
      coinLifetime: user.coinLifetime,
      tier: user.tier as UserProfile['tier'],
      streakDays: user.streakDays,
      streakMonths: user.streakMonths,
      plan: user.plan,
      onboardingDone: user.onboardingDone,
      createdAt: user.createdAt.toISOString(),
    }
  }
}
