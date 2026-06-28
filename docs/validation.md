# Subatone — Market Validation & Bypass Analysis

> Hard questions, honest answers. Will people actually use and pay for this?

---

## The Central Question

Before writing a single line of code, three questions need brutal answers:

1. **Is the problem real and painful enough to change behaviour?**
2. **Will people route payments through a new app just for rewards?**
3. **Can the business sustain itself before it reaches CRED-level scale?**

This document works through every bypass, every competing behaviour, and every structural risk — and arrives at a verdict.

---

## Part 1 — The Bypass Map

A bypass is any path a user takes to solve the same problem without using Subatone. If the bypasses are too easy or too good, the product dies.

---

### Bypass 1 — "I'll just use a spreadsheet"

**The threat:** Google Sheets / Notion is free, already trusted, and requires no app install. Power users already have subscription trackers.

**Counter-analysis:**
- The users who already have a spreadsheet are not the primary market — they are already solved
- The majority of subscription-paying Indians do **not** track their subscriptions at all; they discover forgotten charges only on a bank statement months later
- A spreadsheet gives zero reminders, zero rewards, zero payment routing, and zero gamification
- The spreadsheet user is a 0.5% edge case; the unaware majority is the market

**Bypass severity: Low.** Spreadsheets don't send push alerts 3 days before a renewal. They don't give coins. They don't route payments. The overlap with Subatone's actual value proposition is minimal.

---

### Bypass 2 — "My bank app already shows me spend categories"

**The threat:** HDFC SmartBuy, ICICI iMobile, Axis Mobile, and neobanks like Fi and Jupiter all show categorised transaction history. Some flag recurring debits.

**Counter-analysis:**
- Bank apps show **historical** spend; Subatone shows **upcoming** renewals — a fundamentally different utility
- No bank app sends "your Netflix renews in 3 days" push notifications
- Bank apps show debits after they happen; Subatone acts before the debit
- Bank apps cover only one bank account; users often pay subscriptions across 2–3 cards and UPI IDs
- Zero bank app has a rewards system for paying recurring bills
- Bank apps have zero gamification, no streaks, no coins, no tier system

**Bypass severity: Low-Medium.** Banks solve a different problem (historical reporting). Subatone solves future-facing subscription management and payment routing. However, if a bank like Fi decides to build renewal reminders + coins, this becomes a serious threat — covered under Bypass 8.

---

### Bypass 3 — "Apple and Google already track my subscriptions"

**The threat:**
- **iOS:** Settings → Apple ID → Subscriptions shows all App Store subscriptions
- **Google Play:** Play Store → Payments & Subscriptions shows Play Store subscriptions
- Both allow cancellation directly

**Counter-analysis:**
This is the most commonly misunderstood bypass. Apple and Google only see **their own ecosystem**:

| Platform | What they see | What they miss |
|---|---|---|
| Apple App Store | Netflix (iOS), Spotify (iOS) | Netflix (web-billed), Jio, Airtel, rent, gym, ChatGPT (web), GitHub Copilot |
| Google Play | Spotify (Android), YouTube Premium | Same web-billed subscriptions, plus all iOS apps |

The majority of high-value subscriptions in India are billed via:
- Direct website (ChatGPT, Claude, Notion, Figma, GitHub)
- UPI auto-debit (Jio, Airtel, Hotstar)
- Standing instructions on credit/debit card (Netflix, Adobe CC)
- Bank transfer (rent, utilities)

None of these appear in Apple/Google subscription managers.

**Bypass severity: Low.** The platform-native tools cover maybe 20–30% of what a real subscription tracker needs to cover. They are not competition; they are a partial solution that actually validates the problem.

---

### Bypass 4 — "UPI apps (PhonePe / GPay / Paytm) already handle bill payments"

**The threat:** PhonePe and GPay already process recharges, utility bills, and some subscription payments. They show transaction history. Users are habituated to these apps.

