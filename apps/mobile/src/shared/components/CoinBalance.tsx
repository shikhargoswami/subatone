// apps/mobile/src/shared/components/CoinBalance.tsx
import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '../constants/colors'

interface Props {
  balance: number
}

export function CoinBalance({ balance }: Props) {
  return (
    <View style={styles.container} accessibilityLabel={`Suba Coins balance: ${balance}`}>
      <Text style={styles.icon}>⬡</Text>
      <View>
        <Text style={styles.label}>Suba Coins</Text>
        <Text style={styles.value}>{balance.toLocaleString('en-IN')}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
  },
  icon: { fontSize: 28, color: Colors.secondary },
  label: { fontSize: 11, color: Colors.textMuted },
  value: { fontSize: 20, fontWeight: '700', color: Colors.secondary },
})
