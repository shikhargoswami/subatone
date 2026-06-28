# Subatone — Reward & Coin Economics

> Every number in INR. Every flow accounted for. Who pays what, who gets what, and when the model becomes self-sustaining.

---

## Section 1 — The Coin Standard

Before any economics can be modelled, the coin must have a precise, fixed INR value. Ambiguity here breaks every downstream calculation.

### Coin Definition

| Parameter | Value | Rationale |
|---|---|---|
| **1 Suba Coin = ₹0.10** | Face value for redemption | Clean math; ₹1 per 10 coins feels tangible |
| Minimum redemption | 300 coins = ₹30 | Low enough to feel reachable in 1–2 months |
| Maximum single redemption | 5,000 coins = ₹500 | Caps liability per transaction |
| Coin expiry | 12 months from earn date | Drives redemption velocity, limits liability |
| Coin funding model | Brand-funded (not Subatone-funded) | Platform earns margin, does not bear full cost |

### Coin Funding Split

When a user redeems 500 coins for ₹50 cashback:

```
Brand pays Subatone:       ₹50.00   (face value of coins redeemed)
Subatone platform margin:  ₹10.00   (20% of redemption value)
Net coin payout to user:   ₹40.00   (delivered as cashback/voucher)
Subatone net on redemption: ₹10.00
```

In Phase 1 (zero brand partners), Subatone self-funds all coin redemptions. This is the seed cost. See Section 8 for the break-even model.

---

## Section 2 — Coin Earn Economics by Segment

### 2.1 Standard Earn Rate Formula

```
Coins earned = floor(Payment amount in ₹ / Earn divisor) × Tier multiplier
```

Base earn divisor: **₹10 per coin** (= 1% effective cashback rate at ₹0.10/coin)

Tier multipliers:
- Rookie: 1.0x
- Regular: 1.1x
- Prime: 1.25x
- Elite: 1.5x
- Obsidian: 2.0x

---

### 2.2 OTT & Entertainment Segment

Popular plans in India (2026 approximate pricing):

| Service | Plan | Amount (₹) | Coins Earned (Base) | INR Value | Effective Cashback |
|---|---|---|---|---|---|
| Netflix | Mobile | 149/mo | 14 | ₹1.40 | 0.94% |
| Netflix | Basic with Ads | 299/mo | 29 | ₹2.90 | 0.97% |
| Netflix | Standard | 649/mo | 64 | ₹6.40 | 0.99% |
| Hotstar | Mobile | 299/mo | 29 | ₹2.90 | 0.97% |
| Hotstar | Super (Annual ₹1,499) | 1,499/yr | 224 | ₹22.40 | 1.49% |
| Amazon Prime | Annual ₹1,499 | 1,499/yr | 224 | ₹22.40 | 1.49% |
| Spotify | Individual | 119/mo | 11 | ₹1.10 | 0.92% |
| Spotify | Duo | 149/mo | 14 | ₹1.40 | 0.94% |
| YouTube Premium | Individual | 189/mo | 18 | ₹1.80 | 0.95% |
| Sony LIV | Premium | 299/mo | 29 | ₹2.90 | 0.97% |
| Apple TV+ | Individual | 199/mo | 19 | ₹1.90 | 0.95% |

**Segment monthly earn (avg OTT user, 3 services):**
- Avg spend: ~₹600/month
- Coins earned: ~60 coins
- INR value: **₹6.00/month**

**Annual plan bonus:** 1.5x coins on annual payments (reward for locking in)
- Example: Hotstar Super Annual ₹1,499 → 224 coins × 1.5 = **336 coins = ₹33.60** in one transaction

---

### 2.3 Mobile & Telecom Segment