**Counter-analysis:**
- These apps process the payment but offer no subscription intelligence — no renewal calendar, no upcoming alerts, no total burn view, no cross-service consolidation
- PhonePe/GPay earn on GMV, not on helping users manage their subscriptions
- They have no incentive to show users that they are overspending or could cancel something
- Subatone's coins model is directionally opposite — it aligns with the user, not the payment volume
- Razorpay and Cashfree process payments; Subatone **orchestrates** them with context

**The real question:** Can PhonePe add a "Subscription Manager" tab with reminders and rewards tomorrow?

**Yes, they can.** But they won't, because:
1. It reduces their GMV (if users cancel subscriptions, fewer payments flow through PhonePe)
2. It is not their core focus
3. Building gamification on top of their existing design system is non-trivial

**Bypass severity: Medium.** The risk is not that PhonePe solves this — it is that users think PhonePe is "good enough." The coin rewards need to be compelling enough to pull payment behaviour from PhonePe to Subatone.

---

### Bypass 5 — "Truecaller already reads my SMS and shows bill reminders"

**The threat:** Truecaller's SMS inbox features already parse financial SMS and show upcoming bills for 350M+ Indian users. It is already installed on the majority of Indian Android devices.

**Counter-analysis:**
- Truecaller's billing features are shallow — they show SMS-detected due dates but have no tracking, no analytics, no payment routing, no coin rewards
- Truecaller's core product is caller ID and spam blocking; billing is a side feature, not a product focus
- They have no incentive to build a full subscription management platform
- However, if Truecaller ever seriously invested in this vertical, their distribution advantage would be massive

**Bypass severity: Medium.** Truecaller is a distribution risk, not a product competition risk. The counter is building Subatone's coins and payment rails fast enough that switching from Truecaller's shallow billing view to Subatone feels obviously worth it.

---

### Bypass 6 — "CRED could just add a subscriptions tab"

**The threat:** CRED has 13M+ verified premium users, established brand partnerships, payment rails, a reward system, and deep fintech credibility. Adding "subscription tracker" to their app is a feature, not a product.

**Counter-analysis:**
This is the **single most serious bypass** in the entire analysis. It deserves a full sub-section.

#### Why CRED probably won't do this (soon)
- CRED is focused on credit card users — their entire identity, trust model, and data moat is built around credit card bill payment
- Adding subscription tracking means handling non-credit-card payments (UPI auto-debit, rent bank transfers) — a completely different payment rails problem
- CRED's revenue comes from premium credit card users; subscription payers who don't use credit cards are not their target segment
- Internal product prioritisation: CRED is building CRED Money, CRED Cash, CRED Travel — subscriptions are not on their near-term roadmap (based on public signals as of 2026)
- CRED's coin economics are already strained; adding a new payment category dilutes their premium positioning

#### Why this risk is still real
- If Subatone proves the model at 500K users, CRED acquires rather than builds
- An acquisition is actually a **good outcome** for Subatone founders
- The real risk window is 0–18 months: if Subatone does not establish clear differentiation and brand loyalty before CRED notices, the window closes

**Bypass severity: High — but timeboxed.** The answer is speed. Build fast, prove retention, raise before CRED notices.

---

### Bypass 7 — "Users won't trust another app with their financial data"

**The threat:** Indians are increasingly privacy-conscious after multiple fintech data scandals. Giving SMS access, bank statements, or UPI credentials to a new app is a significant trust barrier.

**Counter-analysis:**
- CRED overcame this exact barrier by starting with **manual** input — users typed their credit card bills themselves
- Subatone's local-first mode (Phase 1 MVP) requires zero permissions — just manual entry
- SMS and bank import are opt-in Phase 2 features; the app works fully without them
- Trust is built incrementally: first the user tracks manually, then they see value, then they grant more permissions
- The coin rewards create a tangible exchange: "I give you permission to read my SMS; you give me coins when I pay"

**The deeper risk:** Payment routing requires users to enter card details or authorise UPI mandates through Subatone. This is the highest-friction trust moment. Every new payment app in India fights this. The coin reward has to be worth the friction.

