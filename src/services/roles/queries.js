import { useQuery } from '@tanstack/vue-query'
import { api } from '@/lib/api'

async function fetchRoles() {
  return api.get('role').json()
}

async function fetchRole(id) {
  return api.get(`role/${id}`).json()
}

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
  })
}

export function useRole(id) {
  return useQuery({
    queryKey: ['roles', id],
    queryFn: () => fetchRole(id),
    enabled: !!id,
  })
}
