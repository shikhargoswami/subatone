// apps/api/src/modules/gamification/__tests__/gamification.service.test.ts
//
// Tests: tier computation, coin awards, streak milestones, badge evaluation.

import { GamificationService } from '../gamification.service.js'
import { GamificationRepository } from '../gamification.repository.js'

jest.mock('../gamification.repository.js')

const MockRepo = GamificationRepository as jest.MockedClass<typeof GamificationRepository>

const baseUser = {
  coinBalance: 0,
  coinLifetime: 0,
  tier: 'ROOKIE' as const,
  streakDays: 0,
  streakMonths: 0,
}

describe('GamificationService', () => {
  let service: GamificationService
  let repo: jest.Mocked<GamificationRepository>

  beforeEach(() => {
    jest.clearAllMocks()
    service = new GamificationService()
    repo = MockRepo.mock.instances[0] as jest.Mocked<GamificationRepository>
  })

  // ── awardCoins ───────────────────────────────────────────

  describe('awardCoins', () => {
    it('credits coins and returns new balance', async () => {
      repo.creditCoins = jest.fn().mockResolvedValue(110)
      repo.getUserCoins = jest.fn().mockResolvedValue({ ...baseUser, coinLifetime: 110 })
      repo.getUserBadges = jest.fn().mockResolvedValue([])
      repo.getSubscriptionCount = jest.fn().mockResolvedValue(0)

      const newBalance = await service.awardCoins('user_01', {
        delta: 10,
        type: 'EARN_SUBSCRIPTION_ADDED',
        description: 'Test',
      })

      expect(newBalance).toBe(110)
      expect(repo.creditCoins).toHaveBeenCalledWith('user_01', expect.objectContaining({ delta: 10 }))
    })

    it('throws if delta is not positive', async () => {
      await expect(
        service.awardCoins('user_01', { delta: 0, type: 'EARN_SUBSCRIPTION_ADDED', description: 'x' }),
      ).rejects.toThrow('delta must be positive')
    })
  })

  // ── Tier computation ─────────────────────────────────────

  describe('tier thresholds', () => {
    const tierCases: Array<[number, string]> = [
      [0, 'ROOKIE'],
      [500, 'ROOKIE'],
      [501, 'REGULAR'],
      [2000, 'REGULAR'],
      [2001, 'PRIME'],
      [10000, 'PRIME'],
      [10001, 'ELITE'],
      [50000, 'ELITE'],
      [50001, 'OBSIDIAN'],
      [999999, 'OBSIDIAN'],
    ]

    it.each(tierCases)(
      '%i lifetime coins → %s tier',
      async (coinLifetime, expectedTier) => {
        repo.creditCoins = jest.fn().mockResolvedValue(coinLifetime)
        repo.getUserCoins = jest.fn().mockResolvedValue({ ...baseUser, coinLifetime, tier: 'ROOKIE' as const })
        repo.getUserBadges = jest.fn().mockResolvedValue([])
        repo.getSubscriptionCount = jest.fn().mockResolvedValue(0)
        repo.setTier = jest.fn().mockResolvedValue(undefined)

        await service.awardCoins('user_01', { delta: 1, type: 'EARN_SUBSCRIPTION_ADDED', description: 'x' })
        await new Promise((r) => setTimeout(r, 0))

        if (expectedTier !== 'ROOKIE') {
          expect(repo.setTier).toHaveBeenCalledWith('user_01', expectedTier)
        }
      },
    )
  })

  // ── updateStreak ─────────────────────────────────────────

  describe('updateStreak', () => {
    it('awards 100 bonus coins on 3-month streak', async () => {
      repo.incrementStreak = jest.fn().mockResolvedValue({ streakMonths: 3 })
      repo.creditCoins = jest.fn().mockResolvedValue(350)
      repo.getUserCoins = jest.fn().mockResolvedValue({ ...baseUser, coinLifetime: 350 })
      repo.getUserBadges = jest.fn().mockResolvedValue([])
      repo.getSubscriptionCount = jest.fn().mockResolvedValue(0)

      const result = await service.updateStreak('user_01')

      expect(result.isNewMilestone).toBe(true)
      expect(repo.creditCoins).toHaveBeenCalledWith(
        'user_01',
        expect.objectContaining({ delta: 100, type: 'EARN_STREAK_MILESTONE' }),
      )
    })

    it('awards 250 bonus coins on 6-month streak', async () => {
      repo.incrementStreak = jest.fn().mockResolvedValue({ streakMonths: 6 })
      repo.creditCoins = jest.fn().mockResolvedValue(600)
      repo.getUserCoins = jest.fn().mockResolvedValue({ ...baseUser, coinLifetime: 600 })
      repo.getUserBadges = jest.fn().mockResolvedValue([])
      repo.getSubscriptionCount = jest.fn().mockResolvedValue(0)

      const result = await service.updateStreak('user_01')

      expect(result.isNewMilestone).toBe(true)
      expect(repo.creditCoins).toHaveBeenCalledWith(
        'user_01',
        expect.objectContaining({ delta: 250 }),
      )
    })

    it('does not award bonus on non-milestone months', async () => {
      repo.incrementStreak = jest.fn().mockResolvedValue({ streakMonths: 2 })
      repo.creditCoins = jest.fn()

      const result = await service.updateStreak('user_01')

      expect(result.isNewMilestone).toBe(false)
      expect(repo.creditCoins).not.toHaveBeenCalled()
    })
  })

  // ── redeemCoins ──────────────────────────────────────────

  describe('redeemCoins', () => {
    it('deducts coins when balance is sufficient', async () => {
      repo.getUserCoins = jest.fn().mockResolvedValue({ ...baseUser, coinBalance: 500 })
      repo.deductCoins = jest.fn().mockResolvedValue(200)

      const result = await service.redeemCoins('user_01', {
        delta: 300,
        type: 'REDEEM_FEATURE_UNLOCK',
        description: 'Pro unlock',
      })

      expect(result.newBalance).toBe(200)
    })

    it('throws INSUFFICIENT_COINS when balance is too low', async () => {
      repo.getUserCoins = jest.fn().mockResolvedValue({ ...baseUser, coinBalance: 100 })

      await expect(
        service.redeemCoins('user_01', { delta: 500, type: 'REDEEM_FEATURE_UNLOCK', description: 'x' }),
      ).rejects.toThrow('INSUFFICIENT_COINS')
    })
  })
})
