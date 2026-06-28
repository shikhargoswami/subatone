# Subatone — Implementation Plan

> Technical architecture, development phases, and execution roadmap.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│   Mobile App (iOS + Android)    Web App (Dashboard)    │
│   React Native / Expo           Next.js 15              │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS / WebSocket
┌────────────────────▼────────────────────────────────────┐
│                    API GATEWAY                          │
│            (rate limiting, auth, routing)               │
│                    Hono / Kong                          │
└────────────────────┬────────────────────────────────────┘
          ┌──────────┴──────────┐
          ▼                     ▼
┌─────────────────┐   ┌─────────────────────────────────┐
│  Core API       │   │  Background Workers              │
│  Node.js/Hono   │   │  BullMQ + Redis                  │
│  REST + tRPC    │   │  - Renewal reminder jobs         │
│                 │   │  - SMS/email parsing             │
│                 │   │  - Coin credit jobs              │
│                 │   │  - Payment status polling        │
└────────┬────────┘   └─────────────────────────────────┘
         │
┌────────▼────────────────────────────────────────────────┐
│                    DATA LAYER                           │
│  PostgreSQL (primary)     Redis (cache + queues)        │
│  Prisma ORM               S3-compatible (receipts)      │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Mobile App
| Concern | Choice | Reason |
|---|---|---|
| Framework | React Native + Expo | Single codebase, OTA updates, fast iteration |
| Navigation | Expo Router (file-based) | App Router paradigm, familiar |
| State | Zustand | Lightweight, no boilerplate |
| Local DB | Expo SQLite + Drizzle ORM | Offline-first, fast queries |
| Animations | Reanimated 3 + Lottie | Coin animations, streak effects |
| Charts | Victory Native XL | Performant native charts |
| Payments | Razorpay React Native SDK | UPI, cards, netbanking; India-first |
| Notifications | Expo Notifications + FCM | Cross-platform push |
| Auth | Clerk (Expo SDK) | OTP + Google + Apple sign-in |

### Web App
| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts / Tremor |
| Auth | Clerk (Next.js SDK) |
| Data fetching | TanStack Query + tRPC |

### Backend
| Concern | Choice |
|---|---|
| Runtime | Node.js 22 (LTS) |
| Framework | Hono (edge-compatible, fast) |
| API style | tRPC for type-safe RPC + REST for webhooks |
| ORM | Prisma 6 |
| Primary DB | PostgreSQL 16 (via Supabase or Railway) |
| Cache / Queue | Redis (Upstash for serverless) |
| Job queue | BullMQ |
| File storage | Cloudflare R2 (receipts, invoice PDFs) |
| Email | Resend |
| SMS (India) | AWS SNS / Twilio |
| Payments | Razorpay (India) + Stripe (international) |
| Auth | Clerk |
| Monitoring | Sentry + Posthog |
| Hosting | Railway (backend) + Vercel (web) + Expo EAS (mobile) |

---

## Database Schema (Core Tables)

```sql
-- Users
users (id, clerk_id, name, email, phone, currency, timezone, tier, coins_balance, 
       coins_lifetime, streak_days, streak_last_date, plan, created_at)

-- Subscriptions
subscriptions (id, user_id, name, category, amount, currency, billing_cycle,
               next_renewal_date, start_date, trial_end_date, status, 
               logo_url, notes, tags, is_shared, created_at, updated_at)

-- Rent & Utilities
recurring_payments (id, user_id, type[rent|utility|emi|other], name, amount,
                    currency, due_day_of_month, landlord_name, upi_id,
                    account_number, ifsc, status, created_at)

-- Payment Records
payment_records (id, user_id, reference_id, reference_type[subscription|rent|utility],
                 amount, currency, status[pending|success|failed], 
                 payment_method, gateway_txn_id, coins_earned, paid_at)

-- Coin Ledger
coin_ledger (id, user_id, delta, type[earn|redeem|expire|bonus], 
             reference_id, description, created_at)

-- Achievements
achievements (id, user_id, badge_slug, earned_at)

-- Reminders
reminders (id, subscription_id, user_id, days_before, channels[push|email|sms],
           is_sent, scheduled_at, sent_at)

-- Reward Catalogue
rewards (id, brand_id, title, description, coin_cost, type[cashback|voucher|deal],
         value_amount, expiry, stock, is_active)

-- Redemptions
redemptions (id, user_id, reward_id, coins_spent, status, redeemed_at, expires_at)
```

---

## Phase 1 — MVP (Weeks 1–8)

**Goal:** Working app with manual tracking, gamification, and rent payment.

### Week 1–2: Foundation
- [ ] Monorepo setup (Turborepo): `apps/mobile`, `apps/web`, `packages/db`, `packages/api`
- [ ] Prisma schema: users, subscriptions, recurring_payments, coin_ledger, payment_records
- [ ] Clerk auth integration (OTP + Google)
- [ ] Core CRUD API for subscriptions (tRPC)
- [ ] React Native app skeleton with Expo Router tabs

### Week 3–4: Core Tracker
- [ ] Subscription list screen with add/edit/delete
- [ ] Pre-loaded service library (200 entries: name, logo, default amount, cycle)
- [ ] Dashboard: monthly burn, upcoming renewals (next 30 days)
- [ ] Category breakdown chart
- [ ] Rent & recurring payment module

