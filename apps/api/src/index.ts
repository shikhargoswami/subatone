// apps/api/src/index.ts
// HTTP server entry point — imports the app and starts listening.

import { serve } from '@hono/node-server'
import { createApp } from './app.js'
import { pinoLogger } from './lib/logger.js'

const app = createApp()
const port = Number(process.env['API_PORT'] ?? 3000)

serve({ fetch: app.fetch, port }, () => {
  pinoLogger.info(`Subatone API running on port ${port}`)
})
