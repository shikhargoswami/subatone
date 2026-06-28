// apps/api/src/middleware/error.ts
// Central error handler. Sanitizes production errors, logs full details.

import type { ErrorHandler } from 'hono'
import { pinoLogger } from '../lib/logger.js'

export const errorHandler: ErrorHandler = (err, c) => {
  const requestId = c.get('requestId') ?? 'unknown'

  pinoLogger.error(
    { err, requestId, path: c.req.path, method: c.req.method },
    'Unhandled error',
  )

  const isProd = process.env['NODE_ENV'] === 'production'

  // Never expose internal error details in production
  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: isProd
          ? 'An unexpected error occurred. Our team has been notified.'
          : err.message,
        ...(isProd ? {} : { stack: err.stack }),
      },
    },
    500,
  )
}
