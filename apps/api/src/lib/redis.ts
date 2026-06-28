// apps/api/src/lib/redis.ts
// Redis client using ioredis, pointed at Upstash in production.
// Upstash uses TLS — the rediss:// protocol enables it automatically.

import { Redis } from 'ioredis'
import { pinoLogger } from './logger.js'

const redisUrl = process.env['REDIS_URL']

let redisInstance: InstanceType<typeof Redis>

if (redisUrl) {
  redisInstance = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
  })

  redisInstance.on('error', (err: Error) => {
    pinoLogger.error({ err }, 'Redis connection error')
  })

  redisInstance.on('connect', () => {
    pinoLogger.info('Redis connected')
  })
} else {
  // Development fallback: use Redis on default localhost
  redisInstance = new Redis({
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    lazyConnect: true,
  })

  redisInstance.on('error', () => {
    // Silently swallow in dev — rate limiter falls back to in-memory
  })
}

export const redis = redisInstance
