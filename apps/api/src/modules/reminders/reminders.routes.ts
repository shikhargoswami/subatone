// apps/api/src/modules/reminders/reminders.routes.ts

import { Hono } from 'hono'
import { requireAuth } from '../../middleware/auth.js'

export const remindersRoutes = new Hono()

remindersRoutes.use('*', requireAuth)

// GET /reminders — list upcoming reminders for the user (read-only in MVP)
remindersRoutes.get('/', async (c) => {
  // Placeholder — reminders are managed automatically; this endpoint
  // exposes them for display in the app's notification settings screen.
  return c.json({ success: true, data: [] })
})
