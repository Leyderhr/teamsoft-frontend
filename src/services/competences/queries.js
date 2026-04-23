import { useQuery } from '@tanstack/vue-query'
import { api } from '@/lib/api'

async function fetchCompetences() {
  return api.get('competence').json()
}

async function fetchCompetence(id) {
  return api.get(`competence/${id}`).json()
}

export function useCompetences() {
  return useQuery({
    queryKey: ['competences'],
    queryFn: fetchCompetences,
  })
}

export function useCompetence(id) {
  return useQuery({
    queryKey: ['competences', id],
    queryFn: () => fetchCompetence(id),
    enabled: !!id,
  })
}
