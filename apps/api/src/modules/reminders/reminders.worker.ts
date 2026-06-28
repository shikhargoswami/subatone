// apps/api/src/modules/reminders/reminders.worker.ts
// BullMQ worker — processes reminder jobs from the queue.
// Run as a separate process in production: `node dist/modules/reminders/reminders.worker.js`

import { Worker } from 'bullmq'
import { redis } from '../../lib/redis.js'
import { ReminderService } from './reminders.service.js'
import { pinoLogger } from '../../lib/logger.js'
import type { ReminderJobData } from '../../lib/queue.js'

const reminderService = new ReminderService()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const connection = redis as any

const worker = new Worker<ReminderJobData>(
  'reminders',
  async (job) => {
    pinoLogger.info({ jobId: job.id, reminderId: job.data.reminderId }, 'Processing reminder job')
    await reminderService.sendReminder(job.data)
  },
  {
    connection,
    concurrency: 10,
  },
)

worker.on('completed', (job) => {
  pinoLogger.info({ jobId: job.id }, 'Reminder job completed')
})

worker.on('failed', (job, err) => {
  pinoLogger.error({ jobId: job?.id, err }, 'Reminder job failed')
})

pinoLogger.info('Reminder worker started')

export { worker }