**Bypass severity: Medium.** Solvable through local-first onboarding, clear value exchange, and building a trust reputation over time. Not a kill-shot — CRED, Groww, and Zerodha all faced this and won with transparency.

---

### Bypass 8 — "A neobank (Fi, Jupiter, Slice) builds this first"

**The threat:** Fi Money already categorises subscriptions, sends spending insights, and has a fintech-savvy user base. Jupiter has similar features. These apps have the data (they are the bank account) and the brand.

**Counter-analysis:**
- Neobanks see transactions they process; users who pay subscriptions from HDFC/ICICI are invisible to Fi
- Neobanks cannot see subscriptions paid via a credit card that sits outside their ecosystem
- Neobanks are focused on becoming primary bank accounts — subscriptions are a feature, not a focus
- Subatone's coin system requires brand partnership infrastructure that neobanks have not built for this vertical
- However, if Fi builds a coin-based subscription rewards system tied to their savings account, the threat is real

**The best defence:** Build the brand partnerships first. Once brands are paying Subatone to reach its user base, the data flywheel becomes a genuine moat that neobanks cannot replicate quickly.

**Bypass severity: Medium-High.** The window to establish the brand partnership moat is 12–18 months before a well-funded neobank moves here.

---

### Bypass 9 — "Indian users won't pay ₹99/month for this"

**The threat:** India has notoriously low willingness to pay for apps. Free apps dominate. Even ₹99/month is a non-trivial ask for a tracker app.

**Counter-analysis:**
This bypass is only a problem **if the monetisation strategy depends on subscriptions.** Subatone's model, correctly designed, does not.

The correct framing:
- **Free users are the product** — their payment behaviour data and their willingness to route payments via Subatone is the real asset
- **Brands pay to reach them** — not users paying for the app
- Pro/Prime membership is a secondary revenue stream, not the primary one

CRED never needed users to pay ₹99/month. Their coins are funded by brands. Users come for free value.

If Subatone is built correctly, the question is not "will users pay ₹99?" — it is "will brands pay to reach Subatone's subscription-paying user base?" That answer is yes, because those users are a precise, high-intent, premium segment.

**Bypass severity: Low** — if the business model is brand-funded coins. **High** — if the model incorrectly leans on paid subscriptions as primary revenue.

---

### Bypass 10 — "The RBI payment routing problem"

**The threat:** To route actual payments (collect money from users, disburse to Netflix/landlord), Subatone needs a **Payment Aggregator (PA) licence** from the RBI. Getting a PA licence is:
- Expensive (₹25 Cr net worth requirement)
- Time-consuming (12–18 months minimum)
- Operationally complex (KYC, AML, compliance infrastructure)

Without it, Subatone cannot legally route payments and the coin-on-payment model breaks.

**Counter-analysis:**
- Phase 1 does not require a PA licence — it is a tracker, not a payment processor
- Razorpay and Cashfree are licensed PAs; Subatone can act as a **Payment Gateway front-end** using their infrastructure under their licence (this is legal and common)
- UPI AutoPay mandates can be set up via a licensed PA partner; Subatone orchestrates, the partner processes
- The long-term goal is to obtain a PA licence in Year 2–3 once scale justifies it
- Rent payments via UPI (user initiates from their own UPI app) technically do not require a PA licence as long as Subatone is not holding funds

**The unresolved risk:** Apple's App Store policies restrict apps that process payments outside Apple's IAP (In-App Purchase) system. Payment routing through Subatone's Razorpay integration on iOS may face App Store rejection. Android and Web do not have this restriction.

**Mitigation:** iOS launches as a tracker-only app; payment routing is Web + Android. This is acceptable for Phase 1 India market (Android is 95%+ of Indian smartphone market).

**Bypass severity: Medium.** Structural but manageable. The PA licence issue is a Year 2 problem. The App Store issue limits iOS but not the primary market.

---

## Part 2 — Will People Use It?

### The activation hook must be the number

Users will not download a subscription tracker. They will download an app that shows them a number they did not know — their total monthly recurring spend.

