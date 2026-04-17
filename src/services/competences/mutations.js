import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '@/lib/api'

async function createCompetence(competenceData) {
  return api.post('competence', { json: competenceData }).json()
}

async function updateCompetence({ id, data }) {
  return api.put(`competence/${id}`, { json: data }).json()
}

async function deleteCompetence(id) {
  return api.delete(`competence/${id}`).json()
}

async function importCompetences({ file, updateIfExist }) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('updateIfExist', updateIfExist)
  return api.post('competence/import', { body: formData }).json()
}

async function exportCompetences() {
  return api.get('competence/export').blob()
}

export function useCreateCompetence() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createCompetence,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competences'] })
    },
  })
}

export function useUpdateCompetence() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateCompetence,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competences'] })
    },
  })
}

export function useDeleteCompetence() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteCompetence,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competences'] })
    },
  })
}

export function useImportCompetences() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: importCompetences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competences'] })
    },
  })
}

export function useExportCompetences() {
  return useMutation({
    mutationFn: exportCompetences,
  })
}
