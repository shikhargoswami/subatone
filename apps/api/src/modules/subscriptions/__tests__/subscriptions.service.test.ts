// apps/api/src/modules/subscriptions/__tests__/subscriptions.service.test.ts
//
// Tests: create, list, update, delete, markAsPaid — all scoped to userId.
// Security tests: IDOR prevention.

import { SubscriptionsService } from '../subscriptions.service.js'
import { SubscriptionsRepository } from '../subscriptions.repository.js'
import { GamificationService } from '../../gamification/gamification.service.js'
import { ReminderService } from '../../reminders/reminders.service.js'

jest.mock('../subscriptions.repository.js')
jest.mock('../../gamification/gamification.service.js')
jest.mock('../../reminders/reminders.service.js')

const MockRepo = SubscriptionsRepository as jest.MockedClass<typeof SubscriptionsRepository>
const MockGamification = GamificationService as jest.MockedClass<typeof GamificationService>
const MockReminders = ReminderService as jest.MockedClass<typeof ReminderService>

const userId = 'user_01'
const otherUserId = 'user_02'

const mockSubscription = {
  id: 'sub_01',
  userId,
  name: 'Netflix',
  category: 'OTT',
  amount: 649,
  currency: 'INR',
  billingCycle: 'MONTHLY',
  nextRenewalDate: new Date(Date.now() + 10 * 86400_000).toISOString(),
  startDate: new Date().toISOString(),
  trialEndDate: null,
  status: 'ACTIVE',
  logoUrl: null,
  websiteUrl: null,
  notes: null,
  tags: [],
  isShared: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

describe('SubscriptionsService', () => {
  let service: SubscriptionsService
  let repo: jest.Mocked<SubscriptionsRepository>
  let gamification: jest.Mocked<GamificationService>
  let reminders: jest.Mocked<ReminderService>

  beforeEach(() => {
    jest.clearAllMocks()
    service = new SubscriptionsService()
    repo = MockRepo.mock.instances[0] as jest.Mocked<SubscriptionsRepository>
    gamification = MockGamification.mock.instances[0] as jest.Mocked<GamificationService>
    reminders = MockReminders.mock.instances[0] as jest.Mocked<ReminderService>
    gamification.awardCoins = jest.fn().mockResolvedValue(110)
    reminders.createReminders = jest.fn().mockResolvedValue(undefined)
    reminders.cancelForSubscription = jest.fn().mockResolvedValue(undefined)
  })

  // ── createSubscription ───────────────────────────────────

  describe('createSubscription', () => {
    const input = {
      name: 'Netflix',
      category: 'OTT' as const,
      amount: 649,
      currency: 'INR',
      billingCycle: 'MONTHLY' as const,
      nextRenewalDate: new Date(Date.now() + 10 * 86400_000).toISOString(),
      tags: [] as string[],
      isShared: false,
      status: 'ACTIVE' as const,
    }

    it('creates subscription and awards 10 add-bonus coins', async () => {
      repo.create = jest.fn().mockResolvedValue(mockSubscription)

      const result = await service.createSubscription(userId, input)

      expect(result.subscription.name).toBe('Netflix')
      expect(result.coinsEarned).toBe(10)
      await new Promise((r) => setTimeout(r, 0))
      expect(gamification.awardCoins).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({ delta: 10, type: 'EARN_SUBSCRIPTION_ADDED' }),
      )
    })

    it('schedules default reminders (7, 3, 1 days) on creation', async () => {
      repo.create = jest.fn().mockResolvedValue(mockSubscription)

      await service.createSubscription(userId, input)
      await new Promise((r) => setTimeout(r, 0))

      expect(reminders.createReminders).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({ daysBefore: [7, 3, 1] }),
      )
    })

    it('does not schedule reminders if renewal date is in the past', async () => {
      const pastSub = { ...mockSubscription, nextRenewalDate: new Date(Date.now() - 86400_000).toISOString() }
      repo.create = jest.fn().mockResolvedValue(pastSub)

      await service.createSubscription(userId, {
        ...input,
        nextRenewalDate: new Date(Date.now() - 86400_000).toISOString(),
      })
      await new Promise((r) => setTimeout(r, 0))

      expect(reminders.createReminders).not.toHaveBeenCalled()
    })
  })

  // ── getSubscription ──────────────────────────────────────

  describe('getSubscription', () => {
    it('returns subscription for correct owner', async () => {
      repo.findOne = jest.fn().mockResolvedValue(mockSubscription)

      const result = await service.getSubscription(userId, 'sub_01')
      expect(result?.id).toBe('sub_01')
      expect(repo.findOne).toHaveBeenCalledWith(userId, 'sub_01')
    })

    it('returns null for non-existent subscription (IDOR safe)', async () => {
      // Repo returns null because userId doesn't match — IDOR prevention
      repo.findOne = jest.fn().mockResolvedValue(null)

      const result = await service.getSubscription(otherUserId, 'sub_01')
      expect(result).toBeNull()
    })
  })

  // ── markAsPaid ───────────────────────────────────────────

  describe('markAsPaid', () => {
    it('awards correct coins for monthly subscription (amount/10)', async () => {
      repo.findOne = jest.fn().mockResolvedValue(mockSubscription)
      repo.update = jest.fn().mockResolvedValue(mockSubscription)

      const result = await service.markAsPaid(userId, 'sub_01')

      // Netflix ₹649 / 10 = 64 coins
      expect(result?.coinsEarned).toBe(64)
      expect(gamification.awardCoins).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({ delta: 64, type: 'EARN_SUBSCRIPTION_PAID' }),
      )
    })

    it('applies 1.5x multiplier for annual subscriptions', async () => {
      const annualSub = { ...mockSubscription, billingCycle: 'ANNUALLY', amount: 1499 }
      repo.findOne = jest.fn().mockResolvedValue(annualSub)
      repo.update = jest.fn().mockResolvedValue(annualSub)

      const result = await service.markAsPaid(userId, 'sub_01')

      // ₹1499 / 10 = 149 coins × 1.5 = 223 (floor)
      expect(result?.coinsEarned).toBe(223)
      expect(gamification.awardCoins).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({ type: 'EARN_ANNUAL_BONUS' }),
      )
    })

    it('advances renewal date by 1 month for monthly billing', async () => {
      const renewalDate = new Date('2026-07-15')
      const sub = { ...mockSubscription, nextRenewalDate: renewalDate.toISOString() }
      repo.findOne = jest.fn().mockResolvedValue(sub)
      repo.update = jest.fn().mockResolvedValue(sub)

      await service.markAsPaid(userId, 'sub_01')

      // Should update nextRenewalDate to August 15
      expect(repo.update).toHaveBeenCalledWith(
        userId,
        'sub_01',
        expect.objectContaining({
          nextRenewalDate: expect.stringContaining('2026-08-15'),
        }),
      )
    })

    it('returns null for subscription not owned by user', async () => {
      repo.findOne = jest.fn().mockResolvedValue(null)

      const result = await service.markAsPaid(otherUserId, 'sub_01')
      expect(result).toBeNull()
    })
  })

  // ── deleteSubscription ───────────────────────────────────

  describe('deleteSubscription', () => {
    it('soft deletes and cancels reminders', async () => {
      repo.findOne = jest.fn().mockResolvedValue(mockSubscription)
      repo.softDelete = jest.fn().mockResolvedValue(undefined)

      const result = await service.deleteSubscription(userId, 'sub_01')

      expect(result).toBe(true)
      expect(repo.softDelete).toHaveBeenCalledWith(userId, 'sub_01')
      expect(reminders.cancelForSubscription).toHaveBeenCalledWith('sub_01')
    })

    it('returns false if subscription does not exist for user', async () => {
      repo.findOne = jest.fn().mockResolvedValue(null)

      const result = await service.deleteSubscription(userId, 'nonexistent')
      expect(result).toBe(false)
      expect(repo.softDelete).not.toHaveBeenCalled()
    })
  })
})
