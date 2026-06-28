# Subatone

> CRED for subscriptions and recurring payments.

Track every subscription, recharge, rent, and recurring deduction in one place — and get rewarded with **Suba Coins** every time you pay on time.

---

## What is Subatone?

Most people pay for 10–15 subscriptions every month and have no clear picture of the total. Netflix, Spotify, ChatGPT, GitHub Copilot, Jio recharge, gym membership, rent — it all adds up silently.

Subatone fixes that. It gives you one dashboard for every recurring payment, sends reminders before anything renews, lets you route payments through the app, and rewards you with coins for staying on top of your money.

The business model is identical to CRED: **the user is the product, brands pay to reach them, and coins are the reward mechanism funded by those brands.**

---

## Status

> Planning & documentation phase. App development has not started.

---

## Documentation

| Document | Description |
|---|---|
| [docs/plan.md](docs/plan.md) | Vision, positioning, the CRED parallel, roadmap |
| [docs/features.md](docs/features.md) | Full feature spec across all pillars and phases |
| [docs/implementation.md](docs/implementation.md) | Tech stack, architecture, DB schema, dev phases |
| [docs/monetization.md](docs/monetization.md) | Revenue streams, the brand flywheel, unit economics |
| [docs/economics.md](docs/economics.md) | Coin earn/redeem rates in INR by every segment |
| [docs/user_journey.md](docs/user_journey.md) | Onboarding flow, engagement loops, user personas |
| [docs/validation.md](docs/validation.md) | Market validation, bypass analysis, honest verdict |
| [docs/zero-to-launch.md](docs/zero-to-launch.md) | How to build this from scratch with zero money |

---

## Core Concept

```
User pays subscription via Subatone
        ↓
Earns Suba Coins (₹0.10 per coin)
        ↓
Coins accumulate → streak grows → tier unlocks
        ↓
Coins redeemed for cashbacks and brand deals (funded by brands)
        ↓
Brands pay Subatone for access to a verified premium-spending audience
        ↓
Platform earns margin on every redemption + transaction fees on rent
```

---

## Coin Earn Rates (Quick Reference)

| Payment Type | Earn Rate | Example |
|---|---|---|
| Monthly subscription | 1 coin per ₹10 (1%) | Netflix ₹649 → 64 coins |
| Annual subscription | 1.5 coins per ₹10 (1.5%) | Hotstar Annual ₹1,499 → 224 coins |
| Rent payment | 3 coins per ₹10 (3%) | Rent ₹18,000 → 3,600 coins |
| Insurance premium | 1.5 coins per ₹10 (1.5%) | Term ins. ₹12,000/yr → 1,800 coins |

1 Suba Coin = ₹0.10 redeemable value (brand-funded).

---

## Tech Stack (Planned)

- **Mobile:** React Native + Expo
- **Web:** Next.js 15
- **Backend:** Node.js + Hono + tRPC
- **Database:** PostgreSQL via Supabase + Prisma ORM
- **Auth:** Clerk (OTP + Google + Apple)
- **Payments:** Razorpay (India) + Stripe (international)
- **Queue:** BullMQ + Upstash Redis
- **Hosting:** Vercel (web) + Railway (API) + Expo EAS (mobile)

---

## Roadmap

| Phase | Timeline | Milestone |
|---|---|---|
| Planning | Now | ✅ All documentation complete |
| MVP Build | Weeks 1–8 | Manual tracker + coins + rent + reminders |
| Beta Launch | Week 9–12 | 1,000 users, Day-7 retention ≥ 30% |
| Growth | Month 3–5 | SMS import, AI advisor, first brand partner |
| Fundraising | Month 5–8 | Seed round at ≥3,000 MAU + ₹10K MRR |

---

## License

Private. All rights reserved.
