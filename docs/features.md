# Subatone — Feature Specification

> Feature-complete definition across all phases. Organized by core pillars.

---

## Pillar 1 — Subscription & Recurring Payment Tracker

### 1.1 Subscription Management
- Add subscription manually: name, amount, currency, category, billing cycle, next renewal date, notes
- Pre-loaded library of 200+ popular services with logos, default amounts, and billing cycles (Netflix, Spotify, ChatGPT, GitHub Copilot, Hotstar, Jio, Airtel, etc.)
- Search and auto-fill from library when adding a new subscription
- Support billing cycles: weekly, monthly, quarterly, half-yearly, annual, custom interval
- Mark subscription as: Active, Paused, Trial, Cancelled
- Track free trial end date separately with auto-alert before conversion
- Tag subscriptions (personal, work, shared, family)
- Attach receipt/invoice (image or PDF) to any subscription
- Multi-currency support with real-time conversion to home currency

### 1.2 Rent & Utility Payments
- Add rent as a recurring payment with landlord name, amount, due date
- Track utilities: electricity, gas, water, internet, maintenance
- Support partial payments and payment history per landlord/utility
- Store landlord bank account / UPI ID securely for repeat payments
- Generate rent receipt PDF automatically after payment

### 1.3 Smart Import (Phase 2)
- Parse incoming SMS from known senders (Jio, Airtel, Netflix, etc.) to auto-detect subscriptions
- Gmail integration: scan for subscription confirmation and billing emails
- Bank statement upload (PDF/CSV): detect recurring debit patterns
- UPI transaction history import: identify recurring payees
- Account Aggregator (AA) framework integration for Indian banks (RBI-compliant)

---

## Pillar 2 — Dashboard & Analytics

### 2.1 Home Dashboard
- Total monthly burn: sum of all active subscriptions + rent + utilities
- Upcoming renewals in next 7 / 14 / 30 days — sorted by due date
- Quick-add FAB for fast subscription entry
- Category-wise spend rings (donut chart)
- "This month vs last month" delta indicator
- Overdue payments alert strip

### 2.2 Analytics
- Monthly and annual spend trend (line chart, last 12 months)
- Category breakdown: OTT, AI Tools, Mobile, Finance, Health, Rent, etc.
- Spend heatmap: which days of the month are heaviest
- Subscription count over time (growth of recurring commitments)
- Dormant subscriptions: flagged if not used in 30+ days (requires usage data or manual flag)
- Potential annual savings if switched to annual plans

### 2.3 Reports
- Monthly summary report (PDF/share card) — shareable on WhatsApp/social
- Annual review: "Your year in subscriptions"
- Export data as CSV or JSON

---

## Pillar 3 — Payment Routing (Core Differentiator)

### 3.1 Pay Through Subatone
- Route subscription payments via UPI, debit/credit card, net banking
- Schedule auto-pay for subscriptions through Subatone (NACH/UPI Autopay mandate)
- One-tap manual payment with confirmation and receipt capture
- Pay rent to landlord via UPI/NEFT from within the app
- Credit card bill split across subscriptions for tracking

### 3.2 Payment Intelligence
- Smart retry: if a payment fails, alert user and offer alternative payment method
- Pre-payment alert: 3-day advance push notification before auto-debit
- Payment confirmation: mark as paid manually or detect via SMS/email
- Spending limit per category: alert when approaching threshold

### 3.3 Group & Shared Payments
- Split subscription cost with family/roommates
- Create a shared "subscription pot" — each member contributes their share
- Track who owes what in shared subscriptions
- Request payment from co-subscribers in-app

---

## Pillar 4 — Gamification Engine (Core Differentiator)

### 4.1 Suba Coins
- Earn coins on every payment routed through Subatone
- Coin earn rates:
  - Subscription payment on time: 1x base coins
  - Rent payment via Subatone: 3x base coins
  - Annual plan payment: 2x base coins
  - First payment of a new subscription: bonus coins
  - Streak bonus: consecutive on-time payments multiply coins
- Coins displayed prominently on home screen with animated counter on earn
- Coin history: full ledger of earned and redeemed coins

### 4.2 Streaks & Challenges
- **On-Time Streak:** consecutive months with 0 missed renewals
  - 3-month streak: Bronze badge
  - 6-month streak: Silver badge
  - 12-month streak: Gold badge + 500 bonus coins
- **Monthly Challenges:**
  - "Pay all subscriptions before the 5th" → 200 bonus coins
  - "Add 3 new subscriptions this week" → 100 coins
  - "Zero missed payments this quarter" → Platinum badge
- **Savings Challenges:**
  - "Cut ₹500 in subscriptions this month" → 300 coins + achievement card
  - "Switch 2 subscriptions to annual plan" → 400 coins

