import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '@/lib/api'

async function saveTeams(data) {
  return api.post('teamFormation/save_teams', { json: data }).json()
}

export function useSaveTeams() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveTeams,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-formation'] })
    },
  })
}
