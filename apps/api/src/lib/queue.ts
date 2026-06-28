// apps/api/src/lib/queue.ts
// BullMQ queues for async jobs: reminder scheduling, coin processing.

import { Queue, Worker, type Job } from 'bullmq'
import { redis } from './redis.js'
import { pinoLogger } from './logger.js'

// BullMQ accepts a Redis instance as connection — cast to any to avoid
// ConnectionOptions type mismatch from ioredis version differences.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const connection = redis as any

// ── Queue Definitions ──────────────────────────────────

export const reminderQueue = new Queue('reminders', {
  connection,
  defaultJobOptions: {
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  },
})

export const coinQueue = new Queue('coins', {
  connection,
  defaultJobOptions: {
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 200 },
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  },
})

// ── Job Payloads ───────────────────────────────────────

export interface ReminderJobData {
  reminderId: string
  userId: string
  subscriptionId?: string
  recurringPaymentId?: string
  subscriptionName: string
  amount: number
  currency: string
  dueDate: string
  daysBefore: number
  expoPushToken?: string | null
}

export interface CoinJobData {
  userId: string
  delta: number
  type: string
  description: string
  subscriptionId?: string
  recurringPaymentId?: string
}

// ── Queue Helpers ──────────────────────────────────────

export async function scheduleReminder(
  data: ReminderJobData,
  fireAt: Date,
): Promise<void> {
  const delay = Math.max(0, fireAt.getTime() - Date.now())
  await reminderQueue.add('send-reminder', data, {
    delay,
    jobId: `reminder:${data.reminderId}`,
    deduplication: { id: `reminder:${data.reminderId}` },
  })
  pinoLogger.info({ reminderId: data.reminderId, delay }, 'Reminder scheduled')
}

export async function enqueueCoinCredit(data: CoinJobData): Promise<void> {
  await coinQueue.add('credit-coins', data)
}

export async function cancelReminder(reminderId: string): Promise<void> {
  const job = await reminderQueue.getJob(`reminder:${reminderId}`)
  if (job) await job.remove()
}
