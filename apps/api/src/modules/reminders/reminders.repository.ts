// apps/api/src/modules/reminders/reminders.repository.ts

import { prisma } from '@subatone/db'

export class RemindersRepository {
  async create(data: {
    userId: string
    subscriptionId?: string
    recurringPaymentId?: string
    daysBefore: number
    scheduledAt: Date
  }) {
    return prisma.reminder.create({
      data: {
        userId: data.userId,
        subscriptionId: data.subscriptionId ?? null,
        recurringPaymentId: data.recurringPaymentId ?? null,
        daysBefore: data.daysBefore,
        channels: ['PUSH'],
        scheduledAt: data.scheduledAt,
      },
    })
  }

  async findById(id: string) {
    return prisma.reminder.findUnique({ where: { id } })
  }

  async findPendingForSubscription(subscriptionId: string) {
    return prisma.reminder.findMany({
      where: { subscriptionId, isSent: false },
    })
  }

  async findPendingForRecurringPayment(recurringPaymentId: string) {
    return prisma.reminder.findMany({
      where: { recurringPaymentId, isSent: false },
    })
  }

  async markSent(id: string) {
    return prisma.reminder.update({
      where: { id },
      data: { isSent: true, sentAt: new Date() },
    })
  }

  async markCancelled(id: string) {
    return prisma.reminder.update({
      where: { id },
      data: { isSent: true, failureReason: 'CANCELLED' },
    })
  }
}
