// apps/mobile/src/shared/api/client.ts
// Centralised API client. Attaches Clerk auth token to every request.
// Handles token expiry, network timeouts, and typed responses.

import { useAuth } from '@clerk/clerk-expo'
import type { ApiResponse } from '@subatone/types'

const BASE_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:3000'
const TIMEOUT_MS = 15_000

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    return res
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new ApiError('TIMEOUT', 'Request timed out. Please check your connection.', 408)
    }
    throw new ApiError('NETWORK_ERROR', 'Network error. Please check your connection.', 0)
  } finally {
    clearTimeout(timer)
  }
}

// Core request function — used inside React hooks via useApiClient
async function request<T>(
  path: string,
  options: RequestInit & { token: string },
): Promise<T> {
  const { token, ...rest } = options
  const url = `${BASE_URL}/api/v1${path}`

  const res = await fetchWithTimeout(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...rest.headers,
    },
  })

  const body: ApiResponse<T> = await res.json()

  if (!body.success) {
    throw new ApiError(
      body.error.code,
      body.error.message,
      res.status,
    )
  }

  return body.data
}

// Hook that returns an authenticated API client
export function useApiClient() {
  const { getToken } = useAuth()

  const getAuthenticatedToken = async (): Promise<string> => {
    const token = await getToken()
    if (!token) throw new ApiError('UNAUTHORIZED', 'Not authenticated', 401)
    return token
  }

  return {
    get: async <T>(path: string): Promise<T> => {
      const token = await getAuthenticatedToken()
      return request<T>(path, { method: 'GET', token })
    },

    post: async <T>(path: string, body?: unknown): Promise<T> => {
      const token = await getAuthenticatedToken()
      return request<T>(path, {
        method: 'POST',
        token,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      })
    },

    patch: async <T>(path: string, body: unknown): Promise<T> => {
      const token = await getAuthenticatedToken()
      return request<T>(path, { method: 'PATCH', token, body: JSON.stringify(body) })
    },

    delete: async <T>(path: string): Promise<T> => {
      const token = await getAuthenticatedToken()
      return request<T>(path, { method: 'DELETE', token })
    },
  }
}
