// apps/api/src/modules/subscriptions/subscriptions.repository.ts
// All DB queries for subscriptions.
// Every query is scoped to userId — prevents IDOR.

import { prisma } from '@subatone/db'
import type { Subscription, PaginatedResponse } from '@subatone/types'
import type { CreateSubscriptionInput, CreateSubscriptionOutput } from '@subatone/validators'

export class SubscriptionsRepository {
  async findMany(
    userId: string,
    opts: { page: number; pageSize: number; status?: string },
  ): Promise<PaginatedResponse<Subscription>> {
    const { page, pageSize, status } = opts
    const skip = (page - 1) * pageSize

    const where = {
      userId,
      deletedAt: null,
      ...(status ? { status: status as never } : {}),
    }

    const [items, total] = await prisma.$transaction([
      prisma.subscription.findMany({
        where,
        orderBy: { nextRenewalDate: 'asc' },
        skip,
        take: pageSize,
      }),
      prisma.subscription.count({ where }),
    ])

    return {
      items: items.map(this.toDto),
      pagination: {
        total,
        page,
        pageSize,
        hasNext: skip + items.length < total,
      },
    }
  }

  async findOne(userId: string, id: string): Promise<Subscription | null> {
    const sub = await prisma.subscription.findFirst({
      where: { id, userId, deletedAt: null },
    })
    return sub ? this.toDto(sub) : null
  }

  async create(userId: string, input: CreateSubscriptionOutput): Promise<Subscription> {    const sub = await prisma.subscription.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: {
        userId,
        name: input.name,
        category: input.category,
        amount: input.amount,
        currency: input.currency ?? 'INR',
        billingCycle: input.billingCycle,
        nextRenewalDate: new Date(input.nextRenewalDate),
        trialEndDate: input.trialEndDate ? new Date(input.trialEndDate) : null,
        status: input.status ?? 'ACTIVE',
        logoUrl: input.logoUrl ?? null,
        websiteUrl: input.websiteUrl ?? null,
        notes: input.notes ?? null,
        tags: input.tags ?? [],
        isShared: input.isShared ?? false,
        libraryId: input.libraryId ?? null,
      } as any,
    })
    return this.toDto(sub)
  }

  async update(
    userId: string,
    id: string,
    input: Partial<CreateSubscriptionInput>,
  ): Promise<Subscription | null> {
    const updated = await prisma.subscription.updateMany({
      where: { id, userId, deletedAt: null },
      data: {
        ...( input.name !== undefined && { name: input.name }),
        ...( input.category !== undefined && { category: input.category }),
        ...( input.amount !== undefined && { amount: input.amount }),
        ...( input.currency !== undefined && { currency: input.currency }),
        ...( input.billingCycle !== undefined && { billingCycle: input.billingCycle }),
        ...( input.nextRenewalDate !== undefined && { nextRenewalDate: new Date(input.nextRenewalDate) }),
        ...( input.trialEndDate !== undefined && { trialEndDate: input.trialEndDate ? new Date(input.trialEndDate) : null }),
        ...( input.status !== undefined && { status: input.status }),
        ...( input.notes !== undefined && { notes: input.notes }),
        ...( input.tags !== undefined && { tags: input.tags }),
        ...( input.isShared !== undefined && { isShared: input.isShared }),
        updatedAt: new Date(),
      },
    })

    if (updated.count === 0) return null
    return this.findOne(userId, id)
  }

  async softDelete(userId: string, id: string): Promise<void> {
    await prisma.subscription.updateMany({
      where: { id, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    })
  }

  // ── DTO mapper ──────────────────────────────────────────
  // Converts Prisma model to API-safe type (no internal fields exposed).

  private toDto(sub: {
    id: string
    userId: string
    name: string
    category: string
    amount: number
    currency: string
    billingCycle: string
    nextRenewalDate: Date
    startDate: Date
    trialEndDate: Date | null
    status: string
    logoUrl: string | null
    websiteUrl: string | null
    notes: string | null
    tags: string[]
    isShared: boolean
    createdAt: Date
    updatedAt: Date
  }): Subscription {
    return {
      id: sub.id,
      userId: sub.userId,
      name: sub.name,
      category: sub.category as Subscription['category'],
      amount: sub.amount,
      currency: sub.currency,
      billingCycle: sub.billingCycle as Subscription['billingCycle'],
      nextRenewalDate: sub.nextRenewalDate.toISOString(),
      startDate: sub.startDate.toISOString(),
      trialEndDate: sub.trialEndDate?.toISOString() ?? null,
      status: sub.status as Subscription['status'],
      logoUrl: sub.logoUrl,
      websiteUrl: sub.websiteUrl,
      notes: sub.notes,
      tags: sub.tags,
      isShared: sub.isShared,
      createdAt: sub.createdAt.toISOString(),
      updatedAt: sub.updatedAt.toISOString(),
    }
  }
}
