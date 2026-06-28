// apps/api/src/modules/reminders/reminders.service.ts
//
// ─────────────────────────────────────────────────────────────────────────────
// MODULE: Reminders
// ─────────────────────────────────────────────────────────────────────────────
//
// FUNCTIONAL SPEC
// ───────────────
// Current customer state:
//   User does not know when their subscriptions renew until the charge hits
//   their bank account — often days or weeks later.
//
// What we are changing:
//   Users receive a push notification N days before every renewal. They can
//   configure the advance notice (7/3/1 days). Reminders are scheduled as
//   delayed BullMQ jobs — reliable, retryable, and cancellable.
//
// How we are changing it:
//   - createReminders: creates DB records + enqueues BullMQ jobs
//   - cancelForSubscription: removes pending jobs + marks DB records as cancelled
//   - sendReminder: called by the worker, sends push via Expo

import { RemindersRepository } from './reminders.repository.js'
import { scheduleReminder, cancelReminder } from '../../lib/queue.js'
import { sendPushNotification } from '../../lib/push.js'
import { pinoLogger } from '../../lib/logger.js'
import { prisma } from '@subatone/db'

export class ReminderService {
  private repo = new RemindersRepository()

  async createReminders(
    userId: string,
    opts: {
      subscriptionId?: string
      recurringPaymentId?: string
      subscriptionName: string
      amount: number
      currency: string
      dueDate: Date
      daysBefore: number[]
    },
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { expoPushToken: true },
    })

    for (const days of opts.daysBefore) {
      const fireAt = new Date(opts.dueDate)
      fireAt.setDate(fireAt.getDate() - days)

      // Don't schedule reminders in the past
      if (fireAt <= new Date()) continue

      const reminder = await this.repo.create({
        userId,
        subscriptionId: opts.subscriptionId,
        recurringPaymentId: opts.recurringPaymentId,
        daysBefore: days,
        scheduledAt: fireAt,
      })

      await scheduleReminder(
        {
          reminderId: reminder.id,
          userId,
          subscriptionId: opts.subscriptionId,
          recurringPaymentId: opts.recurringPaymentId,
          subscriptionName: opts.subscriptionName,
          amount: opts.amount,
          currency: opts.currency,
          dueDate: opts.dueDate.toISOString(),
          daysBefore: days,
          expoPushToken: user?.expoPushToken,
        },
        fireAt,
      )
    }
  }

  async cancelForSubscription(subscriptionId: string): Promise<void> {
    const reminders = await this.repo.findPendingForSubscription(subscriptionId)
    for (const r of reminders) {
      await cancelReminder(r.id)
      await this.repo.markCancelled(r.id)
    }
  }

  async cancelForRecurringPayment(recurringPaymentId: string): Promise<void> {
    const reminders = await this.repo.findPendingForRecurringPayment(recurringPaymentId)
    for (const r of reminders) {
      await cancelReminder(r.id)
      await this.repo.markCancelled(r.id)
    }
  }

  // Called by the BullMQ worker when a job fires
  async sendReminder(data: {
    reminderId: string
    userId: string
    subscriptionName: string
    amount: number
    currency: string
    dueDate: string
    daysBefore: number
    expoPushToken?: string | null
  }): Promise<void> {
    const reminder = await this.repo.findById(data.reminderId)
    if (!reminder || reminder.isSent) return

    const currencySymbol = data.currency === 'INR' ? '₹' : data.currency
    const title = data.daysBefore === 0
      ? `${data.subscriptionName} renews today`
      : `${data.subscriptionName} renews in ${data.daysBefore} day${data.daysBefore > 1 ? 's' : ''}`
    const body = `${currencySymbol}${data.amount.toLocaleString('en-IN')} will be charged. Tap to view.`

    if (data.expoPushToken) {
      await sendPushNotification({
        to: data.expoPushToken,
        title,
        body,
        data: {
          type: 'RENEWAL_REMINDER',
          subscriptionId: data.userId,
          reminderId: data.reminderId,
        },
      })
    }

    await this.repo.markSent(data.reminderId)
    pinoLogger.info({ reminderId: data.reminderId, userId: data.userId }, 'Reminder sent')
  }
}