| Service | Plan | Amount (₹) | Coins Earned (Base) | INR Value | Effective Cashback |
|---|---|---|---|---|---|
| Jio | 28-day ₹239 | 239/mo | 23 | ₹2.30 | 0.96% |
| Jio | 84-day ₹666 | 222/mo equiv. | 66 | ₹6.60 | 0.99% |
| Jio | Annual ₹2,999 | 2,999/yr | 449 | ₹44.90 | 1.50% |
| Airtel | ₹299 30-day | 299/mo | 29 | ₹2.90 | 0.97% |
| Airtel | ₹479 28-day | 479/mo | 47 | ₹4.70 | 0.98% |
| BSNL | ₹197 30-day | 197/mo | 19 | ₹1.90 | 0.96% |
| Broadband (avg) | 150 Mbps plan | 699/mo | 69 | ₹6.90 | 0.99% |
| Postpaid (avg) | 599/mo | 599/mo | 59 | ₹5.90 | 0.98% |

**Segment monthly earn (avg telecom user, 1 mobile + broadband):**
- Avg spend: ~₹950/month
- Coins earned: ~95 coins
- INR value: **₹9.50/month**

**Note on recharge timing bonus:** If user pays recharge 3+ days before expiry for 3 consecutive months → 25 bonus coins (₹2.50). Drives early payment behaviour, which is the exact signal brands want to see.

---

### 2.4 AI & Developer Tools Segment

| Service | Plan | Amount (₹) | Coins Earned (Base) | INR Value | Effective Cashback |
|---|---|---|---|---|---|
| ChatGPT Plus | $20/mo | ~₹1,650/mo | 165 | ₹16.50 | 1.00% |
| Claude Pro | $20/mo | ~₹1,650/mo | 165 | ₹16.50 | 1.00% |
| GitHub Copilot | $10/mo | ~₹830/mo | 83 | ₹8.30 | 1.00% |
| Cursor Pro | $20/mo | ~₹1,650/mo | 165 | ₹16.50 | 1.00% |
| Midjourney | $10/mo | ~₹830/mo | 83 | ₹8.30 | 1.00% |
| Perplexity Pro | $20/mo | ~₹1,650/mo | 165 | ₹16.50 | 1.00% |
| Notion | Personal Pro | ~₹1,000/mo | 100 | ₹10.00 | 1.00% |
| Figma | Starter ₹3,500/mo | 3,500/mo | 350 | ₹35.00 | 1.00% |
| Adobe CC | ~$55/mo | ~₹4,550/mo | 455 | ₹45.50 | 1.00% |
| Linear | Standard $8/mo | ~₹660/mo | 66 | ₹6.60 | 1.00% |

**Segment monthly earn (typical tech professional, 3 AI tools):**
- Avg spend: ~₹4,100/month
- Coins earned: ~410 coins
- INR value: **₹41.00/month**

**This is Subatone's highest-value segment.** A user paying for 3+ AI tools earns 4–6x more coins per month than an OTT-only user. This segment is also the most underserved — no existing app tracks web-billed AI subscriptions.

---

### 2.5 Cloud & Storage Segment

| Service | Plan | Amount (₹) | Coins Earned (Base) | INR Value |
|---|---|---|---|---|
| iCloud+ | 50GB ₹75/mo | 75/mo | 7 | ₹0.70 |
| iCloud+ | 200GB ₹219/mo | 219/mo | 21 | ₹2.10 |
| Google One | 100GB ₹130/mo | 130/mo | 13 | ₹1.30 |
| Google One | 200GB ₹210/mo | 210/mo | 21 | ₹2.10 |
| Dropbox Plus | ~₹830/mo | 830/mo | 83 | ₹8.30 |
| OneDrive 100GB | ~₹170/mo | 170/mo | 17 | ₹1.70 |