The onboarding flow must surface this number within 90 seconds. Once a user sees "You spend ₹6,800/month on subscriptions + rent and had no idea," the app has earned its place on their phone.

**Evidence this works:**
- Every personal finance app that went viral in India (ET Money, INDmoney, Groww) had a "reveal" moment — portfolio value, potential returns, hidden fees
- The number is the hook; everything else is retention

### Retention requires the habit loop to close

Use the app → pay via app → earn coins → open app to check coins → see new deals → redeem → feel rewarded → pay via app again.

**The loop only closes if:**
1. The reminders fire reliably and feel timely (not annoying)
2. The coin rewards feel real (not vanity metrics) — redemption must be fast and valuable
3. The streak creates genuine loss aversion — users must feel something when they see their streak at risk

**What will kill retention:**
- Coin redemption catalogue that is weak, irrelevant, or hard to use (this killed many Indian reward apps)
- Reminders that are too frequent or poorly timed (app gets deleted as spam)
- Payment routing that fails or is harder than just paying directly

### Verdict on usage

**Yes, people will use it** — under two conditions:
1. The onboarding "revelation moment" (monthly burn number) is executed brilliantly
2. The coin redemption catalogue has at least 5–10 genuinely valuable, instantly usable rewards from Day 1

Without the rewards catalogue being live at launch, the gamification is empty and the app is just another tracker.

---

## Part 3 — Will People Pay For It?

### The wrong question

"Will people pay ₹99/month?" is the wrong question. CRED never asked it.

The right question: **Will brands pay to reach Subatone's user base?**

A user who tracks 15 subscriptions and pays them through Subatone has revealed:
- Their exact spend categories
- Their spending power
- Their brand affinities
- Their payment discipline

This profile is worth ₹200–₹800/month to brands in lead generation value alone. The user does not need to pay — brands will subsidise the experience.

### The paid tier question (reframed)

Pro/Prime tiers should be positioned as **unlocking more value**, not as a paywall. Users who see genuine ROI from the free tier will upgrade for:
- 2x coin multiplier (more rewards for same behaviour)
- Bank/SMS import (convenience)
- AI Advisor (actionable savings)
- Family sharing (sharing cost across 5 members at ₹199 is ₹40/person)

**Conversion benchmark:** CRED converts approximately 8–12% of free users to premium products. A 10% conversion at 500K MAU = 50,000 paying users × ₹130 ARPU = ₹65L MRR from subscriptions alone. Viable but not the primary bet.

### Verdict on payment

**Users will not pay for the tracker. Users will pay (indirectly, via behaviour) for the rewards.** The business collects from brands, not users. This is structurally sound — it is the CRED playbook, the credit card rewards playbook, and the loyalty programme playbook all in one.

The paid tier exists as an upsell for power users, not as the revenue foundation.

---

## Part 4 — The Chicken-and-Egg Problem

This is the most honest risk in the entire document.

**The problem:**
- Brands won't pay for placement until there are users
- Users won't engage with the rewards if the catalogue is empty
- The catalogue is empty until brands pay
- Brands don't pay without users

**How CRED solved it:**
- They seeded the rewards catalogue with their own money (essentially subsidising early cashbacks to prove the model to brands)
- They created the perception of exclusivity: "CRED is for credit card bill payers above ₹750 CIBIL" — this made brands want to be associated with the user base
- They raised enough capital to fund the early coin economics before brands covered it

**How Subatone must solve it:**
1. **Launch with 2–3 anchor brand partners** who fund cashbacks in exchange for early access to the user base — even at 5,000 users, the "subscription-paying early adopter tech user" profile is desirable to the right brand
2. **Self-fund the first 6 months of coin economics** — the coin value needs to be real from Day 1, even if Subatone is absorbing the cost
3. **Use the "Obsidian invite" model** — position early users as founding members with elevated status, making brands want to be their first exclusive deal

**Capital requirement for this bridge:** ₹50–80L to fund coin rewards for the first 10,000 active users at an average of ₹60–80/user/month in perceived coin value. This is the minimum viable seed budget for the rewards side.

