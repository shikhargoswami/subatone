// apps/api/src/modules/gamification/gamification.routes.ts

import { Hono } from 'hono'
import { requireAuth } from '../../middleware/auth.js'
import { GamificationService } from './gamification.service.js'

export const gamificationRoutes = new Hono()
const service = new GamificationService()

gamificationRoutes.use('*', requireAuth)

// GET /gamification — returns full gamification state for the current user
gamificationRoutes.get('/', async (c) => {
  const userId = c.get('userId')
  const state = await service.getState(userId)
  return c.json({ success: true, data: state })
})
