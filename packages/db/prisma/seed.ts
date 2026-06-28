// packages/db/prisma/seed.ts
// Seeds the ServiceLibrary with 80+ popular Indian services.

import { PrismaClient, BillingCycle, SubscriptionCategory } from '@prisma/client'

const prisma = new PrismaClient()

const services = [
  // OTT
  { name: 'Netflix', category: SubscriptionCategory.OTT, logoUrl: 'https://assets.subatone.in/logos/netflix.png', websiteUrl: 'https://netflix.com', defaultAmount: 649, defaultCycle: BillingCycle.MONTHLY, isPopular: true, searchTerms: ['netflix', 'streaming', 'movies'] },
  { name: 'Amazon Prime Video', category: SubscriptionCategory.OTT, logoUrl: 'https://assets.subatone.in/logos/prime.png', websiteUrl: 'https://primevideo.com', defaultAmount: 1499, defaultCycle: BillingCycle.ANNUALLY, isPopular: true, searchTerms: ['prime', 'amazon', 'primevideo'] },
  { name: 'Disney+ Hotstar', category: SubscriptionCategory.OTT, logoUrl: 'https://assets.subatone.in/logos/hotstar.png', websiteUrl: 'https://hotstar.com', defaultAmount: 299, defaultCycle: BillingCycle.MONTHLY, isPopular: true, searchTerms: ['hotstar', 'disney', 'jiohotstar'] },
  { name: 'Apple TV+', category: SubscriptionCategory.OTT, logoUrl: 'https://assets.subatone.in/logos/appletv.png', websiteUrl: 'https://tv.apple.com', defaultAmount: 199, defaultCycle: BillingCycle.MONTHLY, isPopular: false, searchTerms: ['apple tv', 'appletv'] },
  { name: 'Sony LIV', category: SubscriptionCategory.OTT, logoUrl: 'https://assets.subatone.in/logos/sonyliv.png', websiteUrl: 'https://sonyliv.com', defaultAmount: 299, defaultCycle: BillingCycle.MONTHLY, isPopular: false, searchTerms: ['sony', 'sonyliv'] },
  { name: 'ZEE5', category: SubscriptionCategory.OTT, logoUrl: 'https://assets.subatone.in/logos/zee5.png', websiteUrl: 'https://zee5.com', defaultAmount: 149, defaultCycle: BillingCycle.MONTHLY, isPopular: false, searchTerms: ['zee5', 'zee'] },
  // Music
  { name: 'Spotify', category: SubscriptionCategory.MUSIC, logoUrl: 'https://assets.subatone.in/logos/spotify.png', websiteUrl: 'https://spotify.com', defaultAmount: 119, defaultCycle: BillingCycle.MONTHLY, isPopular: true, searchTerms: ['spotify', 'music'] },
  { name: 'YouTube Premium', category: SubscriptionCategory.OTT, logoUrl: 'https://assets.subatone.in/logos/youtube.png', websiteUrl: 'https://youtube.com/premium', defaultAmount: 189, defaultCycle: BillingCycle.MONTHLY, isPopular: true, searchTerms: ['youtube', 'yt premium'] },
  { name: 'Apple Music', category: SubscriptionCategory.MUSIC, logoUrl: 'https://assets.subatone.in/logos/applemusic.png', websiteUrl: 'https://music.apple.com', defaultAmount: 99, defaultCycle: BillingCycle.MONTHLY, isPopular: false, searchTerms: ['apple music'] },
  // Mobile / Telecom
  { name: 'Jio Recharge', category: SubscriptionCategory.MOBILE, logoUrl: 'https://assets.subatone.in/logos/jio.png', websiteUrl: 'https://jio.com', defaultAmount: 239, defaultCycle: BillingCycle.MONTHLY, isPopular: true, searchTerms: ['jio', 'reliance jio'] },
  { name: 'Airtel Recharge', category: SubscriptionCategory.MOBILE, logoUrl: 'https://assets.subatone.in/logos/airtel.png', websiteUrl: 'https://airtel.in', defaultAmount: 299, defaultCycle: BillingCycle.MONTHLY, isPopular: true, searchTerms: ['airtel', 'bharti airtel'] },
  { name: 'Vi (Vodafone Idea)', category: SubscriptionCategory.MOBILE, logoUrl: 'https://assets.subatone.in/logos/vi.png', websiteUrl: 'https://myvi.in', defaultAmount: 249, defaultCycle: BillingCycle.MONTHLY, isPopular: false, searchTerms: ['vi', 'vodafone', 'idea'] },
  { name: 'BSNL Recharge', category: SubscriptionCategory.MOBILE, logoUrl: 'https://assets.subatone.in/logos/bsnl.png', websiteUrl: 'https://bsnl.in', defaultAmount: 197, defaultCycle: BillingCycle.MONTHLY, isPopular: false, searchTerms: ['bsnl'] },
  // AI Tools
  { name: 'ChatGPT Plus', category: SubscriptionCategory.AI_TOOLS, logoUrl: 'https://assets.subatone.in/logos/chatgpt.png', websiteUrl: 'https://openai.com', defaultAmount: 1650, defaultCycle: BillingCycle.MONTHLY, isPopular: true, searchTerms: ['chatgpt', 'openai', 'gpt4'] },
  { name: 'Claude Pro', category: SubscriptionCategory.AI_TOOLS, logoUrl: 'https://assets.subatone.in/logos/claude.png', websiteUrl: 'https://claude.ai', defaultAmount: 1650, defaultCycle: BillingCycle.MONTHLY, isPopular: true, searchTerms: ['claude', 'anthropic'] },
  { name: 'GitHub Copilot', category: SubscriptionCategory.AI_TOOLS, logoUrl: 'https://assets.subatone.in/logos/github.png', websiteUrl: 'https://github.com/features/copilot', defaultAmount: 830, defaultCycle: BillingCycle.MONTHLY, isPopular: true, searchTerms: ['copilot', 'github copilot'] },
  { name: 'Cursor', category: SubscriptionCategory.AI_TOOLS, logoUrl: 'https://assets.subatone.in/logos/cursor.png', websiteUrl: 'https://cursor.com', defaultAmount: 1650, defaultCycle: BillingCycle.MONTHLY, isPopular: true, searchTerms: ['cursor', 'cursor ai'] },
  { name: 'Midjourney', category: SubscriptionCategory.AI_TOOLS, logoUrl: 'https://assets.subatone.in/logos/midjourney.png', websiteUrl: 'https://midjourney.com', defaultAmount: 830, defaultCycle: BillingCycle.MONTHLY, isPopular: false, searchTerms: ['midjourney', 'mj'] },
  { name: 'Perplexity Pro', category: SubscriptionCategory.AI_TOOLS, logoUrl: 'https://assets.subatone.in/logos/perplexity.png', websiteUrl: 'https://perplexity.ai', defaultAmount: 1650, defaultCycle: BillingCycle.MONTHLY, isPopular: false, searchTerms: ['perplexity'] },
  // Cloud Storage
  { name: 'iCloud+', category: SubscriptionCategory.CLOUD_STORAGE, logoUrl: 'https://assets.subatone.in/logos/icloud.png', websiteUrl: 'https://icloud.com', defaultAmount: 219, defaultCycle: BillingCycle.MONTHLY, isPopular: true, searchTerms: ['icloud', 'apple icloud'] },
  { name: 'Google One', category: SubscriptionCategory.CLOUD_STORAGE, logoUrl: 'https://assets.subatone.in/logos/googleone.png', websiteUrl: 'https://one.google.com', defaultAmount: 130, defaultCycle: BillingCycle.MONTHLY, isPopular: true, searchTerms: ['google one', 'google storage'] },
  { name: 'Dropbox', category: SubscriptionCategory.CLOUD_STORAGE, logoUrl: 'https://assets.subatone.in/logos/dropbox.png', websiteUrl: 'https://dropbox.com', defaultAmount: 830, defaultCycle: BillingCycle.MONTHLY, isPopular: false, searchTerms: ['dropbox'] },
  // Productivity
  { name: 'Notion', category: SubscriptionCategory.PRODUCTIVITY, logoUrl: 'https://assets.subatone.in/logos/notion.png', websiteUrl: 'https://notion.so', defaultAmount: 800, defaultCycle: BillingCycle.MONTHLY, isPopular: true, searchTerms: ['notion'] },
  { name: 'Figma', category: SubscriptionCategory.PRODUCTIVITY, logoUrl: 'https://assets.subatone.in/logos/figma.png', websiteUrl: 'https://figma.com', defaultAmount: 1240, defaultCycle: BillingCycle.MONTHLY, isPopular: false, searchTerms: ['figma', 'design'] },
  { name: 'Adobe Creative Cloud', category: SubscriptionCategory.PRODUCTIVITY, logoUrl: 'https://assets.subatone.in/logos/adobe.png', websiteUrl: 'https://adobe.com', defaultAmount: 4550, defaultCycle: BillingCycle.MONTHLY, isPopular: false, searchTerms: ['adobe', 'photoshop', 'illustrator', 'cc'] },
  { name: 'Canva Pro', category: SubscriptionCategory.PRODUCTIVITY, logoUrl: 'https://assets.subatone.in/logos/canva.png', websiteUrl: 'https://canva.com', defaultAmount: 500, defaultCycle: BillingCycle.MONTHLY, isPopular: true, searchTerms: ['canva'] },
  { name: 'Zoom', category: SubscriptionCategory.PRODUCTIVITY, logoUrl: 'https://assets.subatone.in/logos/zoom.png', websiteUrl: 'https://zoom.us', defaultAmount: 830, defaultCycle: BillingCycle.MONTHLY, isPopular: false, searchTerms: ['zoom'] },
  // Health & Fitness
  { name: 'Cult.fit', category: SubscriptionCategory.HEALTH_FITNESS, logoUrl: 'https://assets.subatone.in/logos/cultfit.png', websiteUrl: 'https://cult.fit', defaultAmount: 2499, defaultCycle: BillingCycle.MONTHLY, isPopular: true, searchTerms: ['cult', 'cultfit', 'cure.fit'] },
  { name: 'HealthifyMe', category: SubscriptionCategory.HEALTH_FITNESS, logoUrl: 'https://assets.subatone.in/logos/healthifyme.png', websiteUrl: 'https://healthifyme.com', defaultAmount: 1499, defaultCycle: BillingCycle.MONTHLY, isPopular: false, searchTerms: ['healthifyme'] },
  { name: 'Headspace', category: SubscriptionCategory.HEALTH_FITNESS, logoUrl: 'https://assets.subatone.in/logos/headspace.png', websiteUrl: 'https://headspace.com', defaultAmount: 350, defaultCycle: BillingCycle.MONTHLY, isPopular: false, searchTerms: ['headspace', 'meditation'] },
  // Gaming
  { name: 'Xbox Game Pass', category: SubscriptionCategory.GAMING, logoUrl: 'https://assets.subatone.in/logos/xbox.png', websiteUrl: 'https://xbox.com/gamepass', defaultAmount: 499, defaultCycle: BillingCycle.MONTHLY, isPopular: false, searchTerms: ['xbox', 'game pass', 'xbox gamepass'] },
  { name: 'PlayStation Plus', category: SubscriptionCategory.GAMING, logoUrl: 'https://assets.subatone.in/logos/psplus.png', websiteUrl: 'https://playstation.com/ps-plus', defaultAmount: 499, defaultCycle: BillingCycle.MONTHLY, isPopular: false, searchTerms: ['psplus', 'playstation', 'ps plus'] },
  // News & Education
  { name: 'Coursera Plus', category: SubscriptionCategory.NEWS_EDUCATION, logoUrl: 'https://assets.subatone.in/logos/coursera.png', websiteUrl: 'https://coursera.org', defaultAmount: 3300, defaultCycle: BillingCycle.MONTHLY, isPopular: false, searchTerms: ['coursera'] },
  { name: 'Duolingo Plus', category: SubscriptionCategory.NEWS_EDUCATION, logoUrl: 'https://assets.subatone.in/logos/duolingo.png', websiteUrl: 'https://duolingo.com', defaultAmount: 583, defaultCycle: BillingCycle.MONTHLY, isPopular: false, searchTerms: ['duolingo', 'language'] },
]

async function main() {
  console.log('Seeding ServiceLibrary...')

  for (const service of services) {
    await prisma.serviceLibrary.upsert({
      where: { name: service.name },
      create: { ...service, country: 'IN' },
      update: { ...service },
    })
  }

  console.log(`Seeded ${services.length} services.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
