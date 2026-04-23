import { useMutation } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/lib/auth-store'
import { queryClient } from '@/lib/query-client'
import { login as loginService } from '@/services/auth/login'
import { logout as logoutService } from '@/services/auth/logout'
import { changePassword as changePasswordService } from '@/services/auth/change-password'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  // Mutation de login
  const loginMutation = useMutation({
    mutationFn: loginService,
    onSuccess: (data) => {
      authStore.setAuth(data)
      router.push('/')
    },
    onError: (error) => {
      console.error('Login failed:', error)
    }
  })

  // Mutation de logout
  const logoutMutation = useMutation({
    mutationFn: logoutService,
    onSuccess: () => {
      authStore.clearAuth()
      queryClient.clear()
      router.push('/login')
    },
    onError: (error) => {
      console.error('Logout failed:', error)
      // Limpiar de todas formas
      authStore.clearAuth()
      queryClient.clear()
      router.push('/login')
    }
  })

  // Mutation de cambio de contraseña
  const changePasswordMutation = useMutation({
    mutationFn: changePasswordService,
    onError: (error) => {
      console.error('Change password failed:', error)
    }
  })

  return {
    // State
    isAuthenticated: authStore.isAuthenticated,
    currentUser: authStore.currentUser,
    
    // Mutations
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    
    changePassword: changePasswordMutation.mutate,
    changePasswordAsync: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    changePasswordError: changePasswordMutation.error,
  }
}
