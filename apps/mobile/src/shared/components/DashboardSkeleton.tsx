// apps/mobile/src/shared/components/DashboardSkeleton.tsx
// Skeleton loading state for the dashboard screen.

import { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { Colors } from '../constants/colors'

function SkeletonBox({ style }: { style: object }) {
  const opacity = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    ).start()
  }, [opacity])

  return <Animated.View style={[styles.box, style, { opacity }]} />
}

export function DashboardSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonBox style={{ height: 24, width: 120, marginBottom: 8 }} />
      <SkeletonBox style={{ height: 160, borderRadius: 20, marginBottom: 16 }} />
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        <SkeletonBox style={{ flex: 1, height: 80, borderRadius: 16 }} />
        <SkeletonBox style={{ flex: 1, height: 80, borderRadius: 16 }} />
      </View>
      <SkeletonBox style={{ height: 20, width: 160, marginBottom: 12 }} />
      {[1, 2, 3].map((i) => (
        <SkeletonBox key={i} style={{ height: 68, borderRadius: 14, marginBottom: 8 }} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20, paddingTop: 60 },
  box: { backgroundColor: Colors.surface, borderRadius: 8 },
})