### 4.3 Levels & Tiers (Member Tiers)
| Tier | Requirement | Perks |
|---|---|---|
| Rookie | 0–500 coins earned lifetime | Basic app access |
| Regular | 501–2,000 coins | Early access to deals, 1.1x coin multiplier |
| Prime | 2,001–10,000 coins | Exclusive brand deals, 1.25x multiplier, priority support |
| Elite | 10,001–50,000 coins | Highest-value rewards, 1.5x multiplier, beta features, personal finance advisor access |
| Obsidian | 50,001+ coins | Invite-only perks, white-glove service, brand collaborations |

Tier is calculated on **lifetime coins earned** (not balance) — modelled on CRED's black card psychology.

### 4.4 Achievements & Badges
- "Subscription Ninja" — tracking 20+ active subscriptions
- "Rent Master" — 12 consecutive rent payments through Subatone
- "Early Bird" — pay every subscription 3+ days before due date for 3 months
- "Minimalist" — cut total subscriptions by 30%
- "Annual Optimizer" — all subscriptions on annual plans
- "AI Spender" — tracking 5+ AI tool subscriptions
- Shareable achievement cards for social media (custom designed per badge)

### 4.5 Coin Redemption Store
- Cashbacks on partner brand subscriptions (funded by brands)
- Discount vouchers: Swiggy, Amazon, Flipkart, Myntra
- OTT subscription renewals at discounted coin rates
- Entry to exclusive draws (electronics, experiences)
- Donate coins to charity partners
- Unlock premium app features temporarily (trial Pro features with coins)

---

## Pillar 5 — AI Advisor

### 5.1 Spend Intelligence
- "You are spending ₹4,200/month on OTT. The average for your city is ₹1,800. Here are 3 subscriptions you could cut."
- "Switching Netflix + Prime to annual would save you ₹3,600/year."
- "You've paid for Headspace for 8 months but marked it as 'rarely use.'"

### 5.2 Subscription Recommendations
- Suggest better-value alternatives to active subscriptions
- Recommend bundles (e.g., "Jio + Hotstar bundle is cheaper than separate subscriptions")
- Alert when a cheaper plan tier is available

### 5.3 Predictive Alerts
- "Your annual Spotify plan renews in 4 days. Your UPI is low — top up ₹1,299."
- "3 subscriptions renew on the same day. Total: ₹2,100. Ensure funds."
- "You added 2 subscriptions last month. Your monthly burn increased 18%."

---

## Pillar 6 — Notifications & Reminders

- Renewal reminders: 7 days, 3 days, 1 day, day-of (configurable per subscription)
- Free trial expiry alerts: 5 days, 2 days, day-before
- Price increase alerts (detected via SMS/email parsing)
- Payment failure alerts with retry prompt
- Coin earn celebration: animated push on payment success
- Weekly digest: "This week: 3 renewals, ₹1,450 spent, 320 coins earned"
- Monthly report: "June recap" push with summary card

---

## Pillar 7 — Social & Community (Phase 3)

- Share achievement cards to Instagram, WhatsApp, X
- Anonymous community stats: "Subatone users spend avg ₹2,300/month on OTT"
- "Subscription confession" — anonymous poll: "Am I paying too much for X?"
- Referral programme: earn 500 coins per friend who signs up and adds first subscription
- Family/household view: shared dashboard for couples or flatmates

---

## Pillar 8 — Privacy & Security

- PIN / biometric lock for app access
- All financial data encrypted at rest (AES-256) and in transit (TLS 1.3)
- Local-first mode: data stays on device, no cloud sync unless opted in
- No selling of individual-level data to third parties
- Full data export at any time (GDPR / DPDP compliant)
- Delete account and all data: permanent, irreversible, instant
- SMS/email parsing is on-device only (never sent to server raw)
- Session timeout and re-authentication for payment actions

---

## Feature Priority Matrix

| Feature | Phase | Impact | Effort |
|---|---|---|---|
| Manual subscription tracking | 1 | High | Low |
| Dashboard + upcoming renewals | 1 | High | Low |
| Push reminders | 1 | High | Low |
| Suba Coins on payment | 1 | High | Medium |
| Streaks & badges | 1 | High | Medium |
| Coin redemption (basic) | 1 | High | Medium |
| Rent payment | 1 | High | Medium |
| Bank/SMS import | 2 | High | High |
| AI Advisor | 2 | High | High |
| Group subscriptions | 2 | Medium | Medium |
| Financial product referrals | 2 | High | Medium |
| Subscription marketplace | 3 | High | Very High |
| Social sharing | 3 | Medium | Low |
| B2B white-label | 3 | High | High |
