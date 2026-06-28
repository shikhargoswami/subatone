// apps/mobile/src/modules/dashboard/useDashboard.ts
// React Query hook for the dashboard summary.

import { useQuery } from '@tanstack/react-query'
import { useApiClient } from '../../shared/api/client'
import type { DashboardSummary } from '@subatone/types'

export const DASHBOARD_QUERY_KEY = ['dashboard'] as const

export function useDashboard() {
  const api = useApiClient()

  return useQuery<DashboardSummary>({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: () => api.get<DashboardSummary>('/dashboard'),
    staleTime: 1000 * 30,  // 30s — fresh enough for the revelation moment
  })
}
