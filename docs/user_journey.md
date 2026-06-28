# Subatone — User Journey

> Every screen, decision point, and emotion across the full user lifecycle.

---

## Stage 1 — Discovery & Onboarding

### Entry Points
- App Store / Play Store search: "subscription tracker India", "manage subscriptions"
- Word of mouth: friend shares an achievement card on Instagram/WhatsApp
- Referral link: existing user shares referral for bonus coins
- Product Hunt, Reddit, Twitter/X organic content

### Onboarding Flow

```
Splash Screen (Subatone logo + tagline)
        ↓
"What's eating your wallet every month?" — problem hook screen
        ↓
Sign up: Phone number (OTP) or Google/Apple SSO
        ↓
Profile setup: Name, city, home currency (INR default)
        ↓
"Add your first subscription" — guided first-add
  → Search library or type custom
  → Pre-fills logo, amount, billing cycle
  → Set renewal date
        ↓
"Add your rent" — dedicated rent card prompt
  → Optional; skip gracefully
        ↓
Permission prompts (all optional, each explained clearly):
  → SMS read access: "We'll auto-detect your subscriptions"
  → Notifications: "Never miss a renewal"
        ↓
Dashboard reveals — animated total monthly burn number
  → "You spend ₹X/month on recurring payments"
        ↓
First Suba Coins awarded: "Welcome bonus — 100 coins"
  → Animated coin burst
        ↓
First streak started: "Day 1 of your journey"
```

**Onboarding goal:** User sees their first real number (monthly burn) within 90 seconds of signup. That number is the hook.

---

## Stage 2 — Activation (Day 1–7)

### Day 1
- User adds 2–5 subscriptions manually (motivated by seeing the growing total)
- Dashboard populates: category rings, upcoming renewals list
- Receives first achievement: "First Step" badge for adding 3 subscriptions
- Push notification (evening): "You've added ₹X in subscriptions. Add more to see the full picture."

### Day 2–3
- SMS parsing (if permitted) surfaces 2–3 more subscriptions: "We found Netflix and Jio in your SMS. Add them?"
- One-tap confirm to add detected subscriptions
- Coins awarded for each confirmed auto-detected subscription

### Day 4–5
- First renewal reminder fires: "Spotify renews in 3 days — ₹119"
- CTA: "Pay through Subatone and earn 119 coins"
- User is prompted to route payment through app

### Day 6–7
- Weekly digest push: "Your first week: X subscriptions tracked, ₹Y monthly burden uncovered"
- "You're on a 7-day streak! Keep going for a Bronze badge."
- Nudge to add rent if not yet added

**Activation metric:** User has ≥5 subscriptions tracked by Day 7.

---

## Stage 3 — Engagement Loop (Week 2 – Month 3)

### The Weekly Ritual

```
Sunday evening push: "3 renewals this week. Total: ₹1,240."
        ↓
User opens app → Dashboard → Upcoming renewals
        ↓
User taps renewal → "Pay through Subatone"
        ↓
Payment processed → Coins awarded → Animated celebration
  "You earned 140 coins! Streak: 3 months 🔥"
        ↓
User checks Coin Store → Browses deals
        ↓
Redeems coins for cashback on Amazon / Swiggy / partner brand
        ↓
Satisfaction → Habit formed → App opened again next week
```

### Monthly Ritual

- "Month-end recap" push notification
- Full monthly report revealed in-app (animated, shareable card)
- Tier progress bar: "You're 340 coins away from Prime tier"
- New monthly challenge unlocked: "Challenge for July: Pay everything before the 3rd"

### Streak Mechanics (Emotional Core)

The streak counter is the most powerful retention mechanism:
- Displayed prominently on home screen (current streak in days/months)
- Breaking a streak is designed to feel costly (loss aversion)
- "Streak Shield" feature: spend 500 coins to protect a streak from one missed payment
- Streak milestones trigger push + in-app celebration

---

## Stage 4 — Monetization Touchpoints

### In-Journey Revenue Moments

