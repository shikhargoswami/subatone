// apps/api/src/modules/auth/__tests__/auth.service.test.ts
//
// Unit tests for AuthService.
// Tests: happy path, duplicate sync, push token update, deletion scheduling.

import { AuthService } from '../auth.service.js'
import { AuthRepository } from '../auth.repository.js'
import { GamificationService } from '../../gamification/gamification.service.js'

jest.mock('../auth.repository.js')
jest.mock('../../gamification/gamification.service.js')

const MockAuthRepository = AuthRepository as jest.MockedClass<typeof AuthRepository>
const MockGamificationService = GamificationService as jest.MockedClass<typeof GamificationService>

const mockUser = {
  id: 'user_01',
  clerkId: 'clerk_01',
  email: 'test@example.com',
  phone: null,
  name: null,
  avatarUrl: null,
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  city: null,
  coinBalance: 100,
  coinLifetime: 100,
  tier: 'ROOKIE',
  streakDays: 0,
  streakMonths: 0,
  plan: 'free',
  onboardingDone: false,
  expoPushToken: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  planExpiresAt: null,
  streakLastDate: null,
}

describe('AuthService', () => {
  let service: AuthService
  let repoMock: jest.Mocked<AuthRepository>
  let gamificationMock: jest.Mocked<GamificationService>

  beforeEach(() => {
    jest.clearAllMocks()
    service = new AuthService()
    repoMock = MockAuthRepository.mock.instances[0] as jest.Mocked<AuthRepository>
    gamificationMock = MockGamificationService.mock.instances[0] as jest.Mocked<GamificationService>
    gamificationMock.awardCoins = jest.fn().mockResolvedValue(undefined)
  })

  describe('syncUser', () => {
    it('creates a new user on first sync and awards signup bonus', async () => {
      repoMock.findByClerkId = jest.fn().mockResolvedValue(null)
      repoMock.createUser = jest.fn().mockResolvedValue(mockUser)

      const result = await service.syncUser('clerk_01')

      expect(result.isNewUser).toBe(true)
      expect(result.user.id).toBe('user_01')
      expect(repoMock.createUser).toHaveBeenCalledWith({ clerkId: 'clerk_01', expoPushToken: undefined })
      // Bonus is fire-and-forget; await any microtasks
      await new Promise((r) => setTimeout(r, 0))
      expect(gamificationMock.awardCoins).toHaveBeenCalledWith('user_01', expect.objectContaining({ delta: 100, type: 'EARN_SIGNUP_BONUS' }))
    })

    it('returns existing user on subsequent sync', async () => {
      repoMock.findByClerkId = jest.fn().mockResolvedValue(mockUser)

      const result = await service.syncUser('clerk_01')

      expect(result.isNewUser).toBe(false)
      expect(result.user.id).toBe('user_01')
      expect(repoMock.createUser).not.toHaveBeenCalled()
    })

    it('updates push token when it changes on re-sync', async () => {
      const userWithToken = { ...mockUser, expoPushToken: 'old_token' }
      repoMock.findByClerkId = jest.fn().mockResolvedValue(userWithToken)
      repoMock.updatePushToken = jest.fn().mockResolvedValue(undefined)

      await service.syncUser('clerk_01', 'new_token')

      expect(repoMock.updatePushToken).toHaveBeenCalledWith('user_01', 'new_token')
    })

    it('does not update push token when unchanged', async () => {
      const userWithToken = { ...mockUser, expoPushToken: 'same_token' }
      repoMock.findByClerkId = jest.fn().mockResolvedValue(userWithToken)
      repoMock.updatePushToken = jest.fn()

      await service.syncUser('clerk_01', 'same_token')

      expect(repoMock.updatePushToken).not.toHaveBeenCalled()
    })

    it('does not expose expoPushToken in returned profile', async () => {
      repoMock.findByClerkId = jest.fn().mockResolvedValue({ ...mockUser, expoPushToken: 'secret_token' })

      const result = await service.syncUser('clerk_01')

      expect((result.user as unknown as Record<string, unknown>)['expoPushToken']).toBeUndefined()
    })
  })

  describe('initiateAccountDeletion', () => {
    it('schedules deletion 30 days in the future', async () => {
      repoMock.softDeleteUser = jest.fn().mockResolvedValue(undefined)

      const before = new Date()
      const scheduledAt = await service.initiateAccountDeletion('user_01')
      const after = new Date()

      const expectedMin = new Date(before)
      expectedMin.setDate(expectedMin.getDate() + 30)
      const expectedMax = new Date(after)
      expectedMax.setDate(expectedMax.getDate() + 30)

      expect(scheduledAt.getTime()).toBeGreaterThanOrEqual(expectedMin.getTime())
      expect(scheduledAt.getTime()).toBeLessThanOrEqual(expectedMax.getTime())
      expect(repoMock.softDeleteUser).toHaveBeenCalledWith('user_01', expect.any(Date))
    })
  })
})
