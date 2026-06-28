// apps/mobile/src/modules/subscriptions/useSubscriptions.ts
// React Query hooks for subscription CRUD.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '../../shared/api/client'
import { DASHBOARD_QUERY_KEY } from '../dashboard/useDashboard'
import type { Subscription, PaginatedResponse } from '@subatone/types'
import type { CreateSubscriptionInput } from '@subatone/validators'

export const SUBSCRIPTIONS_QUERY_KEY = ['subscriptions'] as const

export function useSubscriptions() {
  const api = useApiClient()

  return useQuery<PaginatedResponse<Subscription>>({
    queryKey: SUBSCRIPTIONS_QUERY_KEY,
    queryFn: () => api.get<PaginatedResponse<Subscription>>('/subscriptions'),
  })
}

export function useCreateSubscription() {
  const api = useApiClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateSubscriptionInput) =>
      api.post<{ subscription: Subscription; coinsEarned: number }>(
        '/subscriptions',
        input,
      ),
    onSuccess: () => {
      // Invalidate both subscriptions list and dashboard so totals update
      qc.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY })
      qc.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
    },
  })
}

export function useDeleteSubscription() {
  const api = useApiClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/subscriptions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY })
      qc.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
    },
  })
}

export function useMarkSubscriptionPaid() {
  const api = useApiClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      api.post<{ coinsEarned: number; newBalance: number }>(
        `/subscriptions/${id}/paid`,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY })
      qc.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
      qc.invalidateQueries({ queryKey: ['gamification'] })
    },
  })
}
