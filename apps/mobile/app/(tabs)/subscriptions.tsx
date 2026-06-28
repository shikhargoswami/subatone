// apps/mobile/app/(tabs)/subscriptions.tsx
// Subscriptions list with FAB to add new subscription.

import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useState } from 'react'
import { useSubscriptions, useDeleteSubscription, useMarkSubscriptionPaid } from '../../src/modules/subscriptions/useSubscriptions'
import { AddSubscriptionSheet } from '../../src/modules/subscriptions/AddSubscriptionSheet'
import { SubscriptionCard } from '../../src/shared/components/SubscriptionCard'
import { EmptyState } from '../../src/shared/components/EmptyState'
import { Colors } from '../../src/shared/constants/colors'
import type { Subscription } from '@subatone/types'

export default function SubscriptionsScreen() {
  const { data, isLoading, isError, refetch } = useSubscriptions()
  const { mutate: deleteSub } = useDeleteSubscription()
  const { mutate: markPaid } = useMarkSubscriptionPaid()
  const [showAddSheet, setShowAddSheet] = useState(false)

  const items = data?.items ?? []

  const handleDelete = (sub: Subscription) => {
    Alert.alert(
      `Remove ${sub.name}?`,
      'This will cancel all reminders for this subscription.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => deleteSub(sub.id) },
      ],
    )
  }

  const handleMarkPaid = (sub: Subscription) => {
    markPaid(sub.id)
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Could not load subscriptions.</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Subscriptions</Text>
        <Text style={styles.count}>{items.length} active</Text>
      </View>

      {items.length === 0 ? (
        <EmptyState
          title="No subscriptions yet"
          subtitle="Add Netflix, Spotify, or any subscription you pay for."
          action={{ label: 'Add your first', onPress: () => setShowAddSheet(true) }}
        />
      ) : (
        <FlashList
          data={items}
          estimatedItemSize={90}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SubscriptionCard
              subscription={item}
              onMarkPaid={() => handleMarkPaid(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddSheet(true)}
        accessibilityLabel="Add subscription"
        accessibilityRole="button"
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <AddSubscriptionSheet
        visible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
  },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text },
  count: { fontSize: 14, color: Colors.textMuted },
  loadingText: { color: Colors.textMuted },
  errorText: { color: Colors.error, fontSize: 15 },
  retryBtn: { marginTop: 12, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: Colors.primary, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: '600' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: { fontSize: 28, color: '#fff', lineHeight: 32 },
})
