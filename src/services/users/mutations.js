import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '@/lib/api'

/**
 * Crear usuario
 */
async function createUser(userData) {
  return api.post('users', { json: userData }).json()
}

/**
 * Eliminar usuario
 */
async function deleteUser(id) {
  return api.delete(`users/${id}`).json()
}

/**
 * Resetear contraseña de usuario
 */
async function resetPassword(id) {
  return api.post(`users/${id}/reset-password`).json()
}

/**
 * Hook para crear usuario
 */
export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

/**
 * Hook para eliminar usuario
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

/**
 * Hook para resetear contraseña
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: resetPassword,
  })
}
