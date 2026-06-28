// apps/api/src/lib/logger.ts
import pino from 'pino'

export const pinoLogger = pino({
  level: process.env['LOG_LEVEL'] ?? 'info',
  ...(process.env['NODE_ENV'] !== 'production'
    ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
    : {}),
  redact: {
    paths: ['req.headers.authorization', '*.password', '*.upiId', '*.accountNumber'],
    censor: '[REDACTED]',
  },
})
