# Subatone — Zero to Launch: Building a Startup From Scratch With No Money

> First principles. No budget. No team yet. No excuses.

---

## The Founding Constraint

Zero money means every decision is a trade-off between time and capital. This guide assumes:
- Solo founder or 2-person team
- ₹0 starting budget (use free tiers for everything)
- No prior startup experience required
- India-based, targeting Indian market first
- 12 months to reach seed fundable metrics

The entire plan is sequenced around one rule: **never spend money on something until you have evidence it works.**

---

## The Mental Model: Do Things That Don't Scale First

Every successful startup did embarrassing, unscalable things at the start:
- Airbnb founders photographed apartments themselves
- Paul Graham tells every YC founder to talk to users personally
- CRED's Kunal Shah sent WhatsApp messages to his phonebook for first 500 users

The instinct to build a perfect product before talking to anyone is the most common founder mistake. This guide fights that instinct at every step.

---

# PHASE 0 — BEFORE YOU WRITE A SINGLE LINE OF CODE
## Weeks 0–2: Validate the Pain

### The Only Goal
Confirm that real people feel the pain of untracked subscriptions badly enough to download an app for it. Do this before building anything.

### Day 1–3: The 50 Conversations

Talk to 50 people. Not a survey — actual conversations (WhatsApp call, coffee, DM). Ask:

1. "How many subscriptions do you think you pay for each month?"
2. "How much do you think you spend per month on subscriptions?"
3. "Have you ever forgotten to cancel a free trial? What happened?"
4. "Do you know your exact rent + subscriptions total off the top of your head?"

**What you are listening for:**
- The moment of surprise when they guess ₹1,500 and realise it might be ₹4,000
- The story of a forgotten subscription that charged for 3 months unnoticed
- The frustration of paying from 3 different accounts and losing track

If you cannot find 20 people out of 50 who feel this pain, the market is wrong. Stop here and pivot.

**Realistic expectation:** 35–40 out of 50 will have at least one forgotten subscription story. This pain is real.

### Day 3–5: The Landing Page (Free)

Build a landing page in one day. No code required.

