// packages/types/src/index.ts
// All shared TypeScript types used across mobile and API.

// ─────────────────────────────────────────────
// RE-EXPORT DB ENUMS
// ─────────────────────────────────────────────
export type {
  BillingCycle,
  SubscriptionStatus,
  SubscriptionCategory,
  CoinEventType,
  UserTier,
  BadgeSlug,
  ReminderChannel,
} from '@prisma/client'

// ─────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────

export interface UserProfile {
  id: string
  clerkId: string
  email: string | null
  phone: string | null
  name: string | null
  avatarUrl: string | null
  currency: string
  timezone: string
  city: string | null
  coinBalance: number
  coinLifetime: number
  tier: import('@prisma/client').UserTier
  streakDays: number
  streakMonths: number
  plan: string
  onboardingDone: boolean
  createdAt: string
}

// ─────────────────────────────────────────────
// SUBSCRIPTION
// ─────────────────────────────────────────────

export interface Subscription {
  id: string
  userId: string
  name: string
  category: import('@prisma/client').SubscriptionCategory
  amount: number
  currency: string
  billingCycle: import('@prisma/client').BillingCycle
  nextRenewalDate: string
  startDate: string
  trialEndDate: string | null
  status: import('@prisma/client').SubscriptionStatus
  logoUrl: string | null
  websiteUrl: string | null
  notes: string | null
  tags: string[]
  isShared: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateSubscriptionInput {
  name: string
  category: import('@prisma/client').SubscriptionCategory
  amount: number
  currency?: string
  billingCycle: import('@prisma/client').BillingCycle
  nextRenewalDate: string   // ISO date string
  trialEndDate?: string | null
  status?: import('@prisma/client').SubscriptionStatus
  logoUrl?: string | null
  websiteUrl?: string | null
  notes?: string | null
  tags?: string[]
  isShared?: boolean
  libraryId?: string | null
}

export interface UpdateSubscriptionInput extends Partial<CreateSubscriptionInput> {
  id: string
}

// ─────────────────────────────────────────────
// RECURRING PAYMENT (Rent)
// ─────────────────────────────────────────────

export interface RecurringPayment {
  id: string
  userId: string
  type: 'rent' | 'utility' | 'emi' | 'other'
  name: string
  amount: number
  currency: string
  dueDayOfMonth: number
  nextDueDate: string
  payeeName: string | null
  upiId: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateRecurringPaymentInput {
  type: 'rent' | 'utility' | 'emi' | 'other'
  name: string
  amount: number
  currency?: string
  dueDayOfMonth: number
  payeeName?: string | null
  upiId?: string | null
  notes?: string | null
}

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────

export interface DashboardSummary {
  totalMonthlyBurn: number
  totalAnnualBurn: number
  currency: string
  activeSubscriptionCount: number
  upcomingRenewals: UpcomingRenewal[]
  categoryBreakdown: CategoryBreakdown[]
  coinBalance: number
  streakMonths: number
  tier: import('@prisma/client').UserTier
}

export interface UpcomingRenewal {
  id: string
  name: string
  amount: number
  currency: string
  nextRenewalDate: string
  daysUntilRenewal: number
  logoUrl: string | null
  type: 'subscription' | 'recurring'
}

export interface CategoryBreakdown {
  category: import('@prisma/client').SubscriptionCategory | string
  totalAmount: number
  count: number
  percentage: number
}

// ─────────────────────────────────────────────
// GAMIFICATION
// ─────────────────────────────────────────────

export interface CoinLedgerEntry {
  id: string
  delta: number
  type: import('@prisma/client').CoinEventType
  description: string
  subscriptionId: string | null
  recurringPaymentId: string | null
  expiresAt: string | null
  createdAt: string
}

export interface UserBadge {
  id: string
  badgeSlug: import('@prisma/client').BadgeSlug
  earnedAt: string
}

export interface GamificationState {
  coinBalance: number
  coinLifetime: number
  tier: import('@prisma/client').UserTier
  tierProgress: number       // 0–100% progress to next tier
  coinsToNextTier: number
  streakDays: number
  streakMonths: number
  recentLedger: CoinLedgerEntry[]
  badges: UserBadge[]
}

// ─────────────────────────────────────────────
// SERVICE LIBRARY
// ─────────────────────────────────────────────

export interface ServiceLibraryItem {
  id: string
  name: string
  category: import('@prisma/client').SubscriptionCategory
  logoUrl: string | null
  websiteUrl: string | null
  defaultAmount: number | null
  defaultCycle: import('@prisma/client').BillingCycle
  isPopular: boolean
}

// ─────────────────────────────────────────────
// API RESPONSE WRAPPERS
// ─────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true
  data: T
  meta?: Record<string, unknown>
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────

export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  hasNext: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationMeta
}

// ─────────────────────────────────────────────
// ANALYTICS EVENTS
// ─────────────────────────────────────────────

export type AnalyticsEvent =
  | { event: 'subscription_added'; properties: { category: string; amount: number; billingCycle: string } }
  | { event: 'subscription_deleted'; properties: { subscriptionId: string } }
  | { event: 'subscription_marked_paid'; properties: { subscriptionId: string; coinsEarned: number } }
  | { event: 'rent_added'; properties: { amount: number } }
  | { event: 'coins_earned'; properties: { amount: number; type: string } }
  | { event: 'badge_earned'; properties: { badge: string } }
  | { event: 'streak_updated'; properties: { months: number } }
  | { event: 'onboarding_completed'; properties: { subscriptionCount: number } }
  | { event: 'screen_viewed'; properties: { screen: string } }
