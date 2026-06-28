// apps/api/src/lib/push.ts
// Expo push notification sender using expo-server-sdk.

import { Expo, type ExpoPushMessage } from 'expo-server-sdk'
import { pinoLogger } from './logger.js'

const expo = new Expo({})

export interface PushPayload {
  to: string
  title: string
  body: string
  data?: Record<string, unknown>
  sound?: 'default' | null
  badge?: number
}

export async function sendPushNotification(payload: PushPayload): Promise<void> {
  if (!Expo.isExpoPushToken(payload.to)) {
    pinoLogger.warn({ token: payload.to }, 'Invalid Expo push token — skipping')
    return
  }

  const message: ExpoPushMessage = {
    to: payload.to,
    sound: payload.sound ?? 'default',
    title: payload.title,
    body: payload.body,
    data: payload.data ?? {},
  }

  try {
    const chunks = expo.chunkPushNotifications([message])
    for (const chunk of chunks) {
      const receipts = await expo.sendPushNotificationsAsync(chunk)
      for (const receipt of receipts) {
        if (receipt.status === 'error') {
          pinoLogger.error(
            { receipt },
            'Push notification delivery error',
          )
        }
      }
    }
  } catch (err) {
    pinoLogger.error({ err }, 'Failed to send push notification')
    // Do not rethrow — push failure should not break the calling operation
  }
}

export async function sendBulkPushNotifications(
  payloads: PushPayload[],
): Promise<void> {
  const valid = payloads.filter((p) => Expo.isExpoPushToken(p.to))

  if (valid.length === 0) return

  const messages: ExpoPushMessage[] = valid.map((p) => ({
    to: p.to,
    sound: p.sound ?? 'default',
    title: p.title,
    body: p.body,
    data: p.data ?? {},
  }))

  const chunks = expo.chunkPushNotifications(messages)
  for (const chunk of chunks) {
    await expo.sendPushNotificationsAsync(chunk)
  }
}
