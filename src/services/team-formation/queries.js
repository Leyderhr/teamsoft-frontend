import { useQuery } from '@tanstack/vue-query'
import { api } from '@/lib/api'

async function fetchTeamFormationResults(params) {
  return api.post('teamFormation/teams', { json: params }).json()
}

export function useTeamFormation(params, options = {}) {
  return useQuery({
    queryKey: ['team-formation', params],
    queryFn: () => fetchTeamFormationResults(params),
    enabled: false, // Solo ejecutar cuando se llame manualmente
    ...options,
  })
}
