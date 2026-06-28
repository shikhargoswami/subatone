// apps/mobile/app/(auth)/onboarding.tsx
// 4-step onboarding — the revelation moment journey.
//
// FUNCTIONAL SPEC
// ───────────────
// Step 1: Welcome — show the value proposition, 100 coins signup bonus
// Step 2: Add first subscription — inline mini-version of AddSubscriptionSheet
//   (user sees the "revelation moment" when they add their first sub)
// Step 3: Add rent/utilities (skippable) — the 3x coins hook
// Step 4: Dashboard reveal — "This is your monthly burn" — transition to tabs
//
// BEHAVIOUR CHANGE
// ────────────────
// Before: user has no idea what they're spending
// After: within 2 minutes, they see their total monthly subscription burn
//   and have earned their first coins — gamification loop starts

import { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, TextInput, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { useApiClient } from '../../src/shared/api/client'
import { useCreateSubscription } from '../../src/modules/subscriptions/useSubscriptions'
import { Colors } from '../../src/shared/constants/colors'
import type { ServiceLibraryItem } from '@subatone/types'

type Step = 0 | 1 | 2 | 3

const TOTAL_STEPS = 4

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState<ServiceLibraryItem | null>(null)
  const [amount, setAmount] = useState('')
  const [firstSubAdded, setFirstSubAdded] = useState(false)

  const api = useApiClient()
  const router = useRouter()
  const { mutate: create, isPending } = useCreateSubscription()

  const { data: libraryResults, isLoading: isSearching } = useQuery<ServiceLibraryItem[]>({
    queryKey: ['library', searchQuery],
    queryFn: () => api.get<ServiceLibraryItem[]>(`/library/search?q=${encodeURIComponent(searchQuery)}`),
    enabled: searchQuery.length >= 2,
  })

  const handleAddFirstSub = () => {
    if (!selectedService || !amount) return
    create(
      {
        name: selectedService.name,
        amount: Number(amount),
        billingCycle: (selectedService.defaultBillingCycle ?? 'MONTHLY') as any,
        category: selectedService.category as any,
        serviceLibraryId: selectedService.id,
        nextRenewalDate: new Date(Date.now() + 30 * 86_400_000).toISOString().split('T')[0]!,
      },
      {
        onSuccess: () => {
          setFirstSubAdded(true)
          setStep(2)
        },
      },
    )
  }

  const goToDashboard = () => {
    router.replace('/(tabs)')
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress dots */}
      <View style={styles.progressRow}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
        ))}
      </View>

      {/* Step 0: Welcome */}
      {step === 0 && (
        <View style={styles.slide}>
          <Text style={styles.bigEmoji}>⬡</Text>
          <Text style={styles.heading}>Welcome to Subatone</Text>
          <Text style={styles.body}>
            Track every subscription in one place. Pay on time. Earn Suba Coins with every payment.
          </Text>
          <View style={styles.bonusChip}>
            <Text style={styles.bonusText}>🎁 You've earned 100 Suba Coins just for signing up!</Text>
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(1)}>
            <Text style={styles.primaryBtnText}>Let's see what I'm spending →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Step 1: Add first subscription */}
      {step === 1 && (
        <View style={styles.slide}>
          <Text style={styles.heading}>Add your first subscription</Text>
          <Text style={styles.subheading}>Search for a service you already pay for.</Text>

          {!selectedService ? (
            <>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Netflix, Spotify, Jio..."
                placeholderTextColor={Colors.textMuted}
                autoFocus
                accessibilityLabel="Search subscription service"
              />
              {isSearching && <ActivityIndicator color={Colors.primary} style={{ marginTop: 12 }} />}
              {libraryResults?.slice(0, 6).map((svc) => (
                <TouchableOpacity
                  key={svc.id}
                  style={styles.serviceRow}
                  onPress={() => {
                    setSelectedService(svc)
                    setAmount(svc.defaultAmount ? String(svc.defaultAmount) : '')
                  }}
                  accessibilityLabel={`Select ${svc.name}`}
                >
                  <Text style={styles.serviceName}>{svc.name}</Text>
                  {svc.defaultAmount && (
                    <Text style={styles.serviceAmount}>₹{svc.defaultAmount}/mo</Text>
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setStep(2)} style={styles.skipBtn}>
                <Text style={styles.skipText}>Skip for now →</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.selectedName}>{selectedService.name}</Text>
              <Text style={styles.amountLabel}>Monthly amount (₹)</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                accessibilityLabel="Amount in rupees"
              />
              <TouchableOpacity
                style={[styles.primaryBtn, isPending && styles.disabled]}
                onPress={handleAddFirstSub}
                disabled={isPending || !amount}
              >
                {isPending
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.primaryBtnText}>Add + earn 10 coins ⬡</Text>
                }
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedService(null)}>
                <Text style={styles.skipText}>← Choose another</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* Step 2: Add rent (optional, 3x coins hook) */}
      {step === 2 && (
        <View style={styles.slide}>
          <Text style={styles.bigEmoji}>🏠</Text>
          <Text style={styles.heading}>Do you pay rent?</Text>
          <Text style={styles.body}>
            Track rent and utilities too. You earn{' '}
            <Text style={{ color: Colors.secondary, fontWeight: '700' }}>3× coins</Text>{' '}
            on every payment — because rent is your biggest bill.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(3)}>
            <Text style={styles.primaryBtnText}>Yes, add rent →</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep(3)} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Step 3: Revelation */}
      {step === 3 && (
        <View style={styles.slide}>
          <Text style={styles.bigEmoji}>💡</Text>
          <Text style={styles.heading}>Your dashboard is ready</Text>
          <Text style={styles.body}>
            {firstSubAdded
              ? 'You can now see exactly what you're spending on subscriptions. Every payment earns you coins.'
              : 'Add subscriptions anytime from the home screen. Every payment you track earns coins.'}
          </Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>📊 See your monthly burn at a glance</Text>
            <Text style={styles.featureItem}>🔔 Get reminders before renewals</Text>
            <Text style={styles.featureItem}>⬡ Earn coins, unlock perks</Text>
            <Text style={styles.featureItem}>🔥 Build your payment streak</Text>
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={goToDashboard}>
            <Text style={styles.primaryBtnText}>See my dashboard →</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  progressRow: {
    flexDirection: 'row', gap: 6, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8,
  },
  dot: {
    height: 4, flex: 1, backgroundColor: Colors.border, borderRadius: 2,
  },
  dotActive: { backgroundColor: Colors.primary },
  slide: { flex: 1, paddingHorizontal: 24, paddingTop: 32, gap: 16 },
  bigEmoji: { fontSize: 56 },
  heading: { fontSize: 28, fontWeight: '800', color: Colors.text, lineHeight: 34 },
  subheading: { fontSize: 16, color: Colors.textMuted, marginTop: -8 },
  body: { fontSize: 16, color: Colors.textSecondary, lineHeight: 24 },
  bonusChip: {
    backgroundColor: `${Colors.secondary}22`,
    borderRadius: 12, padding: 14, borderWidth: 1,
    borderColor: `${Colors.secondary}44`,
  },
  bonusText: { color: Colors.secondary, fontSize: 14, fontWeight: '600' },
  primaryBtn: {
    backgroundColor: Colors.primary, borderRadius: 16,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.5 },
  searchInput: {
    backgroundColor: Colors.surface, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    color: Colors.text, fontSize: 16,
  },
  serviceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  serviceName: { fontSize: 16, color: Colors.text },
  serviceAmount: { fontSize: 14, color: Colors.textMuted },
  selectedName: { fontSize: 24, fontWeight: '800', color: Colors.text },
  amountLabel: { fontSize: 13, color: Colors.textMuted },
  amountInput: {
    backgroundColor: Colors.surface, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    color: Colors.text, fontSize: 32, fontWeight: '700',
  },
  skipBtn: { paddingVertical: 8 },
  skipText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center' },
  featureList: { gap: 8 },
  featureItem: { fontSize: 15, color: Colors.textSecondary },
})
