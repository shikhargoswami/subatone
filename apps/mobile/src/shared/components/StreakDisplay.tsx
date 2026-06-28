// apps/mobile/src/shared/components/StreakDisplay.tsx
import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '../constants/colors'

interface Props {
  months: number
}

export function StreakDisplay({ months }: Props) {
  return (
    <View style={styles.container} accessibilityLabel={`Streak: ${months} months`}>
      <Text style={styles.icon}>🔥</Text>
      <View>
        <Text style={styles.label}>Streak</Text>
        <Text style={styles.value}>{months} <Text style={styles.unit}>months</Text></Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
  },
  icon: { fontSize: 28 },
  label: { fontSize: 11, color: Colors.textMuted },
  value: { fontSize: 20, fontWeight: '700', color: Colors.text },
  unit: { fontSize: 12, fontWeight: '400', color: Colors.textMuted },
})
