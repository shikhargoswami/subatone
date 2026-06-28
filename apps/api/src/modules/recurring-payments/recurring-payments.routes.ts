// apps/api/src/modules/recurring-payments/recurring-payments.routes.ts
//
// Rent and utility recurring payment management.

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../../middleware/auth.js'
import { prisma } from '@subatone/db'
import { CreateRecurringPaymentSchema, UpdateRecurringPaymentSchema } from '@subatone/validators'
import { GamificationService } from '../gamification/gamification.service.js'
import { ReminderService } from '../reminders/reminders.service.js'

export const recurringPaymentRoutes = new Hono()
const gamification = new GamificationService()
const reminders = new ReminderService()

// Rent earn rate: 3 coins per ₹10 (3x standard)
const RENT_COIN_DIVISOR = 10
const RENT_COIN_MULTIPLIER = 3
const RENT_COIN_CAP = 10_000

recurringPaymentRoutes.use('*', requireAuth)

// GET /recurring-payments
recurringPaymentRoutes.get('/', async (c) => {
  const userId = c.get('userId')
  const payments = await prisma.recurringPayment.findMany({
    where: { userId, deletedAt: null },
    orderBy: { nextDueDate: 'asc' },
  })
  return c.json({ success: true, data: payments })
})

// POST /recurring-payments
recurringPaymentRoutes.post(
  '/',
  zValidator('json', CreateRecurringPaymentSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid data', details: result.error.flatten() } },
        422,
      )
    }
  }),
  async (c) => {
    const userId = c.get('userId')
    const body = c.req.valid('json')

    // Calculate next due date from dueDayOfMonth
    const now = new Date()
    const nextDue = new Date(now.getFullYear(), now.getMonth(), body.dueDayOfMonth)
    if (nextDue <= now) {
      nextDue.setMonth(nextDue.getMonth() + 1)
    }

    const payment = await prisma.recurringPayment.create({
      data: {
        userId,
        type: body.type,
        name: body.name,
        amount: body.amount,
        currency: body.currency ?? 'INR',
        dueDayOfMonth: body.dueDayOfMonth,
        nextDueDate: nextDue,
        payeeName: body.payeeName ?? null,
        upiId: body.upiId ?? null,
        notes: body.notes ?? null,
      },
    })

    // Schedule reminders
    reminders.createReminders(userId, {
      recurringPaymentId: payment.id,
      subscriptionName: payment.name,
      amount: payment.amount,
      currency: payment.currency,
      dueDate: nextDue,
      daysBefore: [7, 3, 1],
    }).catch(() => {})

    return c.json({ success: true, data: payment }, 201)
  },
)

// DELETE /recurring-payments/:id
recurringPaymentRoutes.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  const existing = await prisma.recurringPayment.findFirst({ where: { id, userId, deletedAt: null } })
  if (!existing) return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Not found' } }, 404)

  await prisma.recurringPayment.update({ where: { id }, data: { deletedAt: new Date() } })
  await reminders.cancelForRecurringPayment(id)

  return c.json({ success: true, data: null })
})

// POST /recurring-payments/:id/paid — mark rent as paid, earn 3x coins
recurringPaymentRoutes.post('/:id/paid', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  const payment = await prisma.recurringPayment.findFirst({ where: { id, userId, deletedAt: null } })
  if (!payment) return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Not found' } }, 404)

  const rawCoins = Math.floor((payment.amount / RENT_COIN_DIVISOR) * RENT_COIN_MULTIPLIER)
  const coinsEarned = Math.min(rawCoins, RENT_COIN_CAP)

  const newBalance = await gamification.awardCoins(userId, {
    delta: coinsEarned,
    type: 'EARN_RENT_PAID',
    description: `Paid ${payment.name} — earned ${coinsEarned} Suba Coins (3x rent rate!)`,
    recurringPaymentId: id,
  })

  // Advance next due date by 1 month
  const nextDue = new Date(payment.nextDueDate)
  nextDue.setMonth(nextDue.getMonth() + 1)
  await prisma.recurringPayment.update({ where: { id }, data: { nextDueDate: nextDue } })

  // Reschedule reminders
  reminders.cancelForRecurringPayment(id).then(() =>
    reminders.createReminders(userId, {
      recurringPaymentId: id,
      subscriptionName: payment.name,
      amount: payment.amount,
      currency: payment.currency,
      dueDate: nextDue,
      daysBefore: [7, 3, 1],
    }),
  ).catch(() => {})

  return c.json({ success: true, data: { coinsEarned, newBalance } })
})
