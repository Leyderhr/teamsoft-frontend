import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(null)
  const refreshToken = ref(null)
  const tokenExpiry = ref(null)

  // Computed
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  const currentUser = computed(() => user.value)

  // Backward-compatible aliases usadas por componentes del sistema anterior
  const username = computed(() => user.value?.username || '')
  const roles = computed(() => user.value?.authorities || [])
  const token = computed(() => accessToken.value || '')

  // Inicializar desde localStorage
  const initFromStorage = () => {
    const storedUser = localStorage.getItem('user')
    const storedRefreshToken = localStorage.getItem('refreshToken')
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        user.value = userData
        accessToken.value = userData.token
        tokenExpiry.value = userData.expiresAt
      } catch (error) {
        console.error('Error parsing user data:', error)
        clearAuth()
      }
    }
    
    if (storedRefreshToken) {
      refreshToken.value = storedRefreshToken
    }
  }

  // Establecer tokens y usuario
  const setAuth = (authData) => {
    const { token, refreshToken: newRefreshToken, username, authorities, expiresIn } = authData
    
    const userData = {
      username,
      authorities,
      token,
      expiresAt: Date.now() + expiresIn
    }
    
    user.value = userData
    accessToken.value = token
    refreshToken.value = newRefreshToken
    tokenExpiry.value = userData.expiresAt
    
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('refreshToken', newRefreshToken)
  }

  // Actualizar solo el access token (después de refresh)
  const updateAccessToken = (newAccessToken, newRefreshToken, expiresIn) => {
    if (user.value) {
      user.value.token = newAccessToken
      user.value.expiresAt = Date.now() + expiresIn
      accessToken.value = newAccessToken
      tokenExpiry.value = user.value.expiresAt
      
      if (newRefreshToken) {
        refreshToken.value = newRefreshToken
        localStorage.setItem('refreshToken', newRefreshToken)
      }
      
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  // Limpiar autenticación
  const clearAuth = () => {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    tokenExpiry.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('refreshToken')
  }

  // Alias de clearAuth para compatibilidad con el store antiguo
  const logout = () => clearAuth()

  // Verificar si el token está por expirar (menos de 5 minutos)
  const isTokenExpiringSoon = () => {
    if (!tokenExpiry.value) return false
    const fiveMinutes = 5 * 60 * 1000
    return (tokenExpiry.value - Date.now()) < fiveMinutes
  }

  // Obtener access token
  const getAccessToken = () => accessToken.value

  // Obtener refresh token
  const getRefreshToken = () => refreshToken.value

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    currentUser,
    // Backward-compatible aliases
    username,
    roles,
    token,
    logout,
    // Methods
    initFromStorage,
    setAuth,
    updateAccessToken,
    clearAuth,
    isTokenExpiringSoon,
    getAccessToken,
    getRefreshToken,
  }
})
