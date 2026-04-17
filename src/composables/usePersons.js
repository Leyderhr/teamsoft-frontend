import { useQuery, useMutation } from '@tanstack/vue-query'
import { queryClient } from '@/lib/query-client'
import {
  fetchGetPersons,
  fetchGetPersonById,
  fetchCreatePerson,
  fetchUpdatePerson,
  fetchDeletePerson
} from '@/services/persons'

export function usePersons() {
  console.log('usePersons() called')
  
  const { data: persons, isLoading, error, refetch } = useQuery({
    queryKey: ['persons'],
    queryFn: async () => {
      console.log('queryFn executing for persons')
      const result = await fetchGetPersons()
      console.log('fetchGetPersons result:', result)
      return result
    }
  })

  const createMutation = useMutation({
    mutationFn: fetchCreatePerson,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['persons'] })
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => fetchUpdatePerson(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['persons'] })
  })

  const deleteMutation = useMutation({
    mutationFn: fetchDeletePerson,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['persons'] })
  })

  return {
    persons,
    isLoading,
    error,
    refetch,
    createPerson: createMutation.mutate,
    isCreating: createMutation.isPending,
    updatePerson: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deletePerson: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending
  }
}

export function usePerson(personId) {
  const { data: person, isLoading, error } = useQuery({
    queryKey: ['persons', personId],
    queryFn: () => fetchGetPersonById(personId.value),
    enabled: () => !!personId.value
  })

  return { person, isLoading, error }
}
