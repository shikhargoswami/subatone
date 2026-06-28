// apps/api/src/modules/gamification/gamification.repository.ts
// Atomic DB operations for coin ledger, tiers, and badges.

import { prisma } from '@subatone/db'
import type { CoinEventType, BadgeSlug, UserTier } from '@prisma/client'
import type { CoinLedgerEntry, UserBadge } from '@subatone/types'

export class GamificationRepository {
  // Atomic coin credit — uses a transaction to update balance + write ledger
  async creditCoins(
    userId: string,
    opts: {
      delta: number
      type: CoinEventType
      description: string
      subscriptionId?: string
      recurringPaymentId?: string
    },
  ): Promise<number> {
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    const [, user] = await prisma.$transaction([
      prisma.coinLedger.create({
        data: {
          userId,
          delta: opts.delta,
          type: opts.type,
          description: opts.description,
          subscriptionId: opts.subscriptionId ?? null,
          recurringPaymentId: opts.recurringPaymentId ?? null,
          expiresAt,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          coinBalance: { increment: opts.delta },
          coinLifetime: { increment: opts.delta },
        },
        select: { coinBalance: true },
      }),
    ])

    return user.coinBalance
  }

  // Atomic coin deduction
  async deductCoins(
    userId: string,
    opts: { delta: number; type: CoinEventType; description: string },
  ): Promise<number> {
    const [, user] = await prisma.$transaction([
      prisma.coinLedger.create({
        data: {
          userId,
          delta: opts.delta,  // negative value
          type: opts.type,
          description: opts.description,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { coinBalance: { increment: opts.delta } },
        select: { coinBalance: true },
      }),
    ])

    return user.coinBalance
  }

  async getUserCoins(userId: string) {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        coinBalance: true,
        coinLifetime: true,
        tier: true,
        streakDays: true,
        streakMonths: true,
      },
    })
    return user
  }

  async getRecentLedger(userId: string, limit: number): Promise<CoinLedgerEntry[]> {
    const entries = await prisma.coinLedger.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return entries.map((e) => ({
      id: e.id,
      delta: e.delta,
      type: e.type,
      description: e.description,
      subscriptionId: e.subscriptionId,
      recurringPaymentId: e.recurringPaymentId,
      expiresAt: e.expiresAt?.toISOString() ?? null,
      createdAt: e.createdAt.toISOString(),
    }))
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const badges = await prisma.userBadge.findMany({
      where: { userId },
      orderBy: { earnedAt: 'asc' },
    })

    return badges.map((b) => ({
      id: b.id,
      badgeSlug: b.badgeSlug,
      earnedAt: b.earnedAt.toISOString(),
    }))
  }

  async awardBadge(userId: string, badgeSlug: BadgeSlug): Promise<void> {
    await prisma.userBadge.upsert({
      where: { userId_badgeSlug: { userId, badgeSlug } },
      create: { userId, badgeSlug },
      update: {},  // no-op if already exists
    })
  }

  async setTier(userId: string, tier: UserTier): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { tier },
    })
  }

  async incrementStreak(userId: string): Promise<{ streakMonths: number }> {
    const now = new Date()
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { streakMonths: true, streakDays: true, streakLastDate: true },
    })

    // Check if last streak update was last month (avoid double-counting)
    const isNewMonth =
      !user.streakLastDate ||
      user.streakLastDate.getMonth() !== now.getMonth() ||
      user.streakLastDate.getFullYear() !== now.getFullYear()

    if (!isNewMonth) {
      return { streakMonths: user.streakMonths }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        streakDays: { increment: 1 },
        streakMonths: { increment: 1 },
        streakLastDate: now,
      },
      select: { streakMonths: true },
    })

    return { streakMonths: updated.streakMonths }
  }

  async getSubscriptionCount(userId: string): Promise<number> {
    return prisma.subscription.count({
      where: { userId, deletedAt: null },
    })
  }
}
