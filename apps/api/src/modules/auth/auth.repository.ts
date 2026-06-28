// apps/api/src/modules/auth/auth.repository.ts
// Data access layer for user records.

import { prisma } from '@subatone/db'

export class AuthRepository {
  async findByClerkId(clerkId: string) {
    return prisma.user.findUnique({
      where: { clerkId },
    })
  }

  async createUser(data: { clerkId: string; expoPushToken?: string }) {
    return prisma.user.create({
      data: {
        clerkId: data.clerkId,
        expoPushToken: data.expoPushToken ?? null,
      },
    })
  }

  async updatePushToken(userId: string, token: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { expoPushToken: token, updatedAt: new Date() },
    })
  }

  async softDeleteUser(userId: string, scheduledAt: Date) {
    return prisma.user.update({
      where: { id: userId },
      data: { deletedAt: scheduledAt },
    })
  }
}
