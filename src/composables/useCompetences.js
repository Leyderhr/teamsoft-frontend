import { useQuery, useMutation } from '@tanstack/vue-query'
import { queryClient } from '@/lib/query-client'
import {
  fetchGetCompetences,
  fetchGetCompetenceById,
  fetchCreateCompetence,
  fetchUpdateCompetence,
  fetchDeleteCompetence,
  fetchImportCompetences,
  fetchExportCompetences
} from '@/services/competences'

export function useCompetences() {
  const { data: competences, isLoading, error, refetch } = useQuery({
    queryKey: ['competences'],
    queryFn: fetchGetCompetences
  })

  const createMutation = useMutation({
    mutationFn: fetchCreateCompetence,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['competences'] })
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => fetchUpdateCompetence(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['competences'] })
  })

  const deleteMutation = useMutation({
    mutationFn: fetchDeleteCompetence,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['competences'] })
  })

  const importMutation = useMutation({
    mutationFn: ({ file, updateIfExist }) => fetchImportCompetences(file, updateIfExist),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['competences'] })
  })

  return {
    competences,
    isLoading,
    error,
    refetch,
    createCompetence: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateCompetence: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteCompetence: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    importCompetences: importMutation.mutate,
    isImporting: importMutation.isPending,
    exportCompetences: fetchExportCompetences
  }
}

export function useCompetence(competenceId) {
  const { data: competence, isLoading, error } = useQuery({
    queryKey: ['competences', competenceId],
    queryFn: () => fetchGetCompetenceById(competenceId.value),
    enabled: () => !!competenceId.value
  })

  return { competence, isLoading, error }
}
