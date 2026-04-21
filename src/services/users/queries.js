import { useQuery } from '@tanstack/vue-query'
import { api } from '@/lib/api'

/**
 * Obtener todos los usuarios
 */
async function fetchUsers() {
  return api.get('users').json()
}

/**
 * Obtener usuario por ID
 */
async function fetchUser(id) {
  return api.get(`users/${id}`).json()
}

/**
 * Obtener roles disponibles
 */
async function fetchRoles() {
  return api.get('role').json()
}

/**
 * Hook para obtener todos los usuarios
 */
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })
}

/**
 * Hook para obtener un usuario por ID
 */
export function useUser(id) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  })
}

/**
 * Hook para obtener roles
 */
export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
  })
}
