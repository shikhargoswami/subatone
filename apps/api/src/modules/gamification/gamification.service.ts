// apps/api/src/modules/gamification/gamification.service.ts
//
// ─────────────────────────────────────────────────────────────────────────────
// MODULE: Gamification — Coins, Streaks, Tiers, Badges
// ─────────────────────────────────────────────────────────────────────────────
//
// FUNCTIONAL SPEC
// ───────────────
// Current customer state:
//   User pays subscriptions every month with zero acknowledgement or reward.
//   There is no incentive to pay on time, to track consistently, or to
//   engage with the app between renewal events.
//
// What we are changing:
//   Every interaction with the payment lifecycle earns Suba Coins.
//   Consistent payment builds a streak. Streaks unlock badges.
//   Coin lifetime total determines tier — tiers are permanent (never demote).
//   All of this is visible, tangible, and creates loss aversion.
//
// How we are changing it:
//   - Atomic coin credit: balance update + ledger entry in one DB transaction
//   - Tier upgrade is automatic and fires immediately when threshold is crossed
//   - Badge evaluation runs after every coin award
//   - Streak is updated on every "mark as paid" event

import { GamificationRepository } from './gamification.repository.js'
import { pinoLogger } from '../../lib/logger.js'
import type { GamificationState, CoinLedgerEntry, UserBadge } from '@subatone/types'
import type { CoinEventType, BadgeSlug, UserTier } from '@prisma/client'

// Tier thresholds (lifetime coins earned)
const TIER_THRESHOLDS: Record<UserTier, number> = {
  ROOKIE: 0,
  REGULAR: 501,
  PRIME: 2001,
  ELITE: 10001,
  OBSIDIAN: 50001,
}

// Badge evaluation rules
type BadgeRule = {
  slug: BadgeSlug
  check: (state: { subscriptionCount: number; streakMonths: number; coinLifetime: number }) => boolean
}

const BADGE_RULES: BadgeRule[] = [
  { slug: 'FIRST_STEP',        check: (s) => s.subscriptionCount >= 1 },
  { slug: 'SUBSCRIPTION_NINJA',check: (s) => s.subscriptionCount >= 20 },
  { slug: 'WEEK_WARRIOR',      check: (s) => s.coinLifetime >= 100 },
  { slug: 'MONTH_MASTER',      check: (s) => s.streakMonths >= 1 },
  { slug: 'STREAK_6_MONTHS',   check: (s) => s.streakMonths >= 6 },
  { slug: 'STREAK_12_MONTHS',  check: (s) => s.streakMonths >= 12 },
]

export class GamificationService {
  private repo = new GamificationRepository()

  // ── Core: Award coins ─────────────────────────────────────
  // Returns the user's new coin balance.

  async awardCoins(
    userId: string,
    opts: {
      delta: number
      type: CoinEventType
      description: string
      subscriptionId?: string
      recurringPaymentId?: string
    },
  ): Promise<number> {
    if (opts.delta <= 0) {
      throw new Error('delta must be positive for award operations')
    }

    // Atomic: update balance + write ledger entry
    const newBalance = await this.repo.creditCoins(userId, opts)

    // Fire-and-forget: check for tier upgrade and badges
    this.checkAndUpgradeTier(userId).catch((err) =>
      pinoLogger.error({ err, userId }, 'Tier upgrade check failed'),
    )
    this.checkAndAwardBadges(userId).catch((err) =>
      pinoLogger.error({ err, userId }, 'Badge check failed'),
    )

    pinoLogger.info(
      { userId, delta: opts.delta, type: opts.type, newBalance },
      'Coins awarded',
    )

    return newBalance
  }

  // ── Redeem coins (internal feature unlock) ───────────────

  async redeemCoins(
    userId: string,
    opts: {
      delta: number   // positive number to deduct
      type: CoinEventType
      description: string
    },
  ): Promise<{ newBalance: number }> {
    const user = await this.repo.getUserCoins(userId)

    if (user.coinBalance < opts.delta) {
      throw new Error('INSUFFICIENT_COINS')
    }

    const newBalance = await this.repo.deductCoins(userId, {
      delta: -opts.delta,
      type: opts.type,
      description: opts.description,
    })

    return { newBalance }
  }

