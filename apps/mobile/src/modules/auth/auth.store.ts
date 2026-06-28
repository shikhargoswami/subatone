// apps/mobile/src/modules/auth/auth.store.ts
// Zustand store for local user state.

import { create } from 'zustand'
import type { UserProfile } from '@subatone/types'

interface AuthState {
  user: UserProfile | null
  setUser: (user: UserProfile) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))
