// apps/mobile/src/modules/subscriptions/AddSubscriptionSheet.tsx
// Bottom sheet for adding a new subscription via library search.

import { useState } from 'react'
import {
  View, Text, Modal, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useApiClient } from '../../shared/api/client'
import { useCreateSubscription } from './useSubscriptions'
import { Colors } from '../../shared/constants/colors'
import type { ServiceLibraryItem } from '@subatone/types'

interface Props {
  visible: boolean
  onClose: () => void
}

type Step = 'search' | 'manual' | 'confirm'

export function AddSubscriptionSheet({ visible, onClose }: Props) {
  const api = useApiClient()
  const { mutate: create, isPending, error } = useCreateSubscription()

  const [step, setStep] = useState<Step>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState<ServiceLibraryItem | null>(null)
  const [amount, setAmount] = useState('')
  const [billingCycle, setBillingCycle] = useState<string>('MONTHLY')

  const { data: libraryResults, isLoading: isSearching } = useQuery<ServiceLibraryItem[]>({
    queryKey: ['library', searchQuery],
    queryFn: () => api.get<ServiceLibraryItem[]>(`/library?query=${encodeURIComponent(searchQuery)}`),  
    enabled: searchQuery.length >= 2,
  })

  const handleSelectService = (svc: ServiceLibraryItem) => {
    setSelectedService(svc)
    setAmount(svc.defaultAmount ? String(svc.defaultAmount) : '')
    setBillingCycle(svc.defaultCycle ?? 'MONTHLY')
    setStep('confirm')
  }

  const handleCreate = () => {
    if (!amount || isNaN(Number(amount))) return

    create(
      {
        name: selectedService?.name ?? searchQuery,
        amount: Number(amount),
        billingCycle: billingCycle as any,
        category: selectedService?.category ?? 'OTHER',
        serviceLibraryId: selectedService?.id,
        nextRenewalDate: new Date(Date.now() + 30 * 86_400_000).toISOString().split('T')[0]!,
      },
      {
        onSuccess: () => {
          onClose()
          resetForm()
        },
      },
    )
  }

  const resetForm = () => {
    setStep('search')
    setSearchQuery('')
    setSelectedService(null)
    setAmount('')
    setBillingCycle('MONTHLY')
  }

  const BILLING_CYCLES = ['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUALLY']

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Add Subscription</Text>
          <TouchableOpacity onPress={() => { onClose(); resetForm() }}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        {step === 'search' && (
          <ScrollView style={styles.body}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search Netflix, Spotify, Jio..."
              placeholderTextColor={Colors.textMuted}
              autoFocus
              accessibilityLabel="Search services"
            />

            {isSearching && <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />}

            {libraryResults?.map((svc) => (
              <TouchableOpacity
                key={svc.id}
                style={styles.serviceRow}
                onPress={() => handleSelectService(svc)}
                accessibilityLabel={`Select ${svc.name}`}
              >
                <Text style={styles.serviceName}>{svc.name}</Text>
                {svc.defaultAmount && (
                  <Text style={styles.serviceAmount}>₹{svc.defaultAmount}</Text>
                )}
              </TouchableOpacity>
            ))}

            {searchQuery.length >= 2 && libraryResults?.length === 0 && !isSearching && (
              <TouchableOpacity style={styles.manualBtn} onPress={() => setStep('confirm')}>
                <Text style={styles.manualBtnText}>Add "{searchQuery}" manually →</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        {step === 'confirm' && (
          <ScrollView style={styles.body}>
            <Text style={styles.confirmName}>{selectedService?.name ?? searchQuery}</Text>

            <Text style={styles.label}>Amount (₹)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="649"
              placeholderTextColor={Colors.textMuted}
              accessibilityLabel="Subscription amount in rupees"
            />

            <Text style={styles.label}>Billing cycle</Text>
            <View style={styles.cycleRow}>
              {BILLING_CYCLES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.cycleChip, billingCycle === c && styles.cycleChipActive]}
                  onPress={() => setBillingCycle(c)}
                  accessibilityLabel={c.toLowerCase().replace('_', ' ')}
                  accessibilityState={{ selected: billingCycle === c }}
                >
                  <Text style={[styles.cycleText, billingCycle === c && styles.cycleTextActive]}>
                    {c.split('_')[0]!.toLowerCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {error && (
              <Text style={styles.error} accessibilityLiveRegion="polite">
                {error.message}
              </Text>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, isPending && styles.disabled]}
              onPress={handleCreate}
              disabled={isPending}
            >
              {isPending
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.primaryBtnText}>Add + earn 10 coins</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep('search')}>
              <Text style={styles.backLink}>← Back</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  closeBtn: { fontSize: 20, color: Colors.textMuted, padding: 4 },
  body: { padding: 20 },
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
  manualBtn: { paddingVertical: 16 },
  manualBtnText: { color: Colors.primary, fontSize: 15 },
  confirmName: { fontSize: 24, fontWeight: '700', color: Colors.text, marginBottom: 24 },
  label: { fontSize: 13, color: Colors.textMuted, marginBottom: 6 },
  input: {
    backgroundColor: Colors.surface, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    color: Colors.text, fontSize: 20, marginBottom: 20,
  },
  cycleRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 24 },
  cycleChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  cycleChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  cycleText: { color: Colors.textMuted, fontSize: 13 },
  cycleTextActive: { color: '#fff', fontWeight: '600' },
  error: { color: Colors.error, fontSize: 13, marginBottom: 12 },
  primaryBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginBottom: 16,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.5 },
  backLink: { color: Colors.textMuted, fontSize: 14, textAlign: 'center' },
})