  // ── Streak update ─────────────────────────────────────────

  async updateStreak(userId: string): Promise<{ streakMonths: number; isNewMilestone: boolean }> {
    const result = await this.repo.incrementStreak(userId)

    // Award streak milestone coins
    let isNewMilestone = false
    const milestoneCoins: Record<number, number> = { 3: 100, 6: 250, 12: 500 }
    const bonus = milestoneCoins[result.streakMonths]

    if (bonus) {
      isNewMilestone = true
      await this.awardCoins(userId, {
        delta: bonus,
        type: 'EARN_STREAK_MILESTONE',
        description: `${result.streakMonths}-month streak milestone — ${bonus} Suba Coins!`,
      })
    }

    return { streakMonths: result.streakMonths, isNewMilestone }
  }

  // ── Get gamification state ────────────────────────────────

  async getState(userId: string): Promise<GamificationState> {
    const [user, ledger, badges] = await Promise.all([
      this.repo.getUserCoins(userId),
      this.repo.getRecentLedger(userId, 10),
      this.repo.getUserBadges(userId),
    ])

    const currentTierThreshold = TIER_THRESHOLDS[user.tier]
    const nextTier = this.getNextTier(user.tier)
    const nextTierThreshold = nextTier ? TIER_THRESHOLDS[nextTier] : null
    const coinsToNextTier = nextTierThreshold
      ? Math.max(0, nextTierThreshold - user.coinLifetime)
      : 0
    const tierProgress = nextTierThreshold
      ? Math.min(
          100,
          Math.round(
            ((user.coinLifetime - currentTierThreshold) /
              (nextTierThreshold - currentTierThreshold)) *
              100,
          ),
        )
      : 100

    return {
      coinBalance: user.coinBalance,
      coinLifetime: user.coinLifetime,
      tier: user.tier,
      tierProgress,
      coinsToNextTier,
      streakDays: user.streakDays,
      streakMonths: user.streakMonths,
      recentLedger: ledger,
      badges,
    }
  }

  // ── Private helpers ───────────────────────────────────────

  private async checkAndUpgradeTier(userId: string): Promise<void> {
    const user = await this.repo.getUserCoins(userId)
    const targetTier = this.computeTier(user.coinLifetime)

    if (targetTier !== user.tier) {
      await this.repo.setTier(userId, targetTier)
      pinoLogger.info({ userId, newTier: targetTier }, 'User tier upgraded')
    }
  }

  private async checkAndAwardBadges(userId: string): Promise<void> {
    const [user, existingBadges, subCount] = await Promise.all([
      this.repo.getUserCoins(userId),
      this.repo.getUserBadges(userId),
      this.repo.getSubscriptionCount(userId),
    ])

    const alreadyEarned = new Set(existingBadges.map((b) => b.badgeSlug))

    const state = {
      subscriptionCount: subCount,
      streakMonths: user.streakMonths,
      coinLifetime: user.coinLifetime,
    }

    for (const rule of BADGE_RULES) {
      if (!alreadyEarned.has(rule.slug) && rule.check(state)) {
        await this.repo.awardBadge(userId, rule.slug)
        pinoLogger.info({ userId, badge: rule.slug }, 'Badge awarded')
      }
    }
  }

  private computeTier(coinLifetime: number): UserTier {
    if (coinLifetime >= TIER_THRESHOLDS.OBSIDIAN) return 'OBSIDIAN'
    if (coinLifetime >= TIER_THRESHOLDS.ELITE) return 'ELITE'
    if (coinLifetime >= TIER_THRESHOLDS.PRIME) return 'PRIME'
    if (coinLifetime >= TIER_THRESHOLDS.REGULAR) return 'REGULAR'
    return 'ROOKIE'
  }

  private getNextTier(current: UserTier): UserTier | null {
    const order: UserTier[] = ['ROOKIE', 'REGULAR', 'PRIME', 'ELITE', 'OBSIDIAN']
    const idx = order.indexOf(current)
    return idx < order.length - 1 ? (order[idx + 1] ?? null) : null
  }
}
