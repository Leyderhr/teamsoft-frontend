import ky from 'ky'
import { useAuthStore } from './auth-store'
import { queryClient } from './query-client'

let isRefreshing = false
let refreshPromise = null

async function refreshTokenAndGetNew() {
  const authStore = useAuthStore()
  const refreshToken = authStore.getRefreshToken()

  if (!refreshToken) {
    return null
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    })

    if (!response.ok) {
      throw new Error('Refresh token failed')
    }

    const data = await response.json()
    authStore.updateAccessToken(data.accessToken, data.refreshToken, data.expiresIn)
    return data.accessToken
  } catch (error) {
    console.error('Token refresh failed:', error)
    return null
  }
}

const PUBLIC_ENDPOINTS = ['/auth/login', '/auth/refresh', '/auth/validate-token']

function isPublicEndpoint(url) {
  return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint))
}

// Base ky instance
const _baseApi = ky.create({
  prefix: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
  timeout: 100000,
  hooks: {
    afterResponse: [
      // ky v2: el hook recibe { request, options, response, retryCount }
      async ({ response }) => {
        const url = response.url || ''

        if (response.status === 401 && !isPublicEndpoint(url)) {
          const authStore = useAuthStore()

          if (!isRefreshing) {
            isRefreshing = true
            refreshPromise = refreshTokenAndGetNew()
          }

          const newToken = await refreshPromise
          isRefreshing = false
          refreshPromise = null

          if (!newToken) {
            // Refresh falló — limpiar sesión y redirigir
            authStore.clearAuth()
            queryClient.clear()
            window.location.href = '/login'
          }
          // Si se obtuvo nuevo token, TanStack Query reintentará y withAuth() lo inyectará
        }

        if (response.status === 403 && !isPublicEndpoint(url)) {
          console.error('Access denied - insufficient permissions')
        }

        return response
      }
    ]
  }
})

// Obtiene las cabeceras de autenticación del store actual
function getAuthHeaders() {
  const authStore = useAuthStore()
  const token = authStore.getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Combina opciones de la petición con las cabeceras de auth
function withAuth(options = {}) {
  const authHeaders = getAuthHeaders()
  if (!Object.keys(authHeaders).length) return options
  return {
    ...options,
    headers: {
      ...authHeaders,
      ...(options.headers || {})
    }
  }
}

// API autenticada — wrapper sobre _baseApi que inyecta el token automáticamente
export const api = {
  get: (url, options) => _baseApi.get(url, withAuth(options)),
  post: (url, options) => _baseApi.post(url, withAuth(options)),
  put: (url, options) => _baseApi.put(url, withAuth(options)),
  patch: (url, options) => _baseApi.patch(url, withAuth(options)),
  delete: (url, options) => _baseApi.delete(url, withAuth(options)),
}
