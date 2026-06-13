import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '@/lib/api'

async function saveTeams(data) {
  return api.post('teamFormation/save_teams', { json: data }).json()
}

async function fetchBossProposals(data) {
  return api.post('teamFormation/boss-proposals', { json: data }).json()
}

async function fetchMemberProposals(data) {
  return api.post('teamFormation/member-proposals', { json: data }).json()
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

export function useBossProposals() {
  return useMutation({ mutationFn: fetchBossProposals })
}

export function useMemberProposals() {
  return useMutation({ mutationFn: fetchMemberProposals })
}
