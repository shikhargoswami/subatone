# Subatone — Developer SOP

> Standard Operating Procedure for any developer joining the project.
> Read this top to bottom before touching any code.

---

## Table of Contents

1. [What Is This App](#1-what-is-this-app)
2. [Tech Stack at a Glance](#2-tech-stack-at-a-glance)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Local Setup](#4-local-setup)
5. [Running the App](#5-running-the-app)
6. [How a Request Flows End-to-End](#6-how-a-request-flows-end-to-end)
7. [Database — Models & Migrations](#7-database--models--migrations)
8. [API — Adding or Changing a Backend Feature](#8-api--adding-or-changing-a-backend-feature)
9. [Mobile — Screens, Navigation & State](#9-mobile--screens-navigation--state)
10. [Shared Packages — Types & Validators](#10-shared-packages--types--validators)
11. [Authentication & Security](#11-authentication--security)
12. [Gamification Module](#12-gamification-module)
13. [Reminders & Push Notifications](#13-reminders--push-notifications)
14. [Updating the UI](#14-updating-the-ui)
15. [Environment Variables Reference](#15-environment-variables-reference)
16. [Testing](#16-testing)
17. [Common Mistakes & How to Avoid Them](#17-common-mistakes--how-to-avoid-them)

---

## 1. What Is This App

Subatone is a **gamified subscription tracker** — think CRED but for subscriptions instead of credit cards. Users add their Netflix, Spotify, rent, Jio recharge, etc. The app shows them their total monthly burn, fires reminders before renewals, and rewards consistent payment behaviour with Suba Coins.

**Core loop:** Add subscription → See dashboard → Get reminder → Mark as paid → Earn coins → Build streak → Unlock tier.

---

## 2. Tech Stack at a Glance

| Layer | Technology | Why |
|-------|-----------|-----|
| Mobile app | React Native + Expo SDK 54 | Cross-platform, OTA updates |
| Navigation | Expo Router (file-system routing) | Familiar to Next.js devs |
| State management | Zustand (local) + React Query (server) | Minimal boilerplate |
| API server | Hono v4 on Node.js 20+ | Tiny, typed, fast |
| Auth | Clerk (phone OTP + Google SSO) | Handles OTP, JWT, sessions |
| Database | PostgreSQL via Supabase | Free tier, managed |
| ORM | Prisma 5 | Type-safe queries |
| Validation | Zod (shared between API and mobile) | Single source of truth |
| Queue / jobs | BullMQ + Redis (Upstash) | Delayed reminder jobs |
| Logging | Pino (structured JSON) | Production-ready |
| Language | TypeScript everywhere | End-to-end type safety |

---

## 3. Monorepo Structure

```
subatone/                          ← npm workspaces root
├── apps/
│   ├── api/                       ← Hono REST API
│   │   └── src/
│   │       ├── index.ts           ← HTTP server entry (starts @hono/node-server)
│   │       ├── app.ts             ← App factory (routes, middleware wired here)
│   │       ├── middleware/
│   │       │   ├── auth.ts        ← JWT verification (requireAuth)
│   │       │   ├── rate-limit.ts  ← Sliding-window rate limiter (Redis / fallback)
│   │       │   └── error.ts       ← Global error handler
│   │       ├── lib/
│   │       │   ├── logger.ts      ← Pino instance
│   │       │   ├── redis.ts       ← ioredis client
│   │       │   ├── queue.ts       ← BullMQ job helpers
│   │       │   └── push.ts        ← Expo push notification sender
│   │       └── modules/           ← One folder per domain
│   │           ├── auth/
│   │           ├── subscriptions/
│   │           ├── recurring-payments/
│   │           ├── dashboard/
│   │           ├── gamification/
│   │           ├── reminders/
│   │           ├── library/
│   │           └── profile/
│   │
│   └── mobile/                    ← Expo React Native app
│       ├── app/                   ← File-system routes (Expo Router)
│       │   ├── _layout.tsx        ← Root: Clerk + React Query providers
│       │   ├── (auth)/            ← Unauthenticated screens
│       │   │   ├── sign-in.tsx
│       │   │   └── onboarding.tsx
│       │   └── (tabs)/            ← Authenticated tab screens
│       │       ├── _layout.tsx    ← Tab bar definition
│       │       ├── index.tsx      ← Dashboard screen
│       │       ├── subscriptions.tsx
│       │       └── profile.tsx
│       └── src/
│           ├── modules/           ← Feature logic (hooks, sheets, stores)
│           │   ├── auth/
│           │   ├── dashboard/
│           │   ├── subscriptions/
│           │   └── reminders/
│           └── shared/
│               ├── api/client.ts  ← Authenticated fetch wrapper
│               ├── components/    ← Reusable UI components
│               └── constants/
│                   └── colors.ts  ← Design tokens (single source of truth)
│
└── packages/
    ├── db/                        ← Prisma schema + client singleton
    │   └── prisma/
    │       ├── schema.prisma      ← DB models
    │       ├── seed.ts            ← Production seed
    │       ├── dev-seed.ts        ← Dev seed (test users)
    │       └── seed-library.ts    ← Service library (Netflix, Spotify…)
    ├── types/                     ← Shared TypeScript interfaces
    │   └── src/index.ts
    └── validators/                ← Shared Zod schemas
        └── src/index.ts
```

**Rule:** Code that belongs to one domain lives in one module folder. Code shared by two or more domains goes in `packages/`.

---

## 4. Local Setup

### Prerequisites

- Node.js 20+ (`node --version`)
- npm 10+ (`npm --version`)
- Expo Go installed on your iPhone/Android
- Accounts on: [Clerk](https://clerk.com), [Supabase](https://supabase.com)

### Step 1 — Clone and install

```bash
git clone https://github.com/shikhargoswami/subatone.git
cd subatone
npm install          # installs all workspaces
```

### Step 2 — API environment

Create `apps/api/.env`:

```env
# Clerk (from https://dashboard.clerk.com → API Keys)
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...

# Clerk JWT public key — base64 SPKI format (no PEM headers)
# Fetch it: node -e "const https=require('https');https.get('https://<instance>.clerk.accounts.dev/.well-known/jwks.json',r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>{const k=JSON.parse(d).keys[0];const crypto=require('crypto');const pem=crypto.createPublicKey({key:k,format:'jwk'}).export({type:'spki',format:'pem'});console.log(pem.replace(/-----.*-----\n?/g,'').replace(/\n/g,''))})})"
CLERK_JWT_KEY=MIIBIjANBgkq...

# Supabase session pooler URL (from Supabase → Connect → Session pooler)
DATABASE_URL=postgresql://postgres.<project>:<password>@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

NODE_ENV=development
API_PORT=3000
LOG_LEVEL=info

# Optional — Upstash Redis (rate-limiter + reminder queues)
# Without this, rate-limiting falls back to in-memory and reminders won't fire
REDIS_URL=rediss://default:<token>@<host>.upstash.io:6379
```

### Step 3 — Mobile environment

Create `apps/mobile/.env`:

```env
# Same publishable key as API
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Your Mac's LAN IP (find it: ipconfig getifaddr en0)
# Use this when running on a physical device over Wi-Fi
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
```

### Step 4 — Database

```bash
# Run all pending migrations
npm run db:migrate

# Seed the service library (Netflix, Spotify, etc.)
npm run db:seed:library

# Seed dev test users (optional but recommended)
SEED_EXISTING_CLERK_ID=<your-clerk-user-id> npm run db:seed:dev
```

> **Find your Clerk user ID:** Sign in to the app once, then check [Clerk Dashboard → Users](https://dashboard.clerk.com).

---

## 5. Running the App

### Terminal 1 — API server

```bash
cd apps/api
npm run dev
# Starts: tsx watch --env-file .env src/index.ts
# Logs: [INFO] Subatone API running on port 3000
# Hot-reloads on file save
```

> **Important:** The `--env-file .env` flag is critical. Without it, no environment variables are loaded and the server silently fails to connect to the database and Clerk.

### Terminal 2 — Metro bundler (mobile)

```bash
cd apps/mobile
EXPO_NO_PROMPTS=1 npx expo start --lan --clear
# --lan   : uses your LAN IP so your phone can reach it over Wi-Fi
# --clear : clears Metro cache (use on first run or after package changes)
```

Scan the QR code with **Expo Go** on your phone.

### Health check

```bash
curl http://localhost:3000/health
# → {"status":"ok","timestamp":"..."}
```

---

## 6. How a Request Flows End-to-End

Using "load the dashboard" as an example:

```
iPhone (Expo Go)
  │
  │  1. User opens app → ClerkProvider loads cached JWT from SecureStore
  │  2. TabsLayout useEffect fires → syncUser() → POST /api/v1/auth/sync
  │  3. useDashboard() hook → GET /api/v1/dashboard
  │
  ▼
apps/mobile/src/shared/api/client.ts (useApiClient)
  │  - Calls getToken() from Clerk SDK → returns signed JWT
  │  - Attaches Authorization: Bearer <jwt> header
  │  - Sends fetch to EXPO_PUBLIC_API_URL/api/v1/dashboard
  │
  ▼
apps/api/src/app.ts
  │  - secureHeaders() middleware (X-Frame-Options, etc.)
  │  - cors() middleware
  │  - rateLimitMiddleware (100 req/min per IP, falls back to in-memory)
  │  - Routes request to /api/v1/dashboard
  │
  ▼
apps/api/src/middleware/auth.ts (requireAuth)
  │  - Extracts JWT from Authorization header
  │  - Calls verifyToken(jwt, { jwtKey }) — LOCAL crypto, no network
  │  - Gets clerkId from JWT payload.sub
  │  - Queries DB: SELECT id FROM users WHERE clerkId = ?
  │  - Attaches userId and clerkId to Hono context
  │
  ▼
apps/api/src/modules/dashboard/dashboard.routes.ts
  │  - Reads userId from context (set by requireAuth)
  │  - Queries: subscriptions, recurringPayments, user coin/streak data
  │  - Calculates monthly burn, upcoming renewals, category breakdown
  │  - Returns { success: true, data: DashboardSummary }
  │
  ▼
apps/mobile/src/modules/dashboard/useDashboard.ts (React Query)
  │  - Receives the response body
  │  - client.ts unwraps body.data and returns DashboardSummary
  │  - React Query caches it (staleTime: 30s)
  │
  ▼
apps/mobile/app/(tabs)/index.tsx
     - Renders monthly burn, upcoming renewals, category breakdown
```

### API response envelope

Every API response uses this shape:

```typescript
// Success
{ "success": true, "data": <T> }

// Error
{ "success": false, "error": { "code": "SOME_CODE", "message": "Human readable" } }
```

The mobile `client.ts` transparently unwraps `body.data` and throws `ApiError` on `success: false`.

---

## 7. Database — Models & Migrations

### Models overview

| Model | Purpose |
|-------|---------|
| `User` | Clerk identity + coin balance, streak, tier |
| `Subscription` | Each tracked subscription (Netflix, Spotify…) |
| `RecurringPayment` | Rent, utilities, EMIs |
| `ServiceLibrary` | Pre-loaded catalog (47 services) for auto-fill |
| `Reminder` | Scheduled push notification records |
| `CoinLedger` | Append-only audit trail of every coin event |
| `UserBadge` | Which badges a user has earned |
| `AuditLog` | Security-sensitive actions (deletion, login) |

### Schema location

`packages/db/prisma/schema.prisma` — this is the single source of truth for all database structure.

### Making a schema change

```bash
# 1. Edit packages/db/prisma/schema.prisma

# 2. Create and apply migration
cd packages/db
DATABASE_URL=<your-url> npx prisma migrate dev --name describe_your_change

# 3. Regenerate the Prisma client (types update automatically)
npm run db:generate    # from repo root

# 4. Commit both schema.prisma and the new migration file
git add packages/db/prisma/
```

> **Never edit migration files after they've been committed.** Create a new migration instead.

### Prisma client usage

The client is a singleton exported from `@subatone/db`:

```typescript
import { prisma } from '@subatone/db'

// All queries are type-safe — TypeScript will catch typos
const user = await prisma.user.findUnique({ where: { clerkId } })
```

All queries in route handlers **must be scoped to `userId`** to prevent one user from reading another's data (IDOR prevention):

```typescript
// ✅ Correct — scoped to authenticated user
const sub = await prisma.subscription.findFirst({
  where: { id, userId, deletedAt: null }
})

// ❌ Wrong — any user can fetch any subscription
const sub = await prisma.subscription.findFirst({ where: { id } })
```

---

## 8. API — Adding or Changing a Backend Feature

### Adding a new endpoint (step by step)

**Example:** Add `GET /api/v1/subscriptions/stats`

#### Step 1 — Add the Zod validator (if the endpoint accepts a body or query params)

`packages/validators/src/index.ts`:

```typescript
export const StatsQuerySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100).optional(),
})
```

#### Step 2 — Add the repository method

`apps/api/src/modules/subscriptions/subscriptions.repository.ts`:

```typescript
async getStats(userId: string, year?: number): Promise<SubscriptionStats> {
  // All queries scoped to userId
  const subs = await prisma.subscription.findMany({
    where: { userId, deletedAt: null }
  })
  // ... compute and return stats
}
```

#### Step 3 — Add the service method

`apps/api/src/modules/subscriptions/subscriptions.service.ts`:

```typescript
async getStats(userId: string, year?: number) {
  return this.repo.getStats(userId, year)
}
```

#### Step 4 — Add the route

`apps/api/src/modules/subscriptions/subscriptions.routes.ts`:

```typescript
subscriptionRoutes.get(
  '/stats',
  zValidator('query', StatsQuerySchema),
  async (c) => {
    const userId = c.get('userId')   // set by requireAuth
    const { year } = c.req.valid('query')
    const stats = await service.getStats(userId, year)
    return c.json({ success: true, data: stats })
  },
)
```

#### Step 5 — Add the TypeScript type

`packages/types/src/index.ts`:

```typescript
export interface SubscriptionStats {
  totalSpentThisYear: number
  mostExpensiveCategory: string
  // ...
}
```

#### Step 6 — Use it on mobile

`apps/mobile/src/modules/subscriptions/useSubscriptions.ts`:

```typescript
export function useSubscriptionStats(year?: number) {
  const api = useApiClient()
  return useQuery<SubscriptionStats>({
    queryKey: ['subscriptions', 'stats', year],
    queryFn: () => api.get<SubscriptionStats>(`/subscriptions/stats${year ? `?year=${year}` : ''}`),
  })
}
```

### Modifying an existing endpoint

1. Find the route in `apps/api/src/modules/<module>/<module>.routes.ts`
2. Find the business logic in `<module>.service.ts`
3. Find the DB query in `<module>.repository.ts`
4. Update the shared type in `packages/types/src/index.ts` if the response shape changes
5. Update the mobile hook in `apps/mobile/src/modules/<module>/use<Module>.ts`

### Module file structure pattern

Every module follows this exact pattern:

```
modules/<name>/
  <name>.routes.ts      ← HTTP handlers, Zod validation, thin layer only
  <name>.service.ts     ← Business logic (coin awards, calculations, side effects)
  <name>.repository.ts  ← All Prisma queries (no logic, just DB access)
```

**Never put Prisma queries directly in routes.** Never put HTTP logic in services.

---

## 9. Mobile — Screens, Navigation & State

### File-system routing

Expo Router maps files directly to routes:

| File | Route | When shown |
|------|-------|-----------|
| `app/(auth)/sign-in.tsx` | `/sign-in` | Unauthenticated |
| `app/(auth)/onboarding.tsx` | `/onboarding` | After first sign-in |
| `app/(tabs)/index.tsx` | `/` | Dashboard tab |
| `app/(tabs)/subscriptions.tsx` | `/subscriptions` | Subscriptions tab |
| `app/(tabs)/profile.tsx` | `/profile` | Profile tab |

**Adding a new screen:**

```bash
# New tab
touch apps/mobile/app/(tabs)/analytics.tsx
# Then add <Tabs.Screen name="analytics" ... /> in app/(tabs)/_layout.tsx

# New modal/stack screen
touch apps/mobile/app/subscription-detail.tsx
# Navigate: router.push('/subscription-detail?id=xyz')
```

### State management — two layers

**Layer 1: Server state (React Query)**

For any data that comes from the API, use React Query hooks. They handle loading, caching, refetching, and error states:

```typescript
// In apps/mobile/src/modules/<feature>/use<Feature>.ts
export function useSomething() {
  const api = useApiClient()
  return useQuery<SomeType>({
    queryKey: ['some-key'],          // cache key — must be unique per endpoint
    queryFn: () => api.get<SomeType>('/some-endpoint'),
    staleTime: 1000 * 30,           // how long before React Query refetches
  })
}

// Mutations (POST/PATCH/DELETE)
export function useCreateSomething() {
  const qc = useQueryClient()
  const api = useApiClient()
  return useMutation({
    mutationFn: (input: InputType) => api.post<ResultType>('/some-endpoint', input),
    onSuccess: () => {
      // Invalidate all queries that should refresh after this mutation
      qc.invalidateQueries({ queryKey: ['some-key'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
```

**Layer 2: Local state (Zustand)**

For state that doesn't come from the API (user profile cache, UI preferences), use the auth store:

```typescript
// apps/mobile/src/modules/auth/auth.store.ts
const user = useAuthStore((s) => s.user)
const setUser = useAuthStore((s) => s.setUser)
```

### API client

The `useApiClient()` hook (in `src/shared/api/client.ts`) returns four methods that:
1. Get a fresh Clerk JWT automatically
2. Prefix the path with `EXPO_PUBLIC_API_URL/api/v1`
3. Attach `Authorization: Bearer <token>`
4. Unwrap `body.data` from the API envelope
5. Throw `ApiError` if `body.success === false`

```typescript
const api = useApiClient()

await api.get<T>('/path')
await api.post<T>('/path', body)
await api.patch<T>('/path', body)
await api.delete('/path')
```

---

## 10. Shared Packages — Types & Validators

### `@subatone/types`

Contains all TypeScript interfaces shared between API and mobile. **If you change a data shape, you change it here first.**

```typescript
// packages/types/src/index.ts

export interface Subscription {
  id: string
  name: string
  amount: number
  // ... every field the API returns and the mobile expects
}
```

### `@subatone/validators`

Contains Zod schemas used for:
- **API:** request body / query param validation via `@hono/zod-validator`
- **Mobile:** form validation (same schema, no duplication)

```typescript
// packages/validators/src/index.ts

export const CreateSubscriptionSchema = z.object({
  name: z.string().min(1).max(100),
  amount: positiveAmount,
  billingCycle: BillingCycleSchema,
  // ...
})

// TypeScript type is inferred from schema — no manual interface needed
export type CreateSubscriptionOutput = z.infer<typeof CreateSubscriptionSchema>
```

**Rule:** If the API validates a field, that same Zod schema should be used on the mobile form. Never duplicate validation logic.

---

## 11. Authentication & Security

### How auth works

```
User → Clerk (phone OTP / Google) → Clerk JWT issued
Mobile → JWT stored in SecureStore (encrypted on device)
Mobile → Every API call includes: Authorization: Bearer <jwt>
API → verifyToken(jwt, { jwtKey }) — RSA signature check, LOCAL, no network
API → Looks up user in DB by clerkId
API → Attaches userId to request context
Route handler → Uses userId from context, never from request body
```

### The `requireAuth` middleware

`apps/api/src/middleware/auth.ts` — applied via `subscriptionRoutes.use('*', requireAuth)` at the top of every protected module's routes file.

After `requireAuth`, every handler can safely call:

```typescript
const userId = c.get('userId')   // DB primary key (cuid)
const clerkId = c.get('clerkId') // Clerk user ID (e.g. user_abc123)
```

### Security rules — never break these

| Rule | Why |
|------|-----|
| Every route that returns user data must call `requireAuth` | Prevents unauthenticated access |
| Every DB query must include `where: { userId }` | Prevents IDOR (user A reading user B's data) |
| Never log sensitive fields (passwords, tokens, UPI IDs) | Pino `redact` config handles this but don't add new sensitive fields to logs manually |
| Never return stack traces in production | `error.ts` middleware handles this — `NODE_ENV=production` strips stack traces |
| Never trust data from the request body for ownership | Use `userId` from context (set by auth middleware), never from `body.userId` |
| `CLERK_JWT_KEY` must be the RSA public key (base64 SPKI, no PEM headers) | Without this, the API falls back to JWK network fetching which is slow and fails on strict networks |

### Updating the Clerk JWT key

If Clerk rotates keys (rare) or you set up a new Clerk instance:

```bash
# Fetch the new public key
node -e "
const https = require('https')
const crypto = require('crypto')
https.get('https://<your-instance>.clerk.accounts.dev/.well-known/jwks.json', res => {
  let d = ''
  res.on('data', c => d += c)
  res.on('end', () => {
    const jwk = JSON.parse(d).keys[0]
    const key = crypto.createPublicKey({ key: jwk, format: 'jwk' })
    const pem = key.export({ type: 'spki', format: 'pem' })
    console.log(pem.replace(/-----.*-----\n?/g, '').replace(/\n/g, ''))
  })
})
"
# Paste the output into apps/api/.env → CLERK_JWT_KEY=<output>
# Restart the API
```

### Rate limiting

`apps/api/src/middleware/rate-limit.ts` implements a sliding window limiter:
- Default: **100 requests / 60 seconds per IP**
- Auth routes: **10 requests / 60 seconds per IP**
- Uses Redis if `REDIS_URL` is set; falls back to in-memory `Map` if not

To change limits, update these env vars in `apps/api/.env`:

```env
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX=10
```

---

## 12. Gamification Module

### Coin economy rules

| Event | Coins |
|-------|-------|
| Add a subscription | +10 (flat) |
| Mark subscription as paid (monthly) | +`floor(amount / 10)` |
| Mark subscription as paid (annually) | +`floor(amount / 10) × 1.5` |
| Sign-up bonus | +50 |

### Tier thresholds (lifetime coins, never demote)

| Tier | Lifetime coins needed |
|------|-----------------------|
| ROOKIE | 0 |
| REGULAR | 501 |
| PRIME | 2,001 |
| ELITE | 10,001 |
| OBSIDIAN | 50,001 |

### Badge rules

Defined in `apps/api/src/modules/gamification/gamification.service.ts`:

| Badge | Condition |
|-------|-----------|
| FIRST_STEP | ≥1 subscription added |
| SUBSCRIPTION_NINJA | ≥20 subscriptions |
| WEEK_WARRIOR | ≥100 lifetime coins |
| MONTH_MASTER | ≥1 month streak |
| STREAK_6_MONTHS | ≥6 month streak |
| STREAK_12_MONTHS | ≥12 month streak |

### Adding a new badge

1. Add the slug to `BadgeSlug` enum in `packages/db/prisma/schema.prisma`
2. Run `npm run db:migrate`
3. Add the rule to `BADGE_RULES` array in `gamification.service.ts`
4. Display it in the mobile profile screen

---

## 13. Reminders & Push Notifications

### How reminders work

```
User adds subscription (nextRenewalDate = 2026-08-01)
  ↓
subscriptions.service.ts calls reminders.service.createReminders()
  ↓
For each daysBefore in [7, 3, 1]:
  - Creates a Reminder DB record (status: PENDING)
  - Enqueues a BullMQ job with delay = (renewalDate - daysBefore) - now
  ↓
On job execution date:
  - Worker calls reminders.service.sendReminder()
  - Reads user.expoPushToken from DB
  - Calls Expo Push API → phone receives notification
```

### Requirements

Reminders only work when `REDIS_URL` is set (Upstash in production). In local development without Redis, jobs are silently dropped (rate limiter falls back to in-memory, reminders don't fire). This is intentional — use a staging environment with Upstash to test end-to-end.

### Push token registration

The mobile app requests permission and saves the Expo push token during `useAuthSync` → `POST /auth/sync`. The token is stored in `User.expoPushToken`.

---

## 14. Updating the UI

### Design tokens

All colours are in `apps/mobile/src/shared/constants/colors.ts`. **Never use hardcoded hex values in components** — always reference `Colors.*`:

```typescript
import { Colors } from '../../shared/constants/colors'

// ✅ Correct
backgroundColor: Colors.primary

// ❌ Wrong — breaks theming
backgroundColor: '#7C3AED'
```

### Adding a new reusable component

1. Create the file in `apps/mobile/src/shared/components/MyComponent.tsx`
2. Use `StyleSheet.create()` for all styles (enables style flattening optimisation)
3. Accept an `accessibilityLabel` prop for screen reader support
4. Export as named export (not default), e.g. `export function MyComponent`

### Changing an existing screen

1. Open the screen file in `apps/mobile/app/(tabs)/` or `app/(auth)/`
2. The screen fetches data via a hook (e.g. `useDashboard()`, `useSubscriptions()`)
3. Never fetch data directly in a screen — always go through a hook in `src/modules/`
4. Never call `prisma` or backend code from the mobile app

### Adding a new tab

1. Create `apps/mobile/app/(tabs)/myscreen.tsx`
2. Add a `<Tabs.Screen name="myscreen" ... />` entry in `apps/mobile/app/(tabs)/_layout.tsx`
3. Add an icon to the `icons` map in the `TabIcon` function

---

## 15. Environment Variables Reference

### `apps/api/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `CLERK_SECRET_KEY` | ✅ | Clerk backend secret (`sk_test_...`) |
| `CLERK_PUBLISHABLE_KEY` | ✅ | Clerk publishable key (`pk_test_...`) |
| `CLERK_JWT_KEY` | ✅ | RSA public key (base64 SPKI, no PEM headers) — enables offline JWT verification |
| `DATABASE_URL` | ✅ | Supabase session pooler PostgreSQL URL |
| `NODE_ENV` | ✅ | `development` or `production` |
| `API_PORT` | ✅ | Port for the HTTP server (default: `3000`) |
| `LOG_LEVEL` | ✅ | Pino log level (`info`, `debug`, `warn`) |
| `REDIS_URL` | Optional | Upstash Redis URL (`rediss://...`) — enables reminders and Redis-backed rate limiting |
| `RATE_LIMIT_WINDOW_MS` | Optional | Rate limit window in ms (default: `60000`) |
| `RATE_LIMIT_MAX_REQUESTS` | Optional | Max requests per window (default: `100`) |
| `RATE_LIMIT_AUTH_MAX` | Optional | Max auth requests per window (default: `10`) |

### `apps/mobile/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Same publishable key as API |
| `EXPO_PUBLIC_API_URL` | ✅ | Base URL for the API (e.g. `http://192.168.x.x:3000` on LAN) |

> **Prefix rule:** Mobile env vars must start with `EXPO_PUBLIC_` to be bundled into the app. Never put secrets (like the Clerk secret key) in the mobile `.env` — it is readable by anyone who decompiles the app.

---

## 16. Testing

### Running tests

```bash
# All tests across all workspaces
npm run test

# API tests only (includes journey/integration tests)
cd apps/api && npm run test

# Watch mode
cd apps/api && npm run test:watch

# Journey tests (full end-to-end API flows, run in-process)
cd apps/api && npm run test:journeys
```

### Test structure

API tests live in `apps/api/src/__tests__/`:

```
__tests__/
  helpers/
    journey.ts          ← Test client that talks to the app in-process
  journeys/
    01-onboarding.journey.test.ts
    02-subscription-payment.journey.test.ts
    03-rent-and-coins.journey.test.ts
    04-gamification.journey.test.ts
    05-error-and-edge-cases.journey.test.ts
```

Journey tests exercise entire user flows (sign in → add subscription → mark paid → check coins) without a running server. They use the same `createApp()` factory but call it in-process.

### Adding a test for a new endpoint

```typescript
// apps/api/src/__tests__/journeys/06-my-feature.journey.test.ts

import { createJourneyClient } from '../helpers/journey'

describe('My feature', () => {
  const client = createJourneyClient()

  it('returns correct data', async () => {
    const res = await client.get('/api/v1/my-endpoint', { userId: 'test-user' })
    expect(res.status).toBe(200)
    expect(res.body.data).toMatchObject({ /* expected shape */ })
  })
})
```

---

## 17. Common Mistakes & How to Avoid Them

### The API starts but all requests return 401

**Cause:** `CLERK_JWT_KEY` is missing or wrong format.

**Fix:**
1. Check `apps/api/.env` has `CLERK_JWT_KEY=` (392 chars, no spaces, no PEM headers)
2. Restart the API — `tsx watch` does NOT reload `.env` on file changes, only on source file changes. Kill the process and re-run `npm run dev`.

---

### Subscriptions show on dashboard but not on the subscriptions tab

**Cause:** API response shape mismatch. The subscriptions list endpoint returns `{ success: true, data: { items: [...], pagination: {...} } }`. The mobile hook reads `data?.items`. If you accidentally change the route to return `data: items` (a flat array), `.items` will be `undefined`.

**Fix:** The subscriptions GET route must return the full `PaginatedResponse` object as `data`:
```typescript
return c.json({ success: true, data: result })  // result = { items, pagination }
```

---

### Metro bundler shows "Cannot find module X"

**Cause:** A package was installed in the wrong workspace, or `metro.config.js` doesn't resolve monorepo root packages.

**Fix:**
1. Check `apps/mobile/metro.config.js` has `watchFolders: [monorepoRoot]` and `nodeModulesPaths` pointing to both local and root `node_modules`
2. Run `npx expo start --clear` to clear Metro cache

---

### `tsx watch` suspends when backgrounded

**Cause:** `tsx watch` has an interactive mode that reads from stdin. Backgrounding with `&` causes SIGTTIN (suspended waiting for terminal input).

**Fix:** Always start with stdin redirected:
```bash
nohup npm run dev </dev/null > /tmp/api.log 2>&1 &
```

---

### Database: "Environment variable not found: DATABASE_URL"

**Cause:** The API process didn't load `apps/api/.env`. The dev script must include `--env-file .env`:
```json
"dev": "tsx watch --env-file .env src/index.ts"
```

If someone ran `tsx watch src/index.ts` (without the flag), no env vars are loaded.

---

### Push notifications not firing in development

**Cause:** Reminder jobs require Redis. Without `REDIS_URL`, BullMQ falls back to nothing — jobs are never queued.

**Fix:** Add an Upstash Redis URL to `apps/api/.env` and restart. For local development, install Redis locally (`brew install redis && brew services start redis`) and add `REDIS_URL=redis://localhost:6379`.

---

### Type error after changing a Prisma model

**Cause:** Prisma client types are generated at install time. After schema changes, types are stale.

**Fix:**
```bash
npm run db:generate   # regenerates @prisma/client types
```
Then restart your TypeScript language server in VS Code (`Cmd+Shift+P → TypeScript: Restart TS Server`).

---

### "Cannot read property X of undefined" in a screen

**Cause:** Usually an API response shape mismatch — the hook is typed as `TypeA` but the API actually returns `TypeB`, and you're accessing a field that doesn't exist.

**Fix:**
1. Add a `console.log(data)` in the hook's `queryFn` to see the actual shape
2. Compare it to the TypeScript interface in `packages/types/src/index.ts`
3. Fix the mismatch in either the API response or the type definition

---

## Quick Reference — Files to Touch for Common Changes

| What you want to change | File(s) to edit |
|------------------------|-----------------|
| Add a new API endpoint | `apps/api/src/modules/<module>/<module>.routes.ts` + `.service.ts` + `.repository.ts` |
| Change DB schema | `packages/db/prisma/schema.prisma` → run `npm run db:migrate` |
| Add/change a TypeScript type | `packages/types/src/index.ts` |
| Add/change form validation | `packages/validators/src/index.ts` |
| Add a new screen | `apps/mobile/app/(tabs)/<screen>.tsx` + update `_layout.tsx` |
| Change a colour | `apps/mobile/src/shared/constants/colors.ts` |
| Add a reusable component | `apps/mobile/src/shared/components/<Component>.tsx` |
| Change coin earn rules | `apps/api/src/modules/gamification/gamification.service.ts` |
| Change reminder timing | `apps/api/src/modules/subscriptions/subscriptions.service.ts` (`DEFAULT_REMINDER_DAYS`) |
| Add a badge | `schema.prisma` (BadgeSlug enum) + `gamification.service.ts` (BADGE_RULES) |
| Change rate limits | `apps/api/.env` (`RATE_LIMIT_*`) |
| Add a service to the library | `npm run db:seed:library` after editing `packages/db/prisma/seed-library.ts` |
| Rotate Clerk JWT key | Re-fetch SPKI key → update `CLERK_JWT_KEY` in `apps/api/.env` → restart API |
