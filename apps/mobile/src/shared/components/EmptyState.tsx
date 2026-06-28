// apps/mobile/src/shared/components/EmptyState.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Colors } from '../constants/colors'

interface Props {
  title: string
  subtitle: string
  action?: { label: string; onPress: () => void }
}

export function EmptyState({ title, subtitle, action }: Props) {
  return (
    <View style={styles.container} accessibilityRole="none">
      <Text style={styles.icon}>📭</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {action && (
        <TouchableOpacity style={styles.btn} onPress={action.onPress} accessibilityRole="button">
          <Text style={styles.btnText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  icon: { fontSize: 48 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  subtitle: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', maxWidth: 260 },
  btn: {
    marginTop: 8, backgroundColor: Colors.primary,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12,
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
})
