// apps/api/src/modules/library/library.routes.ts
// Service library — pre-loaded catalog of popular services for fast subscription add.

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../../middleware/auth.js'
import { prisma } from '@subatone/db'
import { LibrarySearchSchema } from '@subatone/validators'

export const libraryRoutes = new Hono()

libraryRoutes.use('*', requireAuth)

// GET /library?query=netflix&category=OTT&popular=true
libraryRoutes.get(
  '/',
  zValidator('query', LibrarySearchSchema),
  async (c) => {
    const { query, category, popular } = c.req.valid('query')

    const services = await prisma.serviceLibrary.findMany({
      where: {
        ...(category && { category }),
        ...(popular !== undefined && { isPopular: popular }),
        ...(query && {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { searchTerms: { has: query.toLowerCase() } },
          ],
        }),
      },
      orderBy: [{ isPopular: 'desc' }, { name: 'asc' }],
      take: 50,
      select: {
        id: true, name: true, category: true, logoUrl: true,
        websiteUrl: true, defaultAmount: true, defaultCycle: true, isPopular: true,
      },
    })

    return c.json({ success: true, data: services })
  },
)
