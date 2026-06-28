// packages/validators/src/index.ts
// Single source of truth for all Zod validation schemas.
// Used by both the API (request validation) and mobile (form validation).

import { z } from 'zod'

// ─────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────

export const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'Must be an ISO date string')

export const currencyCode = z
  .string()
  .length(3, 'Currency must be a 3-letter ISO 4217 code')
  .toUpperCase()

export const positiveAmount = z
  .number({ invalid_type_error: 'Amount must be a number' })
  .positive('Amount must be greater than 0')
  .max(10_000_000, 'Amount too large')

// ─────────────────────────────────────────────
// ENUMS (mirroring Prisma enums for Zod)
// ─────────────────────────────────────────────

export const BillingCycleSchema = z.enum([
  'WEEKLY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUALLY', 'CUSTOM',
])

export const SubscriptionStatusSchema = z.enum([
  'ACTIVE', 'TRIAL', 'PAUSED', 'CANCELLED',
])

export const SubscriptionCategorySchema = z.enum([
  'OTT', 'MUSIC', 'MOBILE', 'AI_TOOLS', 'CLOUD_STORAGE', 'PRODUCTIVITY',
  'FINANCE', 'HEALTH_FITNESS', 'GAMING', 'NEWS_EDUCATION', 'RENT', 'UTILITY', 'OTHER',
])

export const RecurringPaymentTypeSchema = z.enum(['rent', 'utility', 'emi', 'other'])

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

export const CompleteProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).trim(),
  currency: currencyCode.default('INR'),
  timezone: z.string().min(1).max(60).default('Asia/Kolkata'),
  city: z.string().max(100).trim().optional().nullable(),
})

export type CompleteProfileInput = z.infer<typeof CompleteProfileSchema>

// ─────────────────────────────────────────────
// SUBSCRIPTION
// ─────────────────────────────────────────────

export const CreateSubscriptionSchema = z.object({
  name: z
    .string()
    .min(1, 'Service name is required')
    .max(100, 'Name too long')
    .trim(),
  category: SubscriptionCategorySchema,
  amount: positiveAmount,
  currency: currencyCode.default('INR'),
  billingCycle: BillingCycleSchema,
  nextRenewalDate: isoDateString,
  trialEndDate: isoDateString.optional().nullable(),
  status: SubscriptionStatusSchema.default('ACTIVE'),
  logoUrl: z.string().url().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
  notes: z.string().max(500).trim().optional().nullable(),
  tags: z.array(z.string().max(30)).max(10).default([]),
  isShared: z.boolean().default(false),
  libraryId: z.string().cuid().optional().nullable(),
})

export type CreateSubscriptionInput = z.infer<typeof CreateSubscriptionSchema>
export type CreateSubscriptionOutput = z.output<typeof CreateSubscriptionSchema>

export const UpdateSubscriptionSchema = CreateSubscriptionSchema.partial().extend({
  id: z.string().cuid(),
})

export type UpdateSubscriptionInput = z.infer<typeof UpdateSubscriptionSchema>

// ─────────────────────────────────────────────
// RECURRING PAYMENT (Rent)
// ─────────────────────────────────────────────

export const CreateRecurringPaymentSchema = z.object({
  type: RecurringPaymentTypeSchema,
  name: z.string().min(1, 'Name is required').max(100).trim(),
  amount: positiveAmount,
  currency: currencyCode.default('INR'),
  dueDayOfMonth: z.number().int().min(1).max(31),
  payeeName: z.string().max(100).trim().optional().nullable(),
  // UPI ID format: something@handle
  upiId: z
    .string()
    .regex(/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/, 'Invalid UPI ID format')
    .optional()
    .nullable(),
  notes: z.string().max(500).trim().optional().nullable(),
})

export type CreateRecurringPaymentInput = z.infer<typeof CreateRecurringPaymentSchema>

export const UpdateRecurringPaymentSchema = CreateRecurringPaymentSchema.partial().extend({
  id: z.string().cuid(),
})

export type UpdateRecurringPaymentInput = z.infer<typeof UpdateRecurringPaymentSchema>

// ─────────────────────────────────────────────
// REMINDER PREFERENCES
// ─────────────────────────────────────────────

export const ReminderPreferenceSchema = z.object({
  subscriptionId: z.string().cuid().optional(),
  recurringPaymentId: z.string().cuid().optional(),
  daysBefore: z.array(z.union([z.literal(7), z.literal(3), z.literal(1), z.literal(0)])),
  channels: z.array(z.enum(['PUSH', 'EMAIL'])).min(1),
})

export type ReminderPreferenceInput = z.infer<typeof ReminderPreferenceSchema>

// ─────────────────────────────────────────────
// PROFILE UPDATE
// ─────────────────────────────────────────────

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  currency: currencyCode.optional(),
  timezone: z.string().min(1).max(60).optional(),
  city: z.string().max(100).trim().optional().nullable(),
  expoPushToken: z.string().max(200).optional().nullable(),
})

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>

// ─────────────────────────────────────────────
// PAGINATION QUERY
// ─────────────────────────────────────────────

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>

// ─────────────────────────────────────────────
// SERVICE LIBRARY SEARCH
// ─────────────────────────────────────────────

export const LibrarySearchSchema = z.object({
  query: z.string().max(100).trim().optional(),
  category: SubscriptionCategorySchema.optional(),
  popular: z.coerce.boolean().optional(),
})

export type LibrarySearchInput = z.infer<typeof LibrarySearchSchema>