**Segment avg monthly earn:** ~₹3–4 (low individual value, but present in almost every user's stack)

---

### 2.6 Health, Fitness & Wellness Segment

| Service | Type | Amount (₹) | Coins Earned | INR Value |
|---|---|---|---|---|
| Cult.fit | Monthly ₹2,499 | 2,499/mo | 249 | ₹24.90 |
| Cult.fit | Annual ₹14,999 | 1,249/mo equiv. | 2,249 | ₹224.90/yr |
| Local gym | Avg ₹1,500/mo | 1,500/mo | 150 | ₹15.00 |
| Headspace | Annual ~₹4,200 | 350/mo equiv. | 420 | ₹42.00/yr |
| HealthifyMe | Premium ₹1,499/mo | 1,499/mo | 149 | ₹14.90 |
| Zepto/Blinkit subscription | ₹99/mo | 99/mo | 9 | ₹0.90 |

**Segment avg monthly earn:** ~₹15–25

---

### 2.7 Finance & Insurance Segment

| Service | Type | Amount (₹) | Coins Earned | INR Value | Notes |
|---|---|---|---|---|---|
| Term Insurance | Annual premium ₹12,000 | 12,000/yr | 1,800 | ₹180/yr | Annual only |
| Health Insurance | Annual premium ₹18,000 | 18,000/yr | 2,700 | ₹270/yr | Annual only |
| Mutual Fund SIP | ₹5,000/mo | 5,000/mo | 500 | ₹50.00 | High-value earn |
| Car insurance | Annual ₹8,000 | 8,000/yr | 1,200 | ₹120/yr | Annual only |
| Loan EMI | ₹10,000/mo | 10,000/mo | 1,000 | ₹100.00 | Aspirational feature |

**Insurance payments are earn-only at annual cycle** — massive coin events (₹120–₹270 in one shot) that create a strong incentive to route through Subatone.

**SIP payments are the highest regular earn** outside of rent — ₹50/month on a standard ₹5,000 SIP.

---

### 2.8 Rent Segment (Strategic Priority)

Rent is Subatone's highest-value per-transaction segment. It is treated differently because:
- Single payment = largest amount in any user's budget
- Landlords don't offer loyalty points
- Routing rent through Subatone captures maximum coin potential

| Rent Bracket | Monthly Amount (₹) | Coins Earned (3x rate) | INR Value | Effective Cashback |
|---|---|---|---|---|
| Budget (Tier-3 city) | 6,000 | 1,800 | ₹180.00 | 3.00% |
| Mid (Tier-2 city) | 12,000 | 3,600 | ₹360.00 | 3.00% |
| Standard (Tier-1, shared) | 18,000 | 5,400 | ₹540.00 | 3.00% |
| Standard (Tier-1, solo) | 25,000 | 7,500 | ₹750.00 | 3.00% |
| Premium (Mumbai/Bangalore) | 40,000 | 12,000 | ₹1,200.00 | 3.00% |

**Why 3x rate on rent?**

Rent is the stickiest possible payment to route through Subatone. Once a user routes rent:
- They set up UPI mandate → frictionless every month
- 12 payments/year guaranteed through the platform
- Each payment creates a massive coin event (₹180–₹1,200) that makes the coin balance feel real
- It generates the transaction processing fee revenue for Subatone

**Rent earn cap:** 10,000 coins per month (= ₹1,000) to prevent abuse on very high-rent users.

**Effective economics on ₹18,000 rent:**
```
User earns:           3,600 coins = ₹360 value
Brand funds:          ₹360 × 80% = ₹288 (brand bears)
Subatone keeps:       ₹360 × 20% = ₹72 (platform margin)
Transaction fee:      ₹49 flat (Subatone revenue)
Subatone net revenue: ₹72 + ₹49 = ₹121 per rent payment
```

---

### 2.9 Bonus Earn Events (Behavioural Incentives)

These are not payment-linked — they reward platform engagement:

| Event | Coins Earned | INR Value | Frequency |
|---|---|---|---|
| First subscription added | 50 coins | ₹5.00 | Once |
| First payment through app | 100 coins | ₹10.00 | Once |
| Complete profile (currency, timezone, city) | 25 coins | ₹2.50 | Once |
| Refer a friend (they add first subscription) | 200 coins | ₹20.00 | Per referral |
| Refer a friend (they complete first payment) | 500 coins | ₹50.00 | Per referral |
| 3-month on-time streak | 100 coins | ₹10.00 | Per milestone |
| 6-month on-time streak | 250 coins | ₹25.00 | Per milestone |
| 12-month on-time streak | 500 coins | ₹50.00 | Once/year |
| Monthly challenge completion | 150–300 coins | ₹15–₹30 | Monthly |
| Annual subscription switched from monthly | 100 coins | ₹10.00 | Per switch |
| Add 10th subscription | 50 coins | ₹5.00 | Once |

**Cost to Subatone for bonus events (pre-brand-partner phase):**
- Average active user triggers ~300 bonus coins/month = ₹30 platform cost
- These are Subatone-funded (not brand-funded) in Phase 1

---

## Section 3 — Average User Monthly Earn

### Earn Profile by User Type

| User Type | Description | Monthly Spend (₹) | Monthly Coins | INR Value/mo |
|---|---|---|---|---|
| **Lite** | OTT + mobile only, no rent | ₹800 | 82 | ₹8.20 |
| **Standard** | OTT + mobile + 2 SaaS, with rent | ₹20,000 (incl. ₹18K rent) | 2,250 | ₹225.00 |
| **Power** | Standard + AI tools + gym + insurance SIP | ₹32,000 | 3,900 | ₹390.00 |
| **Professional** | Full stack: 15+ subscriptions + rent + SIP + insurance | ₹48,000 | 6,800 | ₹680.00 |

**The Standard user (₹18K rent + ₹2K subs)** is the target demographic. They earn ₹225/month in coin value — approximately **₹2,700/year**. This is meaningful money for the user and a strong enough reward to change routing behaviour.

---

## Section 4 — Coin Redemption Economics

### 4.1 Redemption Catalogue Structure

| Redemption Tier | Coin Cost | INR Face Value | Funded By | Subatone Margin | Net Cost to Platform |
|---|---|---|---|---|---|
| **Micro** | 100 coins | ₹10 | 80% brand / 20% Subatone | ₹2.00 | ₹2.00 |
| **Small** | 300 coins | ₹30 | Brand-funded | ₹6.00 | ₹0 (brand funded) |
| **Standard** | 500 coins | ₹50 | Brand-funded | ₹10.00 | ₹0 |
| **Premium** | 1,000 coins | ₹100 | Brand-funded | ₹20.00 | ₹0 |
| **Luxury** | 3,000 coins | ₹300 | Brand-funded | ₹60.00 | ₹0 |
| **Feature unlock** | 200 coins | Pro feature (30 days) | Subatone internal | ₹0 | ₹0 (no cash) |
| **Streak Shield** | 150 coins | Streak protection | Subatone internal | ₹0 | ₹0 (no cash) |

### 4.2 Redemption Category Economics

**Cashback Redemptions (Direct ₹ back)**

The user redeems coins and gets money back into their UPI/bank account.

```
User redeems 500 coins
→ ₹50 direct cashback to user's UPI
→ Brand has pre-loaded ₹500 into brand wallet on Subatone
→ ₹40 disbursed to user (80%)
→ ₹10 retained by Subatone as platform fee (20%)

Effective cost to brand: ₹50 per ₹40 delivered to user
Brand's cost per ₹1 of goodwill: ₹1.25
Brand CPM equivalent at 10% redemption rate: ₹5,000/1,000 reached users
```

**Voucher Redemptions (Partner Brand Vouchers)**

More common — lower brand cash outlay, higher perceived value.

```
Swiggy offers ₹75 voucher for 600 coins
→ Swiggy loads ₹1,500 into their Subatone wallet (covers 20 redemptions)
→ Subatone's platform fee: ₹250 (20 redemptions × ₹12.50 each → 16.7%)
→ Swiggy's cost: ₹75 voucher costs them ~₹45 (their margin is ~40%)
→ User gets ₹75 of Swiggy credit for ₹60 in coins
→ Net Subatone revenue per redemption: ₹12.50
```

**Subscription Deal Redemptions (High Margin)**

```
NordVPN offers 3-month extension for 1,500 coins
→ NordVPN's cost: ~$2 marginal cost for 3 months
→ User perceived value: ₹750 (3 × ₹250/month)
→ Subatone charges NordVPN: ₹375 per redemption (50% of perceived value)
→ Subatone margin: ₹375 - ₹0 (Subatone has no cost here) = ₹375 net

This is the highest-margin redemption category for Subatone.
```

**Internal Redemptions (Feature Unlocks — No Cash)**

```
User redeems 200 coins for 30 days of Pro tier
→ Coins deducted from user balance
→ Pro flag set on user account for 30 days
→ Zero cash outflow for Subatone
→ User gets ₹20 of coin value → ₹99 of feature value (Pro tier)

This is a deliberate overvalue: coins buy more feature value than their cash equivalent.
The goal is to make coins feel high-value, driving the earn behaviour.
```

### 4.3 Redemption Rate Assumptions

Based on CRED benchmarks and loyalty programme norms:

| Metric | Conservative | Target | Optimistic |
|---|---|---|---|
| Monthly coin redemption rate (active users) | 25% | 40% | 55% |
| Avg coins redeemed per redemption event | 400 | 500 | 650 |
| INR value per redemption event | ₹40 | ₹50 | ₹65 |
| Brand-funded redemption % | 60% | 80% | 95% |

**Implication:** At target rate, 40% of active users redeem each month. At 10,000 MAU, 4,000 redemptions × ₹50 avg = ₹2,00,000/month flowing through the catalogue. Brands fund ₹1,60,000. Subatone earns ₹32,000–₹40,000 from catalogue margin alone at this scale.

---

## Section 5 — Brand Partnership Economics

### 5.1 Brand Wallet Model

Every brand partner pre-loads a "Brand Wallet" on Subatone. This wallet funds:
1. Coin cashback for their own subscription category
2. Vouchers/deals in the rewards catalogue
3. Sponsored placement in the app

**Minimum wallet load:** ₹10,000 (to get listed in catalogue)  
**Recommended wallet load:** ₹50,000–₹2,00,000 per quarter

### 5.2 What Brands Pay For

| Revenue Line | Description | Rate | Notes |
|---|---|---|---|
| **Catalogue placement** | Monthly fee to appear in coin store | ₹5,000–₹25,000/month | Tiered by position (featured vs standard) |
| **Coin funding** | Per-redemption cost | ₹0.10/coin funded | Brand pays face value of coins redeemed |
| **Platform redemption fee** | Subatone's margin on each redemption | 20% of coin face value | Applied on every brand-funded redemption |
| **Targeted campaign** | Push notification to segment | ₹0.50–₹2.00 per user reached | e.g. "Target users who added competitor service" |
| **Sponsored onboarding** | Feature placement in user onboarding flow | ₹15,000–₹50,000/month | High impression, high-intent placement |
| **Category exclusive** | No competing brand in same category | +50% premium on placement fee | e.g. Spotify is the exclusive music brand |

### 5.3 Brand ROI Calculation

**Example: Spotify runs a Subatone campaign**

Goal: Convert 500 Subatone users from Individual to Duo plan (₹30/month upsell).

```
Campaign setup:
- Targeted notification to 5,000 users who have Spotify Individual tracked: ₹2,500 (₹0.50/user)
- Catalogue placement for 2 months: ₹10,000
- Coin deal: 500 coins (₹50) to try Duo for 1 month

Assumed conversion rate: 10% of 5,000 = 500 users upgrade

Cost per conversion:
- Campaign cost: ₹12,500 / 500 = ₹25 per converted user
- Coin cost (Spotify funds 500 coins × 500 users): ₹25,000
  → Subatone keeps 20% = ₹5,000; Spotify net coin cost: ₹20,000
- Total Spotify spend: ₹12,500 + ₹25,000 = ₹37,500

Spotify's revenue from 500 upgrades at ₹30/month:
- Month 1: ₹15,000 (50% churn, conservative)
- Month 2: ₹9,000
- Month 3–12: ~₹6,000/month
- Year 1 LTV from campaign: ~₹90,000

ROI: ₹90,000 revenue / ₹37,500 cost = 2.4x return in Year 1
```

Brands with customer LTV > ₹500 will find this ROI compelling. The Subatone user base (verified subscription payers) is far higher-quality than typical digital ad audiences.

### 5.4 Brand Segment Economics

| Brand Category | Avg Campaign Budget/Quarter | Coins Funded | Subatone Revenue/Quarter |
|---|---|---|---|
| OTT / Streaming | ₹50,000–₹1,00,000 | ₹40,000 | ₹10,000–₹20,000 |
| AI / SaaS tools | ₹30,000–₹75,000 | ₹24,000 | ₹6,000–₹15,000 |
| D2C / E-commerce | ₹25,000–₹50,000 | ₹20,000 | ₹5,000–₹10,000 |
| Financial products | ₹1,00,000–₹5,00,000 | N/A (lead gen) | ₹2,000–₹5,000 per lead |
| Insurance | ₹1,00,000–₹3,00,000 | N/A (lead gen) | ₹500–₹2,000 per policy |

**Financial products and insurance are the highest-margin categories.** Unlike catalogue deals, they pay per lead/conversion rather than per coin — no coin funding cost for Subatone.

---

## Section 6 — Per-User Platform Economics (P&L)

### 6.1 Monthly P&L: Standard User (₹18K Rent + ₹2K Subs)

```
USER EARNS:
  Rent payment (3x rate): ₹18,000 → 5,400 coins = ₹540 coin value
  Subscription payments: ₹2,000 → 200 coins = ₹20 coin value
  Bonus events (avg): 50 coins = ₹5 coin value
  TOTAL EARNED: 5,650 coins = ₹565 coin value

USER REDEEMS (40% redemption rate, 500 coins avg):
  Redemption: 500 coins = ₹50 cashback
  TOTAL REDEEMED: ₹50/month (avg)

SUBATONE REVENUE FROM THIS USER:
  Rent transaction fee: ₹49
  Subscription payment routing (2 × ₹25 avg): ₹50
  Brand placement fee (allocated per user): ₹15
  Redemption margin (20% of ₹50): ₹10
  TOTAL REVENUE: ₹124/month

SUBATONE COST FROM THIS USER:
  Coin earn cost (Subatone-funded portion):
    - Rent earn: brand-funded once brand partners exist (₹0 at scale; ₹432 in Phase 1)
    - Subscription earn: brand-funded (₹0 at scale; ₹16 in Phase 1)
    - Bonus earn: Subatone-funded always: ₹5
  Infrastructure cost per user (hosting, DB, push): ~₹8/month
  Customer support allocation: ~₹3/month
  TOTAL COST (at scale, fully brand-funded): ₹16/month
  TOTAL COST (Phase 1, self-funded): ₹464/month

NET MARGIN PER USER:
  At scale (brand-funded):  ₹124 - ₹16 = ₹108/month
  Phase 1 (self-funded):    ₹124 - ₹464 = -₹340/month (expected loss)
```

**The Phase 1 loss per user is the seed cost.** This is the investment in building the user base before brands are on board. At 1,000 users paying rent, Phase 1 burn from coin funding alone is ₹3.4L/month. This defines the seed capital requirement.

### 6.2 Monthly P&L: Lite User (No Rent, OTT + Mobile Only)

```
USER EARNS:
  Subscriptions only: ₹800 → 82 coins = ₹8.20 coin value
  Bonus events (avg): 25 coins = ₹2.50 coin value
  TOTAL EARNED: 107 coins = ₹10.70/month

USER REDEEMS (25% rate):
  Redeems ~every 3 months: ₹30 (300 coins)
  Monthly amortised: ₹10/month

SUBATONE REVENUE:
  Subscription routing (2 payments × ₹25): ₹50
  Brand allocation: ₹8
  Redemption margin: ₹2
  TOTAL REVENUE: ₹60/month

SUBATONE COST:
  Coin earn (Subatone-funded in Phase 1): ₹8.60
  Infrastructure: ₹8
  TOTAL COST (at scale): ₹8
  TOTAL COST (Phase 1): ₹16.60

NET MARGIN (at scale): ₹60 - ₹8 = ₹52/month
```

Lite users are margin-positive even in Phase 1. They are the "safe" early adopter base.

### 6.3 Monthly P&L: Power User (AI Tools + Gym + SIP + Rent)

```
USER EARNS:
  Rent ₹25,000 (3x): 7,500 coins = ₹750 coin value (capped at 10,000 coins)
  AI tools ₹5,000 (1x): 500 coins = ₹50 coin value
  Gym ₹2,000 (1x): 200 coins = ₹20 coin value
  SIP ₹5,000 (1x): 500 coins = ₹50 coin value
  Bonus (streak): 100 coins = ₹10 coin value
  TOTAL EARNED: ~8,800 coins = ₹880/month coin value

USER REDEEMS (55% rate, 800 coins avg):
  Monthly redemption: ₹80

SUBATONE REVENUE:
  Rent transaction fee: ₹49
  Other routing (8 payments × ₹25): ₹200
  Brand allocation: ₹35
  Redemption margin (20% × ₹80): ₹16
  TOTAL REVENUE: ₹300/month

NET MARGIN (at scale, brand-funded): ₹300 - ₹12 (infra) = ₹288/month
```

**Power users generate ₹288/month net at scale.** They are also the most desirable segment for brands. These users are the "Obsidian tier" — worth acquiring with investment.

---

## Section 7 — Scale Economics

### Revenue Model at Different User Scales

Assuming user mix: 60% Lite, 30% Standard, 10% Power

| Scale | MAU | Monthly Revenue | Monthly Coin Cost (self-funded) | Monthly Coin Cost (brand-funded) | Net Margin |
|---|---|---|---|---|---|
| Seed | 1,000 | ₹72,000 | ₹1,85,000 | ₹10,000 | -₹1,23,000 |
| Early | 5,000 | ₹3,60,000 | ₹9,25,000 | ₹50,000 | -₹1,40,000 |
| Growth | 10,000 | ₹7,20,000 | — | ₹1,00,000 | +₹2,40,000 |
| Scale | 50,000 | ₹36,00,000 | — | ₹5,00,000 | +₹22,00,000 |
| Series A | 1,00,000 | ₹72,00,000 | — | ₹10,00,000 | +₹48,00,000 |
| Series B | 5,00,000 | ₹3,60,00,000 | — | ₹50,00,000 | +₹2,75,00,000 |

**Key inflection point:** Brand-funded coins cross the self-funded cost at approximately **8,000–10,000 MAU**, assuming 3–5 brand partners are signed. Below this number, coin costs exceed revenue. Above it, the model is net-positive and improving with scale.

---

## Section 8 — Break-Even and Sustainability Model

### 8.1 The Coin Sustainability Question

*"When does the brand ecosystem pay for all coins, so Subatone never self-funds rewards?"*

**Variables:**
- Average brand partner budget: ₹25,000/month each
- Coin redemption rate: 40% of users, 500 coins avg
- Platform margin: 20% of redeemed coin value

**Calculation:**

```
At 5 brand partners: ₹1,25,000/month brand funding available
Monthly coin redemptions at 10,000 MAU: 4,000 × ₹50 = ₹2,00,000
Brand funding gap: ₹75,000/month still self-funded

At 10 brand partners: ₹2,50,000/month brand funding
Monthly coin redemptions at 10,000 MAU: ₹2,00,000
Brand funding covers: 100% + ₹50,000 surplus → fully self-sustaining

BREAK-EVEN: 10 brand partners + 10,000 MAU
```

**Timeline to break-even (realistic):**
- Month 1–4: 0–2 brand partners, 0–2,000 MAU → full self-funding of coins
- Month 4–6: 3–5 brand partners, 3,000–6,000 MAU → 50% covered
- Month 6–9: 8–10 brand partners, 8,000–12,000 MAU → fully covered

**Seed capital needed to bridge Phase 1:**
```
Month 1–4 self-funded coin cost:
  Avg 1,500 users, avg ₹25 coin cost/user/month = ₹37,500/month × 4 months = ₹1,50,000
  Bonus events self-funded: ₹20,000 over 4 months
  Total coin seed cost: ~₹1,70,000

Infrastructure (Render, Supabase paid tier, etc.) over 6 months: ₹60,000
Developer accounts + miscellaneous: ₹15,000

TOTAL MINIMUM SEED COST FOR COIN ECONOMICS: ₹2,45,000 (~₹2.5L)
```

This is achievable without external funding — savings, a small angel, or a single early brand partner can cover it.

### 8.2 Coin Liability Management

Coins outstanding on the balance sheet represent a future liability (brands must fund them when redeemed).

**Controls:**
- 12-month coin expiry: caps maximum outstanding liability
- Redemption rate target 40%: the remaining 60% of earned coins never get redeemed (breakage)
- Breakage rate benefit to Subatone: earned coins that expire = Subatone retains the INR equivalent already received from brands

**Breakage economics:**
```
At 10,000 MAU, monthly coin earn: 10,000 × 500 avg coins = 50,00,000 coins
At 60% breakage rate: 30,00,000 coins expire over 12 months
Value of breakage: 30,00,000 × ₹0.10 = ₹30,00,000/year
This breakage accrues to Subatone as recognised revenue as coins expire.
```

This breakage model is identical to how airline miles, credit card points, and prepaid gift cards work. It is a legally recognised revenue model.

---

## Section 9 — Pro / Prime Membership Economics

Membership revenue is brand-independent — it is direct user payment to Subatone.

| Plan | Price | Marginal Cost/User/Month | Net Margin |
|---|---|---|---|
| Free | ₹0 | ₹8 (infra) | -₹8 (offset by brand revenue) |
| Pro | ₹99/month | ₹9 (infra + support) | ₹90 (91% margin) |
| Pro Annual | ₹799/year = ₹66.6/month | ₹9 | ₹57.6/month (86% margin) |
| Prime | ₹199/month | ₹11 (infra + 3 free rent payments) | ₹188 (94% margin) |
| Prime Annual | ₹1,499/year = ₹124.9/month | ₹11 | ₹113.9/month (91% margin) |

**Target conversion rate:** 10–15% of MAU to paid tier

| MAU | Paid Users (12%) | Avg ARPU | Membership MRR |
|---|---|---|---|
| 5,000 | 600 | ₹110 | ₹66,000 |
| 25,000 | 3,000 | ₹120 | ₹3,60,000 |
| 1,00,000 | 12,000 | ₹130 | ₹15,60,000 |
| 5,00,000 | 60,000 | ₹140 | ₹84,00,000 |

---

## Section 10 — Full Revenue Stack Summary

At 10,000 MAU (target Month 6–8):

| Revenue Line | Amount/Month | % of Total |
|---|---|---|
| Rent transaction fees | ₹98,000 (2,000 rent payments × ₹49) | 33% |
| Subscription routing fees | ₹75,000 (3,000 payments × ₹25 avg) | 25% |
| Brand placement fees | ₹50,000 (10 partners × ₹5,000 avg) | 17% |
| Redemption margin (20%) | ₹40,000 (₹2,00,000 redemptions) | 13% |
| Pro/Prime membership | ₹33,000 (300 users × ₹110 avg) | 11% |
| Affiliate commissions | ₹5,000 | 2% |
| **Total MRR** | **₹3,01,000** | 100% |

At this MRR with ₹40,000/month costs (infra + brand coin net), **net profit = ₹2,61,000/month** (~87% net margin).

This is the model's structural advantage: high-margin digital revenue with no marginal cost of coins at scale (brands fully fund them).

---

## Quick Reference: Coin Earn Table

| Payment Type | Amount (₹) | Base Coins | INR Value | Rate |
|---|---|---|---|---|
| Any subscription (monthly) | Any | amount ÷ 10 | coins × ₹0.10 | 1.0% |
| Any subscription (annual) | Any | amount ÷ 10 × 1.5 | coins × ₹0.10 | 1.5% |
| Rent payment | Any (cap 10,000) | amount ÷ 10 × 3 | coins × ₹0.10 | 3.0% |
| Insurance premium (annual) | Any | amount ÷ 10 × 1.5 | coins × ₹0.10 | 1.5% |
| First payment (bonus) | — | +100 flat | ₹10.00 | one-time |
| Referral (friend pays) | — | +500 flat | ₹50.00 | per referral |
| 6-month streak | — | +250 flat | ₹25.00 | per milestone |
| 12-month streak | — | +500 flat | ₹50.00 | per year |
