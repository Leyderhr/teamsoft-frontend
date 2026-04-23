import { useQuery } from '@tanstack/vue-query'
import { api } from '@/lib/api'

async function fetchReports() {
  return api.get('reports').json()
}

async function fetchReport(id) {
  return api.get(`reports/${id}`).json()
}

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: fetchReports,
  })
}

export function useReport(id) {
  return useQuery({
    queryKey: ['reports', id],
    queryFn: () => fetchReport(id),
    enabled: !!id,
  })
}
