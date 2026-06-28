// apps/mobile/src/shared/components/CategoryBreakdownRow.tsx
import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '../constants/colors'
import type { CategoryBreakdown } from '@subatone/types'

interface Props {
  item: CategoryBreakdown
}

const CATEGORY_COLORS: Record<string, string> = {
  OTT: Colors.ott, MUSIC: Colors.music, MOBILE: Colors.mobile,
  AI_TOOLS: Colors.aiTools, CLOUD_STORAGE: Colors.cloud,
  PRODUCTIVITY: Colors.productivity, FINANCE: Colors.finance,
  HEALTH: Colors.health, GAMING: Colors.gaming, OTHER: Colors.textMuted,
}

export function CategoryBreakdownRow({ item }: Props) {
  const color = CATEGORY_COLORS[item.category] ?? Colors.textMuted

  return (
    <View style={styles.row} accessibilityRole="none">
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.name}>{item.category.replace('_', ' ')}</Text>
      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${item.percentage}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.pct}>{item.percentage.toFixed(0)}%</Text>
      <Text style={styles.amount}>₹{item.totalMonthly.toLocaleString('en-IN')}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  name: { fontSize: 13, color: Colors.text, flex: 1 },
  bar: { width: 80, height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  pct: { fontSize: 12, color: Colors.textMuted, width: 32, textAlign: 'right' },
  amount: { fontSize: 13, color: Colors.text, fontWeight: '600', width: 64, textAlign: 'right' },
})
