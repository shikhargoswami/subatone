// apps/mobile/src/modules/auth/useAuthSync.ts
// Syncs local Clerk auth state with the Subatone backend.
// Called once after every successful sign-in.

import { useApiClient } from '../../shared/api/client'
import type { UserProfile } from '@subatone/types'
import * as Notifications from 'expo-notifications'
import { useAuthStore } from './auth.store'

export function useAuthSync() {
  const api = useApiClient()
  const setUser = useAuthStore((s) => s.setUser)

  const syncUser = async (): Promise<{ isNewUser: boolean }> => {
    // Request push notification permissions and get token
    let expoPushToken: string | undefined
    try {
      const { status } = await Notifications.requestPermissionsAsync()
      if (status === 'granted') {
        const tokenData = await Notifications.getExpoPushTokenAsync()
        expoPushToken = tokenData.data
      }
    } catch {
      // Push token is optional — do not block auth if it fails
    }

    const user = await api.post<UserProfile>('/auth/sync', { expoPushToken })
    setUser(user)
    return { isNewUser: false }
  }

  return { syncUser }
}
