// apps/mobile/app/(tabs)/index.tsx
// Dashboard screen — the "revelation moment" screen.

import { ScrollView, View, Text, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native'
import { useDashboard } from '../../src/modules/dashboard/useDashboard'
import { DashboardSkeleton } from '../../src/shared/components/DashboardSkeleton'
import { UpcomingRenewalCard } from '../../src/shared/components/UpcomingRenewalCard'
import { CategoryBreakdownRow } from '../../src/shared/components/CategoryBreakdownRow'
import { CoinBalance } from '../../src/shared/components/CoinBalance'
import { StreakDisplay } from '../../src/shared/components/StreakDisplay'
import { EmptyState } from '../../src/shared/components/EmptyState'
import { Colors } from '../../src/shared/constants/colors'
import { useRouter } from 'expo-router'

export default function DashboardScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useDashboard()
  const router = useRouter()

  if (isLoading) return <DashboardSkeleton />

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Could not load dashboard.</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const hasSubscriptions = (data?.activeSubscriptionCount ?? 0) > 0

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning</Text>
        <Text style={styles.appName}>subatone</Text>
      </View>

      {/* The Revelation Number */}
      <View style={styles.burnCard}>
        <Text style={styles.burnLabel}>Monthly burn</Text>
        <Text style={styles.burnAmount} accessibilityLabel={`Monthly burn: ${data?.currency ?? 'INR'} ${data?.totalMonthlyBurn ?? 0}`}>
          ₹{(data?.totalMonthlyBurn ?? 0).toLocaleString('en-IN')}
        </Text>
        <Text style={styles.burnSub}>
          ₹{(data?.totalAnnualBurn ?? 0).toLocaleString('en-IN')} per year ·{' '}
          {data?.activeSubscriptionCount ?? 0} subscriptions
        </Text>
      </View>

      {/* Gamification row */}
      <View style={styles.gamificationRow}>
        <CoinBalance balance={data?.coinBalance ?? 0} />
        <StreakDisplay months={data?.streakMonths ?? 0} />
      </View>

      {/* Upcoming renewals */}
      <Text style={styles.sectionTitle}>Upcoming renewals</Text>
      {hasSubscriptions ? (
        data?.upcomingRenewals.length === 0 ? (
          <Text style={styles.emptySection}>No renewals in the next 30 days.</Text>
        ) : (
          data?.upcomingRenewals.slice(0, 5).map((renewal) => (
            <UpcomingRenewalCard key={renewal.id} renewal={renewal} />
          ))
        )
      ) : (
        <EmptyState
          title="No subscriptions yet"
          subtitle="Add your first subscription to see upcoming renewals."
          action={{ label: 'Add subscription', onPress: () => router.push('/(tabs)/subscriptions') }}
        />
      )}

      {/* Category breakdown */}
      {hasSubscriptions && (data?.categoryBreakdown.length ?? 0) > 0 && (
        <>
          <Text style={styles.sectionTitle}>Spend by category</Text>
          {data?.categoryBreakdown.map((cat) => (
            <CategoryBreakdownRow key={cat.category} item={cat} />
          ))}
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 32, gap: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  greeting: { fontSize: 14, color: Colors.textMuted },
  appName: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  burnCard: {
    backgroundColor: Colors.primary, borderRadius: 20,
    padding: 24, gap: 4,
  },
  burnLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  burnAmount: { fontSize: 48, fontWeight: '800', color: '#fff', letterSpacing: -2 },
  burnSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  gamificationRow: { flexDirection: 'row', gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginTop: 8 },
  emptySection: { color: Colors.textMuted, fontSize: 14 },
  errorText: { color: Colors.error, fontSize: 15 },
  retryBtn: { marginTop: 12, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: Colors.primary, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: '600' },
})