**Tool:** [Carrd.co](https://carrd.co) — free tier, deploy in 30 minutes.

**Page content (one scroll):**
- Headline: "You're probably paying for 3 subscriptions you forgot about."
- Sub-headline: "Subatone tracks every subscription, recharge, and rent payment — and rewards you for staying on top of them."
- Email capture: "Get early access — be first when we launch."
- 3 pain-point bullets (from your 50 conversations — use their exact words)
- Footer: "Built in India. Launching soon."

**Do not** describe features. Do not show a product. Describe the pain and the promise.

**Goal:** 100 email sign-ups before you write any code.

### Day 5–14: Drive Traffic to the Landing Page (Free)

Every channel below costs ₹0:

**Reddit (highest ROI for zero-money launches):**
- Post in r/india, r/personalfinanceindia, r/IndiaInvestments, r/digitalnomad
- Title: "I added up all my subscriptions yesterday. ₹6,200/month. I had no idea."
- Write a personal story post (700–900 words). At the end: "I'm building a tool to prevent this — here's the waitlist if you want early access."
- Do NOT post like a founder marketing a product. Post like a person sharing a discovery.
- Rule: one authentic post per community. Not spam.

**Twitter/X:**
- Thread: "I spent 2 hours tracking every subscription I pay for. Here's what I found: [data]. If this hits, I'm building a tracker. DM me."
- Tag 2–3 fintech/personal finance creators and ask for their opinion

**LinkedIn:**
- "I asked 50 people how much they spend on subscriptions. None of them were right. Building something about this."
- Target: young professionals, startup employees, product managers

**WhatsApp:**
- Send to your actual contacts personally — not broadcast. "Hey, I'm building something around subscription tracking. 2-minute read — does this resonate with you?"
- Do not mass-forward. Personal messages only.

**Telegram:**
- Post in Indian personal finance groups, tech communities, startup communities

**Benchmark:** 100 email sign-ups in 2 weeks is achievable with consistent posting. If you cannot reach 100, either the messaging is wrong or the pain is not sharp enough. Revisit the landing page copy before proceeding.

---

# PHASE 1 — BUILD THE MVP
## Weeks 2–8: The Minimum Viable Product

### What MVP Means Here

MVP is not the smallest possible version of your vision. It is the smallest product that proves the core hypothesis: **"People will open this app more than once because seeing their subscription spend changes their behaviour."**

The MVP is NOT:
- Payment routing (requires compliance infrastructure)
- Real coin cashbacks (requires brand partners and capital)
- Bank/SMS import (requires permissions and parsing)
- AI advisor
- Social features
- Web app

The MVP IS:
- Manual subscription + rent entry (fast, under 10 seconds)
- Dashboard: total monthly burn + upcoming renewals
- Push reminders: 3 days before each renewal
- Suba Coins (cosmetic only — points earned for adding and tracking, redeemable for Pro features, not cash)
- Streaks: consecutive months with no missed renewals
- 5–6 achievement badges

The coins in MVP do not cost money. They unlock features inside the app (longer reminder windows, calendar view). No cashback. No brand deals. Just the gamification loop.

### Free Tech Stack for Zero Budget

Every tool below has a generous free tier sufficient to reach 1,000–5,000 users:

| Layer | Tool | Free Tier |
|---|---|---|
| Mobile app | Expo + React Native | Free forever |
| App builds | Expo EAS Build | 30 builds/month free |
| Auth | Clerk | 10,000 MAU free |
| Database | Supabase | 500MB, 50K MAU free |
| Backend hosting | Render | Free tier (750 hrs/month) |
| Redis / queues | Upstash | 10,000 commands/day free |
| Email | Resend | 100 emails/day free |
| Push notifications | Expo Push Notifications | Free (uses FCM/APNs) |
| Design | Figma | Free for solo designers |
| Analytics | PostHog | 1M events/month free |
| Error tracking | Sentry | 5K errors/month free |
| Domain | Freenom (.tk) or buy one for ₹99/year | ~₹99 |
| Landing page | Carrd | Free tier |
| Version control | GitHub | Free |
| Project management | Linear (free tier) or Notion | Free |
| Icons / assets | Phosphor Icons, Lucide | Free |
| Animations | Lottie Files (free animations) | Free |
| App Store | Apple Developer: ₹8,300/year | One-time cost |
| Play Store | Google Developer: ₹1,750 one-time | One-time cost |

**Total hard cost to launch: ₹10,000–12,000** (developer accounts only). Everything else is free.

### What to Build, In Order

**Week 2–3: Skeleton**
- Expo project setup with Expo Router
- Supabase: users, subscriptions, reminders tables
- Clerk auth (phone OTP)
- Basic navigation: Home tab, Subscriptions tab, Profile tab

**Week 3–4: Core Tracker**
- Add subscription flow: search library → fill details → save
- Pre-loaded library: 100 services (name, logo URL from their CDN, default amount)
- Dashboard: monthly burn total (big number, centred), upcoming renewals list
- Add rent as a recurring payment

**Week 4–5: Reminders**
- Push notification setup via Expo
- Upstash Redis + BullMQ: schedule reminder jobs
- Configurable: 7 days, 3 days, 1 day before renewal
- Mark as paid manually

**Week 5–6: Gamification (Cosmetic)**
- Suba Coins: award on add subscription (10 coins), on mark-as-paid (variable by amount), on streak milestone
- Coin balance on home screen
- Streak counter: days/months of consistent tracking
- 5 badges: First Step, Week Warrior, Month Master, Rent Regular, Subscription Ninja
- Lottie animation on coin earn

**Week 6–7: Polish**
- Onboarding flow: 4 screens max, ending on first subscription add
- Empty states (beautiful, not just blank)
- Loading skeletons (no raw spinners)
- Dark mode (users expect it)
- App icon, splash screen

**Week 7–8: TestFlight / Internal Testing**
- Submit to TestFlight (iOS internal testing, no App Store review needed)
- APK for Android direct install (no Play Store needed for beta)
- Send to your 100 waitlist users
- Watch PostHog: does anyone return on Day 2? Day 7?

### The One Metric That Matters in MVP

**Day 7 retention.** If 30%+ of users who add their first subscription come back on Day 7, you have a product. If it is below 15%, something is broken — either the reminders are not firing, the dashboard is not compelling, or the onboarding failed to create the revelation moment.

Do not move to Phase 2 without 30% Day-7 retention.

---

# PHASE 2 — GET FIRST REAL USERS
## Weeks 8–12: Launch and Learn

### The Launch Sequence

Do not launch everywhere at once. Sequence it to maximise learning and word of mouth.

**Week 8: Soft Launch — Waitlist Only**
- Send personal email/WhatsApp to all 100+ waitlist users
- Message: "It's live. You're in the first 100 people to ever use this. Please be brutal with feedback."
- Onboard them personally — literally watch them use the app via a call if possible (Zoom screen share)
- Fix the 3 biggest friction points before the next step

**Week 9: Community Launch**

Reddit posts — these are your highest ROI launch channels:

*Post 1 (r/india):*
> "I built an app that shows you how much you're bleeding to subscriptions every month. Free. No ads. Here's why I built it and what I found tracking my own subscriptions for 6 months."

*Post 2 (r/personalfinanceindia):*
> "Subscription tracking app built for India — includes Jio/Airtel recharges and rent. Free, no login required to try. Looking for feedback from r/PFI."

*Rules for Reddit:* Be authentic. Reply to every comment. Do not delete negative feedback — engage with it. Reddit will destroy promotional posts; it rewards genuine sharing.

**Week 10: Product Hunt Launch**

Product Hunt is free. A good launch can bring 500–2,000 installs in 24 hours.

**Preparation (start 2 weeks before):**
- Create your Product Hunt profile and get it to Maker status
- Prepare hunter — ask a Product Hunt power-user to hunt your product (DM them; most will say yes for a good product)
- Prepare 5 images/screenshots that each tell one story (not feature screenshots — outcome screenshots)
- Write a launch message that leads with the problem, not the product

**Launch day:**
- Launch at 12:01 AM PST (when the day resets)
- Post in all your communities: "We're live on Product Hunt today. Would mean a lot if you checked it out."
- Reply to every comment on Product Hunt within minutes

**Realistic expectation:** Top 5 of the day = 500–1,500 sign-ups. #1 = 2,000–5,000. Even #10–20 brings 200–400 sign-ups. Any of these is a win.

**Week 11–12: Twitter/X Build-in-Public**

Start a thread series. Post every Sunday:
- "Week 8 of building Subatone in public. Here's what happened: [users, retention, what broke, what surprised me]"
- Include real screenshots (PostHog retention chart, user quotes, error rates)
- Build-in-public content consistently outperforms promotional content

This serves three purposes:
1. Builds an audience organically
2. Creates accountability
3. Generates a proof trail for investors ("they've been transparent and iterating for months")

---

# PHASE 3 — GROWTH WITHOUT ADS
## Month 2–4: Compounding Zero-Cost Channels

### Channel 1: SEO Content (Compounding, Free)

Every search below has real monthly volume in India with low competition:

| Target keyword | Volume (est.) | Content type |
|---|---|---|
| "subscription tracker India" | 1,200/mo | Tool review + Subatone CTA |
| "how much do I spend on subscriptions" | 900/mo | Calculator post |
| "cancel subscriptions India" | 2,100/mo | Guide + Subatone as solution |
| "best OTT subscriptions India 2026" | 18,000/mo | Roundup with Subatone sidebar |
| "Jio vs Airtel recharge comparison" | 35,000/mo | Comparison post |
| "ChatGPT Plus worth it India" | 4,500/mo | Review with spend tracking angle |
| "hidden subscription charges India" | 600/mo | Investigation post + Subatone |

**How to write SEO content for free:**
- Use Google Search Console (free) for keyword data after launch
- Write directly in your own voice — no AI-generated content (Google penalises it heavily now)
- Each post: 1,200–2,000 words, answers the query completely, mentions Subatone naturally
- Host on your own domain (Subatone.in or similar) for SEO credit

**Volume goal:** 10 quality posts by Month 4. SEO compounds over 6–12 months. This is a patience game, not an instant-return investment.

### Channel 2: Shareable Moments (Free, Viral Potential)

Build a feature that creates a shareable artefact:

**Monthly Summary Card** — at the end of each month, generate a beautiful image (using Satori + Sharp, free libraries) showing:
- Total spent this month: ₹X
- Number of subscriptions: Y
- Biggest category: OTT (42%)
- Streak: 3 months
- "Tracked on Subatone"

Users share this on Instagram Stories, WhatsApp, Twitter. Every share is a free ad to a targeted audience (the sharer's network = similar demographics to the sharer).

**How CRED used this:** CRED's score reveal cards were shared virally. The emotional trigger is the same — "I want to show off that I am financially aware."

Implementation cost: ₹0. Engineering time: 1–2 days.

### Channel 3: Finance Creator Outreach (Free)

India has 200+ YouTube and Instagram creators in personal finance with 10K–500K followers. Most are accessible via DM. None of them have a sponsor for a subscription tracker.

**Approach:**
1. Use Subatone for 30 days yourself
2. Make a 2-minute screen recording of the "revelation moment" (onboarding → first number revealed)
3. DM 50 creators: "Hey [name], I've been following your content on [specific video]. I built a free subscription tracker for India. Would love to show you — takes 2 minutes. No sponsorship ask, just genuinely want your feedback."

If 5 of 50 post organically about it, that's potentially 200,000 people seeing the product. Cost: ₹0.

**Do NOT offer paid sponsorships before you have revenue.** Offer early access, a personal onboarding call, and genuine feedback loops.

### Channel 4: Communities That Already Exist

Build presence, not just posts, in:

| Community | Platform | What to contribute |
|---|---|---|
| r/personalfinanceindia | Reddit | Answer questions, occasionally mention Subatone naturally |
| IndiaInvestments | Reddit | Contribute for 30 days before ever mentioning the product |
| LLA Community | Telegram | Labourlaw advisor's personal finance Telegram (active) |
| Finshots readers | Twitter/newsletter | Engage with their content |
| SaaSBoomi | Slack/in-person events | India SaaS community — connect with other founders |
| iSPIRT | Bangalore meetups | Connect with fintech founders and advisors |
| YourStory | Guest post | Free to submit guest posts |

**Rule:** Give value for 30 days in each community before asking for anything. Community trust cannot be bought — it must be earned.

---

# PHASE 4 — FIRST REVENUE
## Month 3–5: The Three Revenue Bets

You need revenue before you can raise investment credibly. Here are the only three that are possible with zero starting capital:

### Revenue Bet 1: First Paying Pro Users

By Month 3, you have 1,000–3,000 MAU from organic growth. Convert some to Pro.

**How to do it:**
- Do NOT add a paywall. Add a value wall.
- When a user reaches 8 subscriptions, show: "You're tracking ₹X/month. Pro users track unlimited subscriptions and get 2x coins. ₹99/month."
- Email your most active users (PostHog: users with 5+ sessions in 30 days) personally: "You're one of our most active users. I'd love to offer you Pro at 50% off for 6 months in exchange for a 15-minute feedback call."

**Target:** 50 paying Pro users at ₹99/month = ₹4,950 MRR. This is not meaningful revenue — but it is proof of willingness to pay, which matters for fundraising.

### Revenue Bet 2: First Brand Partner

Your first brand partner will be small. It will not be Netflix or Spotify. It will be a startup or a D2C brand that wants to reach a specific audience.

**Who to target:**
- EdTech startups (Coursera India, Skill-lync) — their target users are tech-savvy professionals, exactly your audience
- Productivity SaaS (Notion India, Todoist) — align perfectly with Subatone's user
- VPN services (NordVPN, ProtonVPN) — popular with Subatone's exact demographic
- Password managers (1Password, Bitwarden) — direct overlap

**The pitch to a brand:**
> "Subatone has X users who are all subscription payers — they literally pay for 10+ apps per month. These are your ideal customers. We want to offer your product as a reward in our coin catalogue. You fund ₹50 of cashback per redemption; we feature you prominently to our user base. No upfront fee — you only pay when a user redeems."

**Cost to you:** ₹0. The brand funds the cashback.  
**How to find them:** LinkedIn. Direct email. Startup events. Cold email their founders.  
**Target:** 1 brand partner by Month 4, with ₹5,000–₹20,000 total cashback budget committed.  

Even ₹5,000 committed means you can offer 100 users a ₹50 reward — and that makes the coin system real.

### Revenue Bet 3: Affiliate Links

The fastest zero-effort revenue stream:

- Sign up as an Amazon affiliate (free)
- When a user adds Netflix, show: "Want to pay Netflix via Amazon Pay UPI and earn rewards? [affiliate link]"
- Sign up for Jio, Airtel affiliate programmes (both have them)
- Sign up for NordVPN, Hostinger, Namecheap affiliates (all free to join)

Every time a user clicks and converts, you earn ₹50–₹500 per transaction depending on the product.

**Implementation:** Affiliate links in the "Discover deals" section. Total engineering time: 1 day.  
**Revenue potential:** 5,000 MAU × 2% click-through × 5% conversion × ₹200 avg commission = ₹1,000/month. Small, but real.

---

# PHASE 5 — PITCHING TO INVESTORS
## Month 4–8: Raising Seed Capital

### When to Start Pitching

Do not pitch before you have:
- [ ] 1,000+ MAU (Monthly Active Users) — not downloads, active users
- [ ] 30%+ Day-7 retention
- [ ] At least ₹4,000 MRR (any combination of Pro subscriptions + affiliate + brand deal)
- [ ] A clear story of how you reached those numbers with zero money

With those numbers, you have a fundable seed story. Without them, you are pitching an idea — and ideas are worth nothing.

### Where to Pitch in India (Free to Apply)

| Fund / Programme | Stage | Typical Cheque | Apply |
|---|---|---|---|
| **100x.vc** | Pre-seed | ₹25L for 2.5% | Apply online; no pitch meeting required upfront |
| **Y Combinator** | Seed | $500K for 7% | yc.com/apply — apply from India, interview remotely |
| **Antler India** | Idea / pre-seed | ₹50–75L | Cohort-based; good for solo/early founders |
| **Lightspeed Emerge** | Seed | $500K–$1M | lightspeedvp.com — email partners directly |
| **Better Capital** | Pre-seed | ₹25–75L | Vaibhav Domkundwar; fintech-friendly |
| **Stellaris Venture** | Seed | $1–3M | India-focused; consumer + fintech |
| **Blume Ventures** | Seed | ₹50L–₹2Cr | India's most active seed fund |
| **Kalaari Capital** | Seed | $1–3M | India-focused |
| **iSPIRT Angels** | Angel | ₹5–25L each | India product ecosystem angels; free to connect |
| **LetsVenture** | Angel syndicate | ₹10–50L | List your startup for free; angels browse |
| **AngelList India** | Angel | Variable | Free to list |

**Apply to all simultaneously.** Each application is free. Track responses in a spreadsheet.

### The Pitch Story (Structure)

Every pitch has one job: make the investor feel the pain, believe in your solution, and trust that you are the person to build it. Nothing else matters.

**The 10-slide deck structure:**

**Slide 1 — The Hook**  
One sentence. One number. One emotion.  
*"The average Indian pays ₹5,200/month on subscriptions and has no idea."*

**Slide 2 — The Problem**  
Three pain points. Use real quotes from your user interviews.  
*"Mihir from Bengaluru paid for Headspace for 11 months after stopping. He found out when we showed him his data."*

**Slide 3 — The Solution**  
One screenshot of the app. One sentence description.  
*"Subatone tracks every subscription, sends reminders before they renew, and rewards you with coins for staying on top of your money."*

**Slide 4 — The CRED Comparison**  
*"CRED made credit card bill payments rewarding. We do the same for subscriptions and rent — a ₹12,000 Cr market CRED never entered."*

**Slide 5 — Traction**  
Real numbers only. No projections on this slide.  
MAU, retention rate, MRR, growth rate week-over-week, number of subscriptions tracked.

**Slide 6 — Business Model**  
*"Users are free. Brands pay to reach them. We also take a fee on rent payments and offer a Pro tier."*  
Show the flywheel in one diagram.

**Slide 7 — Market Size**  
- 80M+ urban Indians paying subscriptions
- Average 12 subscriptions × ₹500 average = ₹480 Cr/month in subscription payments flowing through India
- Addressable with payment routing + brand fees

**Slide 8 — Why Now**  
- Subscription fatigue is at an all-time high post-COVID
- India has more OTT subscriptions per household than the US now
- AI tools have added ₹1,000–₹3,000/month for 10M+ Indian tech workers
- No credible Indian subscription tracker exists

**Slide 9 — Team**  
Why are you the right person to build this? Be specific and honest.  
If solo: "I am building this solo. I am looking for a co-founder with [specific skill]. Here is why I will find one."  
Do not fake a team. Investors know.

**Slide 10 — The Ask**  
*"We are raising ₹75L (approximately $90K) on a SAFE at ₹3 Cr valuation cap. This funds 12 months of operations: developer accounts, brand seed fund (₹20L), one engineering hire in Month 6, and marketing experiments."*

### The One-Liner (Memorise This)

*"Subatone is CRED for subscriptions and rent — we turn the act of paying Netflix, Spotify, and rent into a rewarding habit, and monetise through brand partnerships exactly like CRED does with credit card bills."*

Every investor in India knows what CRED is and what it is worth. This one sentence does all the positioning work.

### How to Get Meetings Without Warm Intros

Warm intros are ideal but not required. These work without them:

1. **Twitter/X cold DM:** Follow the investor for 2 weeks, engage genuinely with their tweets, then DM with a one-paragraph pitch and a Loom link to a 3-minute product demo. Do not attach a deck in the first message.

2. **LinkedIn connection + message:** Connect with a short note: "I'm building CRED for subscriptions in India. Have early traction. Would love 15 minutes if subscriptions/fintech consumer is relevant to your thesis."

3. **Founder referrals:** Every investor's portfolio has founders. Find a founder in a related space (fintech, consumer), use the product genuinely, send them feedback, then ask: "Would you be open to intro'ing me to [investor name]? I've been a user of [their company] and [specific compliment]."

4. **Apply to demo days:** iSPIRT, SaaSBoomi, YourStory TechSparks, Inc42 events. These are free or low-cost. Investors attend specifically to see pitches.

5. **100x.vc is truly no-pitch:** They review decks submitted online and send term sheets without a meeting. Apply as soon as you have the traction numbers above.

---

# THE MASTER TIMELINE

## Month-by-Month Execution Plan

```
WEEK 1–2    │ VALIDATE
            │ → Talk to 50 people
            │ → Build Carrd landing page
            │ → Drive 100 email sign-ups via Reddit + WhatsApp + Twitter
            │ → Go/No-Go decision: is the pain real?

WEEK 2–8    │ BUILD MVP
            │ → Expo + Supabase + Clerk setup (Week 2)
            │ → Manual tracker + dashboard (Week 3–4)
            │ → Push reminders (Week 4–5)
            │ → Cosmetic gamification: coins, streaks, badges (Week 5–6)
            │ → Polish, onboarding, app icon (Week 6–7)
            │ → TestFlight + APK beta (Week 7–8)

WEEK 8–10   │ SOFT LAUNCH
            │ → Send to 100 waitlist users personally
            │ → Watch Day-7 retention in PostHog
            │ → Fix top 3 friction points
            │ → Go/No-Go: 30%+ Day-7 retention?

WEEK 9–12   │ PUBLIC LAUNCH
            │ → Reddit community posts
            │ → Product Hunt launch (Week 10)
            │ → Build-in-public Twitter thread series begins
            │ → App Store + Play Store submission

MONTH 3     │ GROW + FIRST REVENUE
            │ → 10 SEO blog posts published
            │ → Cold outreach to 50 finance creators
            │ → Add monthly summary share cards feature
            │ → Affiliate links live (Amazon, Jio, Airtel)
            │ → Target: 1,000 MAU, ₹2,000 MRR

MONTH 4     │ FIRST BRAND PARTNER
            │ → Cold email 20 relevant brands
            │ → Sign first brand partner (even ₹5,000 committed)
            │ → Coins become semi-real: first redeemable rewards in catalogue
            │ → Start building pitch deck
            │ → Target: 2,000 MAU, ₹5,000 MRR

MONTH 5     │ BEGIN FUNDRAISING
            │ → Apply: 100x.vc, Y Combinator, Antler, LetsVenture
            │ → Send cold DMs to 30 relevant investors on Twitter/LinkedIn
            │ → Post fundraising traction publicly (build-in-public builds credibility)
            │ → Target: 3,000–5,000 MAU, ₹10,000 MRR

MONTH 6–8   │ FUNDRAISING SPRINT
            │ → 50+ investor meetings
            │ → Incorporate properly (LLP → Pvt Ltd if not already done)
            │ → Legal: SAFE note template (free from YC's open-source templates)
            │ → Close ₹50–100L seed / pre-seed
            │ → Target: term sheet by Month 8

MONTH 8–12  │ POST-SEED: SCALE
            │ → Hire first engineer (contract or full-time)
            │ → Build Phase 2 features: SMS import, payment routing
            │ → 10 brand partners, real cashback catalogue
            │ → Target: 25,000 MAU, ₹50,000 MRR
            │ → Begin Series A preparation
```

---

# FIRST PRINCIPLES RULES

These are the non-negotiable operating principles for a zero-budget startup.

### Rule 1: Talk to users before building any feature
Every feature you build without user validation is a bet. Bets with zero money are bets you cannot afford to lose.

### Rule 2: The free tier is your runway
Supabase free tier ends at 500MB. PostHog free tier ends at 1M events. Know every limit. When you hit 80% of a limit, either upgrade (using revenue) or optimise. Never let a free tier limit surprise you.

### Rule 3: Do not build for scale you don't have
No microservices. No Kubernetes. No complex infrastructure. A monolithic Hono API on a single Render instance handles 50,000 MAU without breaking a sweat. Complexity kills speed, and speed is your only advantage over funded competitors.

### Rule 4: Your first 100 users are not your customers — they are your product team
Onboard them personally. Join their WhatsApp groups. Send them voice messages. Build what they tell you. The product intuition you develop from 100 deep user relationships cannot be bought with any amount of funding.

### Rule 5: Revenue before features
Before you build the next feature, ask: does this move revenue, retention, or referral? If none of the three, do not build it. The backlog can wait. Paying users cannot.

### Rule 6: Fundraising is a distraction until you have traction
Do not spend more than 2 hours per week on fundraising activities before Month 4. Every hour spent writing emails to investors is an hour not spent on user retention. Traction gets meetings. Hustle without traction gets polite rejections.

### Rule 7: The deck is the last thing you make
Founders spend weeks on pitch decks with no users. The deck should take 3 days maximum. The traction numbers on Slide 5 do more than the design of Slide 1.

### Rule 8: Protect the streak
Your personal streak as a founder: ship something every week. A feature, a fix, a blog post, a user interview. Investors, users, and potential co-founders watch founders who keep shipping. Silence kills momentum.

---

# THE ZERO-BUDGET TOOLKIT (Complete List)

### Building
- **Expo** — React Native app framework (free)
- **Supabase** — Database + auth + storage (free tier)
- **Clerk** — Auth with OTP + social (free to 10K MAU)
- **Render** — Backend hosting (free tier)
- **Upstash** — Redis + queues (free tier)
- **Resend** — Email sending (free 100/day)
- **GitHub** — Code hosting + CI/CD (free)
- **Figma** — Design (free for solo)
- **Lottie Files** — Free animations

### Analytics & Monitoring
- **PostHog** — Product analytics, funnels, session replay (1M events/month free)
- **Sentry** — Error tracking (free tier)
- **Google Search Console** — SEO monitoring (free)

### Marketing
- **Carrd** — Landing page (free)
- **Notion** — Content calendar and docs (free)
- **Buffer** — Social scheduling (free tier: 3 channels)
- **Canva** — Design assets for social (free tier)
- **Loom** — Product demo recordings (free tier)
- **Mailchimp** or **Brevo** — Email newsletters (free to 500 contacts)
- **Google Analytics 4** — Web analytics (free)

### Fundraising
- **DocSend** — Track who reads your deck (free trial, then $10/month — use the trial)
- **YC SAFE templates** — Free legal templates for fundraising docs (ycombinator.com/documents)
- **LetsVenture** — Free startup profile for angel discovery
- **LinkedIn Sales Navigator** — 30-day free trial for investor prospecting

### Operations
- **Linear** — Project management (free tier)
- **Notion** — Knowledge base (free)
- **Google Workspace** — Email with custom domain (14-day free trial, then ₹130/month — worth it)
- **Calendly** — Meeting scheduling (free tier)
- **Loom** — Async communication with early team (free)

---

# HARDEST PARTS (AND HOW TO SURVIVE THEM)

### The Valley of Despair (Month 2–4)
This is when the launch excitement fades, growth is slow, and no one is paying yet. Every founder hits it. The only way through is consistent, small progress every week. Keep shipping. Keep posting. Keep talking to users.

### The Co-founder Question
If you are solo, you will be stretched. The first hire/co-founder should be whoever is your biggest weakness. If you are technical, find someone who can do sales, BD, and marketing. If you are non-technical, find someone who can build the MVP (many developers will work for equity at this stage — post on YC's co-founder matching, LinkedIn, and Hacker News "Who wants to be my co-founder" threads).

### The Isolation Problem
Building alone is lonely. Join these communities immediately — they are free and will keep you sane:
- **SaaSBoomi** (India SaaS community, Slack)
- **Indie Hackers** (global bootstrappers community)
- **YC's Startup School** (free, self-paced; also connects you to other founders)
- **Hacker News** (post every milestone, engage daily)

### The "Just Build It" Trap
The biggest time sink for technical founders is over-building before validation. If you catch yourself writing a custom coin engine when you could use a simple PostgreSQL counter, you are in the trap. The MVP coin system is literally one integer column in the users table. Premature optimisation is the enemy of shipping.

---

> **The single most important thing:** Talk to a user today. Not tomorrow. Today. Before you build, launch, pitch, or plan anything else, go find one person who pays for more than 8 subscriptions and show them the landing page. What they say in the next 5 minutes is worth more than this entire document.
