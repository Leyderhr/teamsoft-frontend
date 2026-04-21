import { useMutation } from '@tanstack/vue-query'
import { fetchGenerateTeams, fetchSaveTeams } from '@/services/team-formation'

export function useTeamFormation() {
  const generateMutation = useMutation({
    mutationFn: fetchGenerateTeams
  })

  const saveMutation = useMutation({
    mutationFn: fetchSaveTeams
  })

  return {
    generateTeams: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    generateError: generateMutation.error,
    generatedTeams: generateMutation.data,
    
    saveTeams: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error
  }
}
