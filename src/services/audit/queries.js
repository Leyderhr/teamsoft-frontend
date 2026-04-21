import { useQuery } from '@tanstack/vue-query'
import { api } from '@/lib/api'

async function fetchAuditLogs(params = {}) {
  const searchParams = new URLSearchParams()
  
  if (params.page) searchParams.set('page', params.page)
  if (params.size) searchParams.set('size', params.size)
  if (params.entity) searchParams.set('entity', params.entity)
  if (params.action) searchParams.set('action', params.action)
  if (params.userId) searchParams.set('userId', params.userId)
  if (params.startDate) searchParams.set('startDate', params.startDate)
  if (params.endDate) searchParams.set('endDate', params.endDate)

  const queryString = searchParams.toString()
  const url = queryString ? `audit?${queryString}` : 'audit'

  return api.get(url).json()
}

async function fetchAuditLog(id) {
  return api.get(`audit/${id}`).json()
}

export function useAuditLogs(params = {}) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => fetchAuditLogs(params),
  })
}

export function useAuditLog(id) {
  return useQuery({
    queryKey: ['audit-logs', id],
    queryFn: () => fetchAuditLog(id),
    enabled: !!id,
  })
}
