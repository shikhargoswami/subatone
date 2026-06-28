// apps/mobile/src/shared/components/SubscriptionCard.tsx
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Colors } from '../constants/colors'
import type { Subscription } from '@subatone/types'

interface Props {
  subscription: Subscription
  onMarkPaid: () => void
  onDelete: () => void
}

export function SubscriptionCard({ subscription: sub, onMarkPaid, onDelete }: Props) {
  const renewalDate = new Date(sub.nextRenewalDate)
  const daysUntil = Math.ceil((renewalDate.getTime() - Date.now()) / 86_400_000)

  const urgencyColor =
    daysUntil <= 1 ? Colors.error : daysUntil <= 3 ? Colors.warning : Colors.textMuted

  const daysLabel =
    daysUntil < 0
      ? 'Overdue'
      : daysUntil === 0
      ? 'Today'
      : daysUntil === 1
      ? 'Tomorrow'
      : `${daysUntil}d`

  return (
    <View style={styles.card}>
      <View style={styles.body}>
        <View style={styles.left}>
          <Text style={styles.name}>{sub.name}</Text>
          <Text style={[styles.days, { color: urgencyColor }]}>{daysLabel}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.amount}>
            ₹{sub.amount.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.cycle}>{sub.billingCycle.toLowerCase()}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.paidBtn}
          onPress={onMarkPaid}
          accessibilityLabel={`Mark ${sub.name} as paid`}
        >
          <Text style={styles.paidText}>✓ Mark Paid</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={onDelete}
          accessibilityLabel={`Remove ${sub.name}`}
        >
          <Text style={styles.deleteText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface, borderRadius: 16,
    marginHorizontal: 20, marginBottom: 10, padding: 16,
  },
  body: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  left: { gap: 4 },
  right: { alignItems: 'flex-end', gap: 4 },
  name: { fontSize: 16, fontWeight: '600', color: Colors.text },
  days: { fontSize: 12 },
  amount: { fontSize: 18, fontWeight: '700', color: Colors.text },
  cycle: { fontSize: 11, color: Colors.textMuted },
  actions: { flexDirection: 'row', gap: 8 },
  paidBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 10,
    backgroundColor: Colors.primary, alignItems: 'center',
  },
  paidText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  deleteBtn: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  deleteText: { color: Colors.textMuted, fontSize: 13 },
})
