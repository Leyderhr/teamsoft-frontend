import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '@/lib/api'

async function createPerson(personData) {
  return api.post('person', { json: personData }).json()
}

async function updatePerson({ id, data }) {
  return api.put(`person/${id}`, { json: data }).json()
}

async function deletePerson(id) {
  return api.delete(`person/${id}`).json()
}

export function useCreatePerson() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createPerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['persons'] })
    },
  })
}

export function useUpdatePerson() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updatePerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['persons'] })
    },
  })
}

export function useDeletePerson() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deletePerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['persons'] })
    },
  })
}
