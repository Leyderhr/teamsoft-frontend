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

function bearerToken(authorizationHeader) {
  return (authorizationHeader || '').replace(/^Bearer\s+/i, '')
}

// Sesión expirada y sin refresh válido: limpiar y mandar al login (evitando bucle si ya estamos ahí)
function forceLogin() {
  const authStore = useAuthStore()
  authStore.clearAuth()
  queryClient.clear()
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

// Base ky instance
const _baseApi = ky.create({
  prefix: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
  timeout: 100000,
  headers: {
    'Accept': 'application/json'
  },
  hooks: {
    afterResponse: [
      // El hook recibe { request, options, response, retryCount }
      async ({ request, response }) => {
        const url = response.url || ''

        if (response.status === 401 && !isPublicEndpoint(url)) {
          
          if (request.headers.has('X-Is-Retry')) {
            forceLogin()
            return response
          }
          
          const authStore = useAuthStore()
          const failedToken = bearerToken(request.headers.get('Authorization'))
          const currentToken = authStore.getAccessToken()

          // Otra petición concurrente ya refrescó el token: reintentar con el vigente
          if (currentToken && currentToken !== failedToken) {
            request.headers.set('Authorization', `Bearer ${currentToken}`)
            return _baseApi(request)
          }

          // El token que falló es el vigente: coordinar un único refresh entre peticiones
          if (!isRefreshing) {
            isRefreshing = true
            refreshPromise = refreshTokenAndGetNew().finally(() => {
              isRefreshing = false
              refreshPromise = null
            })
          }
          const newToken = await refreshPromise

          if (newToken && newToken !== failedToken) {
            // Reintentar la petición original con el token nuevo (transparente para el usuario)
            request.headers.set('Authorization', `Bearer ${newToken}`)
            return _baseApi(request)
          }

          // No se pudo refrescar (refresh token vencido/ausente): cerrar sesión y redirigir
          forceLogin()
          return response
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
