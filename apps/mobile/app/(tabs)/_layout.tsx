// apps/mobile/app/(tabs)/_layout.tsx
// Tab navigator — main app screens after authentication.

import { useEffect } from 'react'
import { Tabs } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { Redirect } from 'expo-router'
import { Colors } from '../../src/shared/constants/colors'
import { useAuthSync } from '../../src/modules/auth/useAuthSync'

export default function TabsLayout() {
  const { isSignedIn } = useAuth()
  const { syncUser } = useAuthSync()

  // Ensure DB user record exists whenever the app opens with a cached session.
  // auth/sync is idempotent — safe to call on every app launch.
  useEffect(() => {
    if (isSignedIn) {
      syncUser().catch(() => {
        // Non-fatal — dashboard will show its own retry UI
      })
    }
  }, [isSignedIn])

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          paddingBottom: 4,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: 'Subscriptions',
          tabBarIcon: ({ color }) => <TabIcon name="list" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  )
}

// Minimal tab icon using text symbols (replace with proper icon library in production)
function TabIcon({ name, color }: { name: string; color: string }) {
  const icons: Record<string, string> = { home: '⌂', list: '≡', user: '○' }
  const { Text } = require('react-native')
  return <Text style={{ color, fontSize: 20 }}>{icons[name] ?? '●'}</Text>
}