---

## Part 5 — Structural Risks Not Covered by Product

| Risk | Severity | Honest Assessment |
|---|---|---|
| CRED acquires / enters the space | High | Best case: acquisition. Worst case: CRED outcompetes with distribution. The 18-month window is real. |
| PhonePe launches "PhonePe Subscriptions" with rewards | High | PhonePe has 500M users and existing payment rails. If they build this well, the market shrinks dramatically. |
| Apple App Store rejection of payment routing | Medium | Limits iOS to tracking-only. Acceptable for India (Android dominant) but blocks premium global market. |
| RBI tightens PA licensing further | Medium | Could delay the payment routing phase. Tracker + reminders still work; revenue model is slower. |
| Brand partners fail to deliver compelling rewards | High | The entire gamification model collapses if coin redemption is weak. This is an execution risk, not a market risk. |
| User data breach | Critical | A single breach of financial data would be existential. Security cannot be a Phase 2 concern. |
| Coin abuse / farming | Medium | Power users will find ways to earn coins without genuine payment routing. Requires fraud detection from Day 1. |

---

## Part 6 — The Honest Verdict

### Will people use it? **Yes, conditionally.**

The condition: the onboarding revelation moment must be brilliant, and the rewards catalogue must have real, redeemable value from Day 1. If either is weak, the app is another tracker that gets deleted in Week 2.

### Will people pay for it? **The question is wrong.**

Brands will pay. Users will route payments in exchange for rewards. The ₹99 Pro tier is real but secondary. The business is viable if and only if it raises enough capital to fund the coin economics long enough to attract brand partners.

### Is the idea defensible? **Yes, for 18 months.**

After 18 months, larger players (CRED, PhonePe, Fi) may enter with distribution advantages. The defence is:
1. Brand relationships built before they enter
2. User loyalty built on streak/tier psychology
3. Proprietary subscription behaviour data
4. Potentially, an acquisition by one of those players

### What kills this idea?

The idea fails if any one of the following is true:
- The coin redemption catalogue is weak at launch and users churn in Week 3
- Brand partnerships cannot be signed in the first 6 months at reasonable coin funding rates
- A major platform (CRED, PhonePe) enters aggressively within 12 months
- The team underestimates the RBI compliance work for payment routing and launches payment features without proper PA infrastructure, attracting regulatory action

### What makes this succeed?

The idea succeeds if:
- The first 90 seconds of onboarding reliably produces a "wow, I spend that much?" moment
- At least 3 anchor brand partners are signed before public launch, funding the initial coin rewards
- The streak and tier mechanics are tuned carefully enough that 40%+ of users are still active at Day 30 (benchmark: most finance apps are at 15–20%)
- The team raises ₹2–3 Cr seed capital before launch to fund coin economics and compliance infrastructure

---

## Summary Scorecard

| Dimension | Score | Notes |
|---|---|---|
| Problem reality | 9/10 | Real, widespread, under-served |
| Willingness to use (free) | 7/10 | High if onboarding hook works; low if tracker-only |
| Willingness to pay | 4/10 | Wrong framing — brands pay, not users |
| Brand willingness to fund rewards | 7/10 | Strong if user base is positioned correctly |
| Defensibility | 5/10 | 18-month window; CRED/PhonePe risk is real |
| Execution difficulty | 6/10 | Payment routing, RBI compliance, brand deals are hard |
| Market size | 8/10 | 80M+ urban Indians paying 8–15 subscriptions + rent |
| Capital efficiency | 6/10 | Coin economics require upfront capital before brand revenue |
| **Overall** | **6.5/10** | **Viable with right execution, capital, and speed** |

---

> **Bottom line:** Subatone is a good idea in the right space at the right time — but it is a venture-scale bet, not a bootstrappable product. The coin economics require capital before they generate revenue. The 18-month competitive window is real. The execution bar is high. Build fast, raise early, sign brand partners before the public launch, and the model works.
