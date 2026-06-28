// apps/mobile/src/shared/components/UpcomingRenewalCard.tsx
import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '../constants/colors'
import type { UpcomingRenewal } from '@subatone/types'

interface Props {
  renewal: UpcomingRenewal
}

export function UpcomingRenewalCard({ renewal }: Props) {
  const urgency = renewal.daysUntilRenewal <= 1
    ? 'error'
    : renewal.daysUntilRenewal <= 3
    ? 'warning'
    : 'normal'

  const urgencyColor = {
    error: Colors.error,
    warning: Colors.warning,
    normal: Colors.textMuted,
  }[urgency]

  const daysLabel =
    renewal.daysUntilRenewal === 0
      ? 'Today'
      : renewal.daysUntilRenewal === 1
      ? 'Tomorrow'
      : `in ${renewal.daysUntilRenewal}d`

  return (
    <View style={styles.card} accessibilityRole="none">
      <View style={styles.left}>
        <Text style={styles.name}>{renewal.name}</Text>
        <Text style={[styles.days, { color: urgencyColor }]}>{daysLabel}</Text>
      </View>
      <Text style={styles.amount}>
        ₹{renewal.amount.toLocaleString('en-IN')}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  left: { gap: 2 },
  name: { fontSize: 15, fontWeight: '600', color: Colors.text },
  days: { fontSize: 12 },
  amount: { fontSize: 16, fontWeight: '700', color: Colors.text },
})
