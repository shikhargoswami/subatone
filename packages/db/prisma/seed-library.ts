// packages/db/prisma/seed-library.ts
// Seeds the ServiceLibrary table with popular subscription services in India.
// Run: npm run db:seed:library (from root)

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const services = [
  // ── OTT ────────────────────────────────────────────────────────────────────
  { name: 'Netflix', category: 'OTT', defaultAmount: 649, defaultCycle: 'MONTHLY', isPopular: true, websiteUrl: 'https://netflix.com', searchTerms: ['netflix', 'ott', 'streaming', 'movies'] },
  { name: 'Amazon Prime Video', category: 'OTT', defaultAmount: 299, defaultCycle: 'MONTHLY', isPopular: true, websiteUrl: 'https://primevideo.com', searchTerms: ['prime', 'amazon', 'primevideo', 'ott'] },
  { name: 'Disney+ Hotstar', category: 'OTT', defaultAmount: 299, defaultCycle: 'MONTHLY', isPopular: true, websiteUrl: 'https://hotstar.com', searchTerms: ['hotstar', 'disney', 'ipl', 'ott'] },
  { name: 'JioCinema', category: 'OTT', defaultAmount: 29, defaultCycle: 'MONTHLY', isPopular: true, websiteUrl: 'https://jiocinema.com', searchTerms: ['jio', 'cinema', 'jiocinema', 'ott'] },
  { name: 'Sony LIV', category: 'OTT', defaultAmount: 299, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://sonyliv.com', searchTerms: ['sony', 'liv', 'sonyliv', 'ott'] },
  { name: 'ZEE5', category: 'OTT', defaultAmount: 99, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://zee5.com', searchTerms: ['zee5', 'zee', 'ott'] },
  { name: 'MX Player', category: 'OTT', defaultAmount: 99, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://mxplayer.in', searchTerms: ['mx', 'mxplayer', 'ott'] },
  { name: 'Apple TV+', category: 'OTT', defaultAmount: 99, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://tv.apple.com', searchTerms: ['apple', 'apptv', 'appletv', 'ott'] },
  { name: 'YouTube Premium', category: 'OTT', defaultAmount: 189, defaultCycle: 'MONTHLY', isPopular: true, websiteUrl: 'https://youtube.com/premium', searchTerms: ['youtube', 'yt', 'google', 'premium'] },

  // ── MUSIC ──────────────────────────────────────────────────────────────────
  { name: 'Spotify', category: 'MUSIC', defaultAmount: 119, defaultCycle: 'MONTHLY', isPopular: true, websiteUrl: 'https://spotify.com', searchTerms: ['spotify', 'music', 'podcast'] },
  { name: 'Apple Music', category: 'MUSIC', defaultAmount: 99, defaultCycle: 'MONTHLY', isPopular: true, websiteUrl: 'https://music.apple.com', searchTerms: ['apple', 'music', 'itunes'] },
  { name: 'JioSaavn', category: 'MUSIC', defaultAmount: 99, defaultCycle: 'MONTHLY', isPopular: true, websiteUrl: 'https://jiosaavn.com', searchTerms: ['saavn', 'jio', 'jiosaavn', 'music'] },
  { name: 'Gaana', category: 'MUSIC', defaultAmount: 99, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://gaana.com', searchTerms: ['gaana', 'music', 'hindi'] },
  { name: 'YouTube Music', category: 'MUSIC', defaultAmount: 99, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://music.youtube.com', searchTerms: ['youtube', 'ytmusic', 'google', 'music'] },

  // ── AI_TOOLS ───────────────────────────────────────────────────────────────
  { name: 'ChatGPT Plus', category: 'AI_TOOLS', defaultAmount: 1675, defaultCycle: 'MONTHLY', isPopular: true, websiteUrl: 'https://chat.openai.com', searchTerms: ['chatgpt', 'openai', 'gpt', 'ai'] },
  { name: 'Claude Pro', category: 'AI_TOOLS', defaultAmount: 1675, defaultCycle: 'MONTHLY', isPopular: true, websiteUrl: 'https://claude.ai', searchTerms: ['claude', 'anthropic', 'ai'] },
  { name: 'Gemini Advanced', category: 'AI_TOOLS', defaultAmount: 1950, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://gemini.google.com', searchTerms: ['gemini', 'google', 'ai', 'bard'] },
  { name: 'Perplexity Pro', category: 'AI_TOOLS', defaultAmount: 1675, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://perplexity.ai', searchTerms: ['perplexity', 'ai', 'search'] },
  { name: 'GitHub Copilot', category: 'AI_TOOLS', defaultAmount: 920, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://github.com/features/copilot', searchTerms: ['github', 'copilot', 'ai', 'coding'] },
  { name: 'Midjourney', category: 'AI_TOOLS', defaultAmount: 840, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://midjourney.com', searchTerms: ['midjourney', 'ai', 'image', 'art'] },

  // ── CLOUD_STORAGE ──────────────────────────────────────────────────────────
  { name: 'iCloud+', category: 'CLOUD_STORAGE', defaultAmount: 75, defaultCycle: 'MONTHLY', isPopular: true, websiteUrl: 'https://icloud.com', searchTerms: ['icloud', 'apple', 'storage', 'cloud'] },
  { name: 'Google One', category: 'CLOUD_STORAGE', defaultAmount: 130, defaultCycle: 'MONTHLY', isPopular: true, websiteUrl: 'https://one.google.com', searchTerms: ['google', 'googleone', 'drive', 'storage', 'cloud'] },
  { name: 'Dropbox', category: 'CLOUD_STORAGE', defaultAmount: 834, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://dropbox.com', searchTerms: ['dropbox', 'cloud', 'storage'] },
  { name: 'OneDrive', category: 'CLOUD_STORAGE', defaultAmount: 172, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://onedrive.com', searchTerms: ['onedrive', 'microsoft', 'storage', 'cloud'] },

  // ── PRODUCTIVITY ───────────────────────────────────────────────────────────
  { name: 'Notion', category: 'PRODUCTIVITY', defaultAmount: 1300, defaultCycle: 'MONTHLY', isPopular: true, websiteUrl: 'https://notion.so', searchTerms: ['notion', 'notes', 'workspace', 'productivity'] },
  { name: 'Microsoft 365', category: 'PRODUCTIVITY', defaultAmount: 420, defaultCycle: 'MONTHLY', isPopular: true, websiteUrl: 'https://microsoft365.com', searchTerms: ['microsoft', 'office', 'word', 'excel', 'outlook'] },
  { name: 'Adobe Creative Cloud', category: 'PRODUCTIVITY', defaultAmount: 4230, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://adobe.com', searchTerms: ['adobe', 'photoshop', 'illustrator', 'creative'] },
  { name: 'Figma', category: 'PRODUCTIVITY', defaultAmount: 1260, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://figma.com', searchTerms: ['figma', 'design', 'ux', 'productivity'] },
  { name: 'Canva Pro', category: 'PRODUCTIVITY', defaultAmount: 499, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://canva.com', searchTerms: ['canva', 'design', 'graphics', 'productivity'] },
  { name: 'Slack', category: 'PRODUCTIVITY', defaultAmount: 586, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://slack.com', searchTerms: ['slack', 'messaging', 'work', 'productivity'] },
  { name: 'Zoom', category: 'PRODUCTIVITY', defaultAmount: 1300, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://zoom.us', searchTerms: ['zoom', 'meetings', 'video', 'productivity'] },

  // ── MOBILE ─────────────────────────────────────────────────────────────────
  { name: 'Jio Prepaid', category: 'MOBILE', defaultAmount: 299, defaultCycle: 'MONTHLY', isPopular: true, websiteUrl: 'https://jio.com', searchTerms: ['jio', 'mobile', 'recharge', 'prepaid', 'sim'] },
  { name: 'Airtel Prepaid', category: 'MOBILE', defaultAmount: 299, defaultCycle: 'MONTHLY', isPopular: true, websiteUrl: 'https://airtel.in', searchTerms: ['airtel', 'mobile', 'recharge', 'prepaid', 'sim'] },
  { name: 'Vi (Vodafone Idea)', category: 'MOBILE', defaultAmount: 299, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://myvi.in', searchTerms: ['vi', 'vodafone', 'idea', 'mobile', 'recharge', 'sim'] },
  { name: 'BSNL', category: 'MOBILE', defaultAmount: 197, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://bsnl.in', searchTerms: ['bsnl', 'mobile', 'recharge', 'sim'] },

  // ── GAMING ─────────────────────────────────────────────────────────────────
  { name: 'PlayStation Plus', category: 'GAMING', defaultAmount: 499, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://playstation.com', searchTerms: ['playstation', 'ps', 'psplus', 'gaming'] },
  { name: 'Xbox Game Pass', category: 'GAMING', defaultAmount: 499, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://xbox.com', searchTerms: ['xbox', 'gamepass', 'microsoft', 'gaming'] },
  { name: 'Apple Arcade', category: 'GAMING', defaultAmount: 99, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://apple.com/arcade', searchTerms: ['apple', 'arcade', 'gaming', 'ios'] },

  // ── FINANCE ────────────────────────────────────────────────────────────────
  { name: 'Zerodha Kite', category: 'FINANCE', defaultAmount: 0, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://zerodha.com', searchTerms: ['zerodha', 'stocks', 'trading', 'finance'] },
  { name: 'Groww', category: 'FINANCE', defaultAmount: 0, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://groww.in', searchTerms: ['groww', 'investing', 'mutual', 'finance'] },
  { name: 'CRED', category: 'FINANCE', defaultAmount: 0, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://cred.club', searchTerms: ['cred', 'credit', 'card', 'finance'] },

  // ── HEALTH ─────────────────────────────────────────────────────────────────
  { name: 'Cult.fit', category: 'HEALTH_FITNESS', defaultAmount: 899, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://cult.fit', searchTerms: ['cult', 'fitness', 'gym', 'workout', 'health'] },
  { name: 'HealthifyMe', category: 'HEALTH_FITNESS', defaultAmount: 999, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://healthifyme.com', searchTerms: ['healthify', 'diet', 'nutrition', 'health'] },

  // ── OTHER ──────────────────────────────────────────────────────────────────
  { name: 'LinkedIn Premium', category: 'OTHER', defaultAmount: 2600, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://linkedin.com', searchTerms: ['linkedin', 'professional', 'jobs', 'networking'] },
  { name: 'Swiggy One', category: 'OTHER', defaultAmount: 399, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://swiggy.com', searchTerms: ['swiggy', 'food', 'delivery', 'one'] },
  { name: 'Zomato Gold', category: 'OTHER', defaultAmount: 299, defaultCycle: 'MONTHLY', isPopular: false, websiteUrl: 'https://zomato.com', searchTerms: ['zomato', 'food', 'delivery', 'gold'] },
  { name: 'Amazon Prime', category: 'OTHER', defaultAmount: 299, defaultCycle: 'MONTHLY', isPopular: true, websiteUrl: 'https://amazon.in/prime', searchTerms: ['amazon', 'prime', 'shipping', 'delivery'] },
] as const

async function main() {
  console.log('🌐 Seeding service library...')

  const result = await prisma.serviceLibrary.createMany({
    data: services.map((svc) => ({
      name: svc.name,
      category: svc.category as any,
      defaultAmount: svc.defaultAmount || null,
      defaultCycle: svc.defaultCycle as any,
      websiteUrl: svc.websiteUrl,
      isPopular: svc.isPopular,
      searchTerms: svc.searchTerms as unknown as string[],
      country: 'IN',
    })),
  })

  console.log(`✅ ${result.count} services seeded.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