### Week 5–6: Gamification Layer
- [ ] Suba Coins engine: earn rules, ledger, balance display
- [ ] Streak tracker: calculate and persist streak, reset on miss
- [ ] Achievement system: badge definitions, trigger evaluation, unlock flow
- [ ] Animated coin earn celebration (Lottie)
- [ ] Coin store UI (static, no real redemption yet)

### Week 7–8: Reminders & Payments
- [ ] Push notification setup (Expo + FCM)
- [ ] Reminder scheduler (BullMQ jobs per subscription)
- [ ] Razorpay payment integration (pay subscription/rent)
- [ ] Coins credited on successful payment (post-webhook)
- [ ] Payment history screen
- [ ] Beta TestFlight / internal Play Store track release

---

## Phase 2 — Growth (Month 3–5)

**Goal:** Smart import, AI advisor, financial product integrations.

### Smart Import
- [ ] SMS parsing (on-device regex, never raw SMS sent to server)
  - Known sender patterns: Jio, Airtel, Netflix, Spotify, OpenAI, GitHub, etc.
  - Present detected subscriptions as suggestions (user confirms)
- [ ] Gmail OAuth: scan for billing/subscription emails
  - Parse subject + sender, extract amount + service name
- [ ] Bank statement PDF upload + parsing
  - Use a PDF parser + LLM extraction (amount, merchant, date, recurrence detection)
- [ ] Account Aggregator (AA) integration via Setu/Finvu for auto bank data

### AI Advisor
- [ ] LLM-powered spend analysis (OpenAI GPT-4o or Claude claude-sonnet-4-5)
- [ ] "Reduce my spend" flow: AI suggests cuts based on usage flags + cost
- [ ] Annual plan savings calculator
- [ ] Price alert system: detect price changes from email/SMS

### Financial Products Module
- [ ] Insurance lead gen integration (PolicyBazaar / Ditto API)
- [ ] Credit card recommendation engine (based on spend categories)
- [ ] BNPL for annual plans: integrate with lending partner (Slice, KreditBee)

### Analytics Upgrade
- [ ] 12-month trend view
- [ ] Spend heatmap
- [ ] Monthly PDF report generation (Puppeteer or React PDF)

---

## Phase 3 — Scale (Month 6–12)

**Goal:** Marketplace, B2B, social features, profitability.

### Subscription Marketplace
- [ ] Partner onboarding portal for brands
- [ ] Featured deals placement engine
- [ ] Group buying module (aggregate demand for annual plans)
- [ ] Affiliate link tracking and attribution

### Social & Community
- [ ] Shareable achievement and monthly report cards (image generation via Satori/Sharp)
- [ ] Referral programme with coin rewards
- [ ] Anonymous community stats: "Users in Bengaluru spend avg ₹X on OTT"

### B2B White-label
- [ ] Embeddable widget SDK (React Native + Web)
- [ ] Partner dashboard for neobanks
- [ ] White-label theming API

### Platform Hardening
- [ ] SOC 2 Type I readiness
- [ ] RBI PPI (Prepaid Payment Instrument) licence exploration for in-app wallet
- [ ] Full DPDP Act compliance audit
- [ ] Load testing: 100K concurrent users

---

## Infrastructure & DevOps

### CI/CD
- GitHub Actions for all pipelines
- Expo EAS Build + Submit for mobile
- Vercel for web (preview deployments per PR)
- Railway for backend (auto-deploy on main)

### Environments
- `development` — local docker-compose (PostgreSQL + Redis)
- `staging` — Railway staging environment
- `production` — Railway production + Supabase PostgreSQL + Upstash Redis

### Observability
- **Error tracking:** Sentry (mobile + web + API)
- **Analytics:** Posthog (product analytics, funnels, session replay)
- **APM:** Railway metrics + custom dashboards
- **Alerts:** PagerDuty for P0 (payment failures, auth outages)

### Security
- All secrets in environment variables (never in code)
- Razorpay webhook signature verification
- Clerk JWT verification on every API call
- Input validation via Zod on all tRPC procedures
- Rate limiting: 100 req/min per user (API gateway)
- HTTPS enforced everywhere; HSTS enabled
- AES-256 encryption for stored bank account details
- PII fields encrypted at column level (Prisma field encryption)

---

## Team Structure (Ideal Seed Team)

| Role | Count | Responsibility |
|---|---|---|
| Founding Engineer / Full-stack | 1 | Architecture, backend, web |
| Mobile Engineer | 1 | React Native app, animations, payments |
| Product / Design | 1 | UX, Figma, user research |
| Growth / Marketing | 0.5 | Launch, content, partnerships |

Scale to 6–8 engineers post-seed funding.

---

## Key Technical Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Payment gateway failures | Dual gateway (Razorpay primary + Cashfree fallback); retry queue |
| SMS parsing accuracy | On-device regex with user confirmation step; never auto-add |
| AA integration complexity | Use Setu's pre-built AA stack; staged rollout |
| Coin system abuse | Rate limits, device fingerprinting, manual review queue for large earn events |
| App Store rejection (payment routing) | Use in-app browser / deep link to provider for App Store; native payment only on Android/web |
| Data breach | Column-level encryption, minimal PII storage, no storing raw card data (Razorpay tokenisation) |
