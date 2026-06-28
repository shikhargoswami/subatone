// apps/mobile/src/modules/reminders/useNotifications.ts
// Handles incoming push notifications while app is foregrounded.
// Sets up notification tap handler for deep linking.

import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'
import { useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'

export function useNotifications() {
  const router = useRouter()
  const qc = useQueryClient()

  useEffect(() => {
    // Handle taps on notifications
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, string>

      if (data['type'] === 'RENEWAL_REMINDER' && data['subscriptionId']) {
        router.push('/(tabs)/subscriptions')
        qc.invalidateQueries({ queryKey: ['subscriptions'] })
      }
    })

    return () => sub.remove()
  }, [router, qc])
}
