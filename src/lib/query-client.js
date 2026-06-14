import { QueryClient } from '@tanstack/vue-query'

// No reintentar errores de cliente (4xx): son deterministas y, en el caso de
// la formación de equipos, cada intento dispara un cálculo costoso en el backend.
// Sí se reintentan errores 5xx / de red.
function makeRetry(maxAttempts) {
  return (failureCount, error) => {
    const status = error?.response?.status
    if (status !== undefined && status >= 400 && status < 500) return false
    return failureCount < maxAttempts
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 10 * 60 * 1000,
      retry: makeRetry(3),
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: makeRetry(1),
    },
  },
})
