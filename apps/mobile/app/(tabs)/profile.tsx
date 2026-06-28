// apps/mobile/app/(tabs)/profile.tsx
// Profile screen — user tier, streak, coin ledger, account settings.

import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { useAuthStore } from '../../src/modules/auth/auth.store'
import { useClerk } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { Colors } from '../../src/shared/constants/colors'

const TIER_CONFIG: Record<string, { label: string; color: string; next?: string; nextAt?: number }> = {
  ROOKIE:   { label: 'Rookie',   color: '#9CA3AF', next: 'Regular',  nextAt: 501 },
  REGULAR:  { label: 'Regular',  color: '#60A5FA', next: 'Prime',    nextAt: 2001 },
  PRIME:    { label: 'Prime',    color: Colors.primary, next: 'Elite', nextAt: 10001 },
  ELITE:    { label: 'Elite',    color: Colors.secondary, next: 'Obsidian', nextAt: 50001 },
  OBSIDIAN: { label: 'Obsidian', color: '#6D28D9' },
}

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user)
  const clearUser = useAuthStore((s) => s.clearUser)
  const { signOut } = useClerk()
  const router = useRouter()

  const tier = TIER_CONFIG[user?.tier ?? 'ROOKIE'] ?? TIER_CONFIG['ROOKIE']!
  const progressToNext =
    tier.nextAt && user
      ? Math.min((user.coinLifetime / tier.nextAt) * 100, 100)
      : 100

  const handleSignOut = async () => {
    Alert.alert('Sign out?', 'You will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut()
          clearUser()
          router.replace('/(auth)/sign-in')
        },
      },
    ])
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Profile</Text>

      {/* Tier Card */}
      <View style={[styles.tierCard, { borderColor: tier.color }]}>
        <Text style={[styles.tierBadge, { color: tier.color }]}>{tier.label}</Text>
        {user && (
          <>
            <Text style={styles.coins}>
              ⬡ {user.coinLifetime.toLocaleString('en-IN')} lifetime coins
            </Text>
            {tier.next && tier.nextAt && (
              <>
                <View style={styles.progressTrack}>
                  <View
                    style={[styles.progressFill, { width: `${progressToNext}%`, backgroundColor: tier.color }]}
                  />
                </View>
                <Text style={styles.nextTier}>
                  {tier.nextAt - user.coinLifetime} coins to {tier.next}
                </Text>
              </>
            )}
          </>
        )}
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatItem label="Balance" value={`${(user?.coinBalance ?? 0).toLocaleString('en-IN')} ⬡`} />
        <StatItem label="Streak" value={`${user?.streakMonths ?? 0} mo 🔥`} />
        <StatItem label="Streak Days" value={`${user?.streakDays ?? 0}d`} />
      </View>

      {/* Account section */}
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.card}>
        <SettingsRow label="Phone" value={user?.phone ?? '—'} />
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Subatone v0.1.0 · Made in India 🇮🇳</Text>
    </ScrollView>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  )
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.settingsRow}>
      <Text style={styles.settingsLabel}>{label}</Text>
      <Text style={styles.settingsValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 48, gap: 16 },
  pageTitle: { fontSize: 28, fontWeight: '800', color: Colors.text },
  tierCard: {
    borderRadius: 20, padding: 20, borderWidth: 2,
    backgroundColor: Colors.surface, gap: 8,
  },
  tierBadge: { fontSize: 22, fontWeight: '800' },
  coins: { fontSize: 13, color: Colors.textMuted },
  progressTrack: {
    height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  nextTier: { fontSize: 12, color: Colors.textMuted },
  statsRow: {
    flexDirection: 'row', gap: 10,
  },
  statItem: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 4,
  },
  statLabel: { fontSize: 11, color: Colors.textMuted },
  statValue: { fontSize: 16, fontWeight: '700', color: Colors.text },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  card: { backgroundColor: Colors.surface, borderRadius: 16, overflow: 'hidden' },
  settingsRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  settingsLabel: { fontSize: 15, color: Colors.text },
  settingsValue: { fontSize: 14, color: Colors.textMuted },
  signOutBtn: {
    paddingVertical: 14, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.error, alignItems: 'center',
  },
  signOutText: { color: Colors.error, fontWeight: '600', fontSize: 15 },
  version: { textAlign: 'center', color: Colors.textMuted, fontSize: 11 },
})