| Moment | What Happens | Revenue |
|---|---|---|
| User adds a subscription | App shows "Get 3 months free — upgrade to annual via Subatone" | Affiliate click |
| User views Coin Store | Brand-sponsored deals shown based on subscription profile | Brand placement fee |
| User pays rent | 3x coin bonus shown → user routes payment through app | Transaction fee |
| User reaches Prime tier | Financial product offer unlocked: "Pre-approved credit card for Subatone Prime members" | Lead gen fee |
| AI Advisor flags overspend | "Switch to this cheaper plan" CTA with affiliate link | Commission on conversion |
| User has 5+ OTT subscriptions | "These users save ₹800/month with Jio OTT bundle" — bundle deal card | Partnership revenue |

### Pro/Prime Upgrade Journey
- User hits free plan limit (8 subscriptions) → "Upgrade to Pro — ₹99/month"
- Value clearly stated: "Unlimited subscriptions + bank import + 2x coins"
- Annual plan shown with savings: "Save ₹389 vs monthly — ₹799/year"
- No dark patterns; upgrade prompt is contextual, not a paywall popup

---

## Stage 5 — Retention & Re-engagement

### Natural Retention Hooks
- Renewal reminders (at least 2–4 per month for average user) — guaranteed app opens
- Streak counter: loss aversion keeps users engaged
- Monthly report: "Your June summary is ready"
- Coin expiry warning: "220 coins expire in 7 days — redeem now"

### Win-back Flows (Lapsed Users)
- D+7 after last open: "You have 2 renewals this week. Don't miss them."
- D+14: "Your streak is at risk. Open Subatone to keep it alive."
- D+30: Re-onboarding push: "A lot has changed. New rewards, new deals."
- D+60: Last attempt + coin bonus: "We miss you. Here's 200 coins to come back."

---

## Stage 6 — Advocacy & Referral

### Triggers for Sharing
- Badge earned → animated shareable card auto-generated
  - "I'm an Obsidian member on Subatone. My monthly subscriptions: ₹X"
  - "I saved ₹3,200 this year by switching to annual plans — tracked on Subatone"
- Monthly report share card: beautiful, minimal, shows key stats
- Referral: "Give your friend 200 coins, get 500 coins when they add their first subscription"
- Milestone shares: "1 year streak on Subatone"

### Social Proof Loop
- Shared cards drive app installs
- New user onboards → sees friend's stats → motivated to beat them
- Community leaderboard (opt-in): top savers, longest streaks, most subscriptions managed

---

## Emotional Design Principles

| Principle | Implementation |
|---|---|
| **Clarity over complexity** | One number dominates the home screen: monthly burn |
| **Progress is visible** | Streak counter, tier bar, coin balance always visible |
| **Wins feel earned** | Coin animations, sound effects, badge reveals are celebratory |
| **Loss aversion is leveraged** | Streak shields, "don't lose your badge" messaging |
| **Premium feels exclusive** | Higher tiers have distinct visual identity (colour, card design) |
| **Trust is paramount** | No surprise charges, no hidden data use, full transparency |

---

## User Personas

### Arjun, 27 — Software Engineer, Bengaluru
- Pays for: ChatGPT Plus, GitHub Copilot, Cursor, Netflix, Spotify, Hotstar, iCloud, gym, rent ₹22,000
- Pain: No idea total monthly burn. Forgot trial converted 3 months ago.
- Subatone value: Sees ₹8,400/month burn on Day 1. Saves ₹1,200 by cutting 2 unused tools. Earns coins on rent.

### Priya, 34 — Marketing Lead, Mumbai
- Pays for: Canva Pro, Adobe CC, Notion, Zoom, Netflix, Spotify, health insurance, SIP, rent ₹38,000
- Pain: Work and personal subscriptions mixed up. No tax tracking.
- Subatone value: Tags work vs personal. Gets coin rewards. Referred 2 friends.

### Rahul, 21 — College Student, Pune
- Pays for: Hotstar, Spotify, mobile recharge, gaming pass, shared Netflix
- Pain: Limited budget. Forgets to cancel trials. Shares account costs with 2 friends.
- Subatone value: Free tier covers all subscriptions. Group split feature. Streak gamification keeps him engaged.
