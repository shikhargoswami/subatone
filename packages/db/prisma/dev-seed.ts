// packages/db/prisma/dev-seed.ts
// Seeds TWO test user profiles in the DEV database:
//
//  - NEW USER    → fresh account, 0 subs, no coins/streak
//  - EXISTING USER → 6 active subs, 3-month streak, 250 coins
//
// Usage:
//   npm run db:seed:dev                      (uses placeholder Clerk IDs)
//   SEED_NEW_CLERK_ID=user_xxx npm run db:seed:dev  (your actual Clerk ID)
//
// To find your Clerk user ID: open the app → Profile tab, or check
// https://dashboard.clerk.com → Users → click your account

import { PrismaClient, BillingCycle, SubscriptionCategory, SubscriptionStatus, UserTier, CoinEventType } from '@prisma/client'

const prisma = new PrismaClient()

// Override these with real Clerk user IDs to test with your actual account.
const NEW_USER_CLERK_ID    = process.env['SEED_NEW_CLERK_ID']    ?? 'user_test_new_000000000000'
const EXISTING_USER_CLERK_ID = process.env['SEED_EXISTING_CLERK_ID'] ?? 'user_test_existing_000000'

function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r }
function subDays(d: Date, n: number) { return addDays(d, -n) }

async function main() {
  const now = new Date()

  console.log('🌱  Seeding dev database...\n')

  // ─────────────────────────────────────────────────────────────────
  // 1. NEW USER — just signed up, no data
  // ─────────────────────────────────────────────────────────────────
  console.log('👤  Creating NEW USER profile...')

  const newUser = await prisma.user.upsert({
    where: { clerkId: NEW_USER_CLERK_ID },
    create: {
      clerkId: NEW_USER_CLERK_ID,
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      coinBalance: 50,
      coinLifetime: 50,
      tier: UserTier.ROOKIE,
      streakDays: 0,
      streakMonths: 0,
      onboardingDone: false,
    },
    update: {
      onboardingDone: false,
      coinBalance: 50,
    },
  })

  // sign-up bonus coin event
  await prisma.coinLedger.upsert({
    where: { id: `seed-signup-bonus-${newUser.id}` },
    create: {
      id: `seed-signup-bonus-${newUser.id}`,
      userId: newUser.id,
      type: CoinEventType.EARN_SIGNUP_BONUS,
      delta: 50,
      description: 'Welcome bonus',
    },
    update: {},
  })

  console.log(`   ✓ New user created  (clerkId: ${NEW_USER_CLERK_ID})\n`)

  // ─────────────────────────────────────────────────────────────────
  // 2. EXISTING USER — active subscriber, streak, coins
  // ─────────────────────────────────────────────────────────────────
  console.log('👤  Creating EXISTING USER profile...')

  const existingUser = await prisma.user.upsert({
    where: { clerkId: EXISTING_USER_CLERK_ID },
    create: {
      clerkId: EXISTING_USER_CLERK_ID,
      name: 'Shikhar (Test)',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      coinBalance: 370,
      coinLifetime: 420,
      tier: UserTier.REGULAR,
      streakDays: 92,
      streakMonths: 3,
      streakLastDate: subDays(now, 1),
      onboardingDone: true,
    },
    update: {
      name: 'Shikhar (Test)',
      onboardingDone: true,
      coinBalance: 370,
      coinLifetime: 420,
      tier: UserTier.REGULAR,
      streakDays: 92,
      streakMonths: 3,
    },
  })

  // Seed 6 realistic subscriptions (common Indian app stack)
  const subscriptions = [
    {
      name: 'Netflix',
      category: SubscriptionCategory.OTT,
      amount: 649,
      billingCycle: BillingCycle.MONTHLY,
      nextRenewalDate: addDays(now, 8),
      startDate: subDays(now, 83),
      status: SubscriptionStatus.ACTIVE,
      logoUrl: 'https://assets.subatone.in/logos/netflix.png',
      websiteUrl: 'https://netflix.com',
    },
    {
      name: 'Spotify',
      category: SubscriptionCategory.MUSIC,
      amount: 119,
      billingCycle: BillingCycle.MONTHLY,
      nextRenewalDate: addDays(now, 14),
      startDate: subDays(now, 75),
      status: SubscriptionStatus.ACTIVE,
      logoUrl: 'https://assets.subatone.in/logos/spotify.png',
      websiteUrl: 'https://spotify.com',
    },
    {
      name: 'ChatGPT Plus',
      category: SubscriptionCategory.AI_TOOLS,
      amount: 1650,
      billingCycle: BillingCycle.MONTHLY,
      nextRenewalDate: addDays(now, 3),
      startDate: subDays(now, 58),
      status: SubscriptionStatus.ACTIVE,
      logoUrl: 'https://assets.subatone.in/logos/chatgpt.png',
      websiteUrl: 'https://openai.com',
    },
    {
      name: 'iCloud+',
      category: SubscriptionCategory.CLOUD_STORAGE,
      amount: 219,
      billingCycle: BillingCycle.MONTHLY,
      nextRenewalDate: addDays(now, 21),
      startDate: subDays(now, 92),
      status: SubscriptionStatus.ACTIVE,
      logoUrl: 'https://assets.subatone.in/logos/icloud.png',
      websiteUrl: 'https://icloud.com',
    },
    {
      name: 'Airtel Recharge',
      category: SubscriptionCategory.MOBILE,
      amount: 299,
      billingCycle: BillingCycle.MONTHLY,
      nextRenewalDate: addDays(now, 5),
      startDate: subDays(now, 90),
      status: SubscriptionStatus.ACTIVE,
      logoUrl: 'https://assets.subatone.in/logos/airtel.png',
      websiteUrl: 'https://airtel.in',
    },
    {
      name: 'Amazon Prime Video',
      category: SubscriptionCategory.OTT,
      amount: 1499,
      billingCycle: BillingCycle.ANNUALLY,
      nextRenewalDate: addDays(now, 180),
      startDate: subDays(now, 185),
      status: SubscriptionStatus.ACTIVE,
      logoUrl: 'https://assets.subatone.in/logos/prime.png',
      websiteUrl: 'https://primevideo.com',
    },
  ]

  for (const sub of subscriptions) {
    const seedId = `seed-sub-${existingUser.id}-${sub.name.replace(/\s+/g, '-').toLowerCase()}`
    await prisma.subscription.upsert({
      where: { id: seedId },
      create: { id: seedId, userId: existingUser.id, ...sub },
      update: { nextRenewalDate: sub.nextRenewalDate, status: sub.status },
    })
  }

  // Add a recurring rent payment
  await prisma.recurringPayment.upsert({
    where: { id: `seed-rent-${existingUser.id}` },
    create: {
      id: `seed-rent-${existingUser.id}`,
      userId: existingUser.id,
      type: 'rent',
      name: 'Flat Rent - HSR Layout',
      amount: 22000,
      currency: 'INR',
      dueDayOfMonth: 1,
      nextDueDate: new Date(now.getFullYear(), now.getMonth() + (now.getDate() > 1 ? 1 : 0), 1),
    },
    update: {},
  })

  // Coin ledger history
  const coinEvents = [
    { id: `seed-coin-1-${existingUser.id}`,  type: CoinEventType.EARN_SIGNUP_BONUS,         delta: 50,  description: 'Welcome bonus' },
    { id: `seed-coin-2-${existingUser.id}`,  type: CoinEventType.EARN_SUBSCRIPTION_ADDED,   delta: 10,  description: 'Added Netflix' },
    { id: `seed-coin-3-${existingUser.id}`,  type: CoinEventType.EARN_SUBSCRIPTION_PAID,    delta: 20,  description: 'Netflix payment confirmed' },
    { id: `seed-coin-4-${existingUser.id}`,  type: CoinEventType.EARN_SUBSCRIPTION_ADDED,   delta: 10,  description: 'Added Spotify' },
    { id: `seed-coin-5-${existingUser.id}`,  type: CoinEventType.EARN_STREAK_MILESTONE,     delta: 100, description: '1-month streak milestone' },
    { id: `seed-coin-6-${existingUser.id}`,  type: CoinEventType.EARN_SUBSCRIPTION_PAID,    delta: 20,  description: 'Airtel payment confirmed' },
    { id: `seed-coin-7-${existingUser.id}`,  type: CoinEventType.EARN_STREAK_MILESTONE,     delta: 100, description: '2-month streak milestone' },
    { id: `seed-coin-8-${existingUser.id}`,  type: CoinEventType.EARN_SUBSCRIPTION_ADDED,   delta: 10,  description: 'Added ChatGPT Plus' },
    { id: `seed-coin-9-${existingUser.id}`,  type: CoinEventType.EARN_RENT_PAID,            delta: 50,  description: 'Rent paid on time' },
    { id: `seed-coin-10-${existingUser.id}`, type: CoinEventType.REDEEM_FEATURE_UNLOCK,     delta: -50, description: 'Unlocked dark theme' },
  ]

  for (const event of coinEvents) {
    await prisma.coinLedger.upsert({
      where: { id: event.id },
      create: { userId: existingUser.id, ...event },
      update: {},
    })
  }

  console.log(`   ✓ Existing user created (clerkId: ${EXISTING_USER_CLERK_ID})`)
  console.log(`   ✓ 6 subscriptions seeded`)
  console.log(`   ✓ Rent payment seeded`)
  console.log(`   ✓ Coin ledger seeded (10 events)\n`)

  // ─────────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────────
  const monthly = subscriptions
    .filter(s => s.billingCycle === BillingCycle.MONTHLY)
    .reduce((sum, s) => sum + s.amount, 0)
  const annual = subscriptions
    .filter(s => s.billingCycle === BillingCycle.ANNUALLY)
    .reduce((sum, s) => sum + s.amount / 12, 0)

  console.log('📊  Existing user summary:')
  console.log(`   Monthly burn:  ₹${(monthly + annual).toFixed(0)}`)
  console.log(`   Annual burn:   ₹${((monthly + annual) * 12).toFixed(0)}`)
  console.log(`   Coin balance:  370 coins`)
  console.log(`   Streak:        3 months\n`)
  console.log('✅  Dev seed complete.\n')
  console.log('─────────────────────────────────────────────────────────')
  console.log('To test as the EXISTING USER in the app, set this Clerk ID')
  console.log('in your Clerk dashboard or update SEED_EXISTING_CLERK_ID:')
  console.log(`  ${EXISTING_USER_CLERK_ID}`)
  console.log('─────────────────────────────────────────────────────────')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
