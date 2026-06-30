// apps/api/src/app.ts
// Exports the Hono app instance so it can be imported by tests
// without starting the HTTP server.

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { errorHandler } from './middleware/error.js'
import { rateLimitMiddleware } from './middleware/rate-limit.js'
import { pinoLogger } from './lib/logger.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { subscriptionRoutes } from './modules/subscriptions/subscriptions.routes.js'
import { recurringPaymentRoutes } from './modules/recurring-payments/recurring-payments.routes.js'
import { remindersRoutes } from './modules/reminders/reminders.routes.js'
import { gamificationRoutes } from './modules/gamification/gamification.routes.js'
import { profileRoutes } from './modules/profile/profile.routes.js'
import { libraryRoutes } from './modules/library/library.routes.js'
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js'

export function createApp() {
  const app = new Hono()

  app.use('*', secureHeaders())

  app.use(
    '*',
    cors({
      origin: (origin) => {
        const allowed = [
          'http://localhost:3001',
          'http://localhost:8081',
          'https://subatone.in',
          'exp://',
        ]
        return allowed.some((o) => origin.startsWith(o)) ? origin : null
      },
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400,
    }),
  )

  // Request ID + structured logging
  app.use('*', async (c, next) => {
    const requestId = crypto.randomUUID()
    c.set('requestId' as never, requestId)
    c.res.headers.set('X-Request-ID', requestId)

    const start = Date.now()
    await next()
    const duration = Date.now() - start

    pinoLogger.info({
      requestId,
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      duration,
    })
  })

  app.use('*', rateLimitMiddleware)

  app.get('/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  const api = new Hono().basePath('/v1')

  api.route('/auth', authRoutes)
  api.route('/profile', profileRoutes)
  api.route('/subscriptions', subscriptionRoutes)
  api.route('/recurring-payments', recurringPaymentRoutes)
  api.route('/reminders', remindersRoutes)
  api.route('/gamification', gamificationRoutes)
  api.route('/library', libraryRoutes)
  api.route('/dashboard', dashboardRoutes)

  app.route('/api', api)

  app.notFound((c) => {
    return c.json(
      {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Route not found' },
      },
      404,
    )
  })

  app.onError(errorHandler)

  return app
}
