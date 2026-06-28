// apps/api/src/middleware/auth.ts
// Verifies Clerk JWT on every protected route.
// Attaches userId and clerkId to Hono context.

import { createMiddleware } from 'hono/factory'
import { createClerkClient } from '@clerk/backend'
import { pinoLogger } from '../lib/logger.js'
import { prisma } from '@subatone/db'

const clerk = createClerkClient({
  secretKey: process.env['CLERK_SECRET_KEY']!,
})

// Extend Hono context variables
declare module 'hono' {
  interface ContextVariableMap {
    userId: string       // Subatone DB user id
    clerkId: string      // Clerk user id
    requestId: string
  }
}

export const requireAuth = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Missing authorization token' } },
      401,
    )
  }

  const token = authHeader.slice(7)

  let clerkUserId: string

  try {
    const payload = await (clerk as any).verifyToken(token)
    clerkUserId = payload.sub
  } catch (err) {
    pinoLogger.warn({ err, requestId: c.get('requestId') }, 'Invalid token')
    return c.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } },
      401,
    )
  }

  // Look up the Subatone user by clerkId.
  // We use findUnique for O(1) indexed lookup.
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true, clerkId: true, deletedAt: true },
  })

  if (!user || user.deletedAt !== null) {
    return c.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not found or deactivated' },
      },
      401,
    )
  }

  // Attach to context for downstream handlers
  c.set('userId', user.id)
  c.set('clerkId', user.clerkId)

  await next()
})
