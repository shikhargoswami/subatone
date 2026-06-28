// apps/api/src/modules/subscriptions/subscriptions.service.ts
// Business logic: subscription CRUD, coin calculation, reminder scheduling.

import { SubscriptionsRepository } from './subscriptions.repository.js'
import { GamificationService } from '../gamification/gamification.service.js'
import { ReminderService } from '../reminders/reminders.service.js'
import { pinoLogger } from '../../lib/logger.js'
import type { UpdateSubscriptionInput, Subscription, PaginatedResponse } from '@subatone/types'
import type { CreateSubscriptionOutput } from '@subatone/validators'
import type { BillingCycle } from '@prisma/client'

// Coin earn rules (matches economics.md)
const COIN_EARN_DIVISOR = 10          // ₹10 = 1 coin
const ANNUAL_COIN_MULTIPLIER = 1.5
const COIN_PER_ADD = 10               // flat bonus for adding a new subscription

// Standard reminder days before renewal
const DEFAULT_REMINDER_DAYS = [7, 3, 1]

export class SubscriptionsService {
  private repo = new SubscriptionsRepository()
  private gamification = new GamificationService()
  private reminders = new ReminderService()

  async listSubscriptions(
    userId: string,
    opts: { page: number; pageSize: number; status?: string },
  ): Promise<PaginatedResponse<Subscription>> {
    return this.repo.findMany(userId, opts)
  }

  async getSubscription(userId: string, id: string): Promise<Subscription | null> {
    // Repository enforces userId = scope (IDOR prevention)
    return this.repo.findOne(userId, id)
  }

  async createSubscription(
    userId: string,
    input: CreateSubscriptionOutput,
  ): Promise<{ subscription: Subscription; coinsEarned: number }> {
    const subscription = await this.repo.create(userId, input)

    // Award add-bonus coins asynchronously
    const coinsEarned = COIN_PER_ADD
    this.gamification
      .awardCoins(userId, {
        delta: coinsEarned,
        type: 'EARN_SUBSCRIPTION_ADDED',
        description: `Added ${subscription.name} to your tracker`,
        subscriptionId: subscription.id,
      })
      .catch((err) => pinoLogger.error({ err }, 'Coin award failed after subscription create'))

    // Schedule reminders
    this.scheduleRemindersForSubscription(userId, subscription).catch((err) =>
      pinoLogger.error({ err }, 'Reminder scheduling failed'),
    )

    pinoLogger.info({ userId, subscriptionId: subscription.id }, 'Subscription created')
    return { subscription, coinsEarned }
  }

  async updateSubscription(
    userId: string,
    id: string,
    input: Partial<CreateSubscriptionOutput>,
  ): Promise<Subscription | null> {
    const existing = await this.repo.findOne(userId, id)
    if (!existing) return null

    const updated = await this.repo.update(userId, id, input)
    if (!updated) return null

    // If renewal date changed, reschedule reminders
    if (input.nextRenewalDate && input.nextRenewalDate !== existing.nextRenewalDate) {
      this.reminders
        .cancelForSubscription(id)
        .then(() => this.scheduleRemindersForSubscription(userId, updated))
        .catch((err) => pinoLogger.error({ err }, 'Reminder reschedule failed'))
    }

    return updated
  }

  async deleteSubscription(userId: string, id: string): Promise<boolean> {
    const existing = await this.repo.findOne(userId, id)
    if (!existing) return false

    await this.repo.softDelete(userId, id)
    await this.reminders.cancelForSubscription(id)

    pinoLogger.info({ userId, subscriptionId: id }, 'Subscription deleted')
    return true
  }

  async markAsPaid(
    userId: string,
    id: string,
  ): Promise<{ coinsEarned: number; newBalance: number } | null> {
    const subscription = await this.repo.findOne(userId, id)
    if (!subscription) return null

    // Calculate coins: amount / 10, with annual multiplier
    const isAnnual = subscription.billingCycle === 'ANNUALLY'
    const baseCoins = Math.floor(subscription.amount / COIN_EARN_DIVISOR)
    const coinsEarned = isAnnual
      ? Math.floor(baseCoins * ANNUAL_COIN_MULTIPLIER)
      : baseCoins

    const newBalance = await this.gamification.awardCoins(userId, {
      delta: coinsEarned,
      type: isAnnual ? 'EARN_ANNUAL_BONUS' : 'EARN_SUBSCRIPTION_PAID',
      description: `Paid ${subscription.name} — earned ${coinsEarned} Suba Coins`,
      subscriptionId: id,
    })

    // Advance the next renewal date
    const nextDate = this.advanceRenewalDate(
      new Date(subscription.nextRenewalDate),
      subscription.billingCycle as BillingCycle,
    )
    await this.repo.update(userId, id, { nextRenewalDate: nextDate.toISOString() })

    // Reschedule reminders for new date
    this.reminders
      .cancelForSubscription(id)
      .then(async () => {
        const updated = await this.repo.findOne(userId, id)
        if (updated) this.scheduleRemindersForSubscription(userId, updated)
      })
      .catch((err) => pinoLogger.error({ err }, 'Reminder reschedule after paid failed'))

    pinoLogger.info({ userId, subscriptionId: id, coinsEarned }, 'Subscription marked paid')
    return { coinsEarned, newBalance }
  }

  // ── Private Helpers ─────────────────────────────────────

  private async scheduleRemindersForSubscription(
    userId: string,
    subscription: Subscription,
  ): Promise<void> {
    const renewalDate = new Date(subscription.nextRenewalDate)
    // Only schedule reminders for future renewals
    if (renewalDate <= new Date()) return

    await this.reminders.createReminders(userId, {
      subscriptionId: subscription.id,
      subscriptionName: subscription.name,
      amount: subscription.amount,
      currency: subscription.currency,
      dueDate: renewalDate,
      daysBefore: DEFAULT_REMINDER_DAYS,
    })
  }

  private advanceRenewalDate(current: Date, cycle: BillingCycle): Date {
    const next = new Date(current)
    switch (cycle) {
      case 'WEEKLY':
        next.setDate(next.getDate() + 7)
        break
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1)
        break
      case 'QUARTERLY':
        next.setMonth(next.getMonth() + 3)
        break
      case 'HALF_YEARLY':
        next.setMonth(next.getMonth() + 6)
        break
      case 'ANNUALLY':
        next.setFullYear(next.getFullYear() + 1)
        break
      default:
        next.setMonth(next.getMonth() + 1)
    }
    return next
  }
}
