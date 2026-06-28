// apps/mobile/src/shared/constants/colors.ts
// Single source of truth for all colours.

export const Colors = {
  // Brand
  primary: '#7C3AED',       // violet-600 — Suba brand
  primaryLight: '#EDE9FE',  // violet-100
  secondary: '#F59E0B',     // amber-500 — coins

  // Backgrounds (dark mode default)
  background: '#0A0A0F',
  surface: '#16161F',
  surfaceElevated: '#1E1E2E',
  border: '#2A2A3A',

  // Text
  text: '#F0F0FA',
  textSecondary: '#A0A0B8',
  textMuted: '#606078',

  // Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Category colours
  ott: '#EF4444',
  music: '#8B5CF6',
  mobile: '#3B82F6',
  aiTools: '#10B981',
  cloud: '#06B6D4',
  productivity: '#F59E0B',
  finance: '#22C55E',
  health: '#EC4899',
  gaming: '#F97316',
  rent: '#6366F1',
} as const
