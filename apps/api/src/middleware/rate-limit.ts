// apps/api/src/middleware/rate-limit.ts
// In-memory sliding window rate limiter using Redis (Upstash).
// Falls back to in-process Map if Redis is unavailable (development).

import { createMiddleware } from 'hono/factory'
import { redis } from '../lib/redis.js'
import { pinoLogger } from '../lib/logger.js'

const WINDOW_MS = Number(process.env['RATE_LIMIT_WINDOW_MS'] ?? 60_000)
const MAX_REQUESTS = Number(process.env['RATE_LIMIT_MAX_REQUESTS'] ?? 100)
const AUTH_MAX = Number(process.env['RATE_LIMIT_AUTH_MAX'] ?? 10)

// In-process fallback for development / Redis outage
const fallbackStore = new Map<string, { count: number; resetAt: number }>()

async function checkRateLimit(
  key: string,
  max: number,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now()
  const windowKey = `rl:${key}:${Math.floor(now / WINDOW_MS)}`
  const resetAt = (Math.floor(now / WINDOW_MS) + 1) * WINDOW_MS

  try {
    const count = await redis.incr(windowKey)
    if (count === 1) {
      // Set TTL slightly beyond window to avoid key leak
      await redis.pexpire(windowKey, WINDOW_MS + 5000)
    }
    return { allowed: count <= max, remaining: Math.max(0, max - count), resetAt }
  } catch {
    // Fallback to in-memory
    const entry = fallbackStore.get(windowKey) ?? { count: 0, resetAt }
    entry.count++
    fallbackStore.set(windowKey, entry)
    // Cleanup old entries
    if (fallbackStore.size > 10_000) {
      for (const [k, v] of fallbackStore.entries()) {
        if (v.resetAt < now) fallbackStore.delete(k)
      }
    }
    return { allowed: entry.count <= max, remaining: Math.max(0, max - entry.count), resetAt }
  }
}

export const rateLimitMiddleware = createMiddleware(async (c, next) => {
  // Use IP address as the rate limit key. In production this should be
  // the forwarded IP from the load balancer (X-Forwarded-For).
  const ip =
    c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() ??
    c.req.header('CF-Connecting-IP') ??
    'unknown'

  // Tighter limit for auth endpoints (prevent brute-force / OTP enumeration)
  const isAuthRoute = c.req.path.startsWith('/api/v1/auth')
  const max = isAuthRoute ? AUTH_MAX : MAX_REQUESTS
  const key = isAuthRoute ? `auth:${ip}` : `global:${ip}`

  const { allowed, remaining, resetAt } = await checkRateLimit(key, max)

  c.res.headers.set('X-RateLimit-Limit', String(max))
  c.res.headers.set('X-RateLimit-Remaining', String(remaining))
  c.res.headers.set('X-RateLimit-Reset', String(Math.floor(resetAt / 1000)))

  if (!allowed) {
    pinoLogger.warn({ ip, path: c.req.path }, 'Rate limit exceeded')
    return c.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please slow down.',
        },
      },
      429,
    )
  }

  await next()
})
