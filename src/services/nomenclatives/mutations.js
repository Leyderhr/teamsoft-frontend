import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '@/lib/api'

function createNomenclativeMutations(endpoint, queryKey) {
  const createFn = (data) => api.post(endpoint, { json: data }).json()
  const updateFn = ({ id, data }) => api.put(`${endpoint}/${id}`, { json: data }).json()
  const deleteFn = (id) => api.delete(`${endpoint}/${id}`).json()

  return {
    useCreate: () => {
      const queryClient = useQueryClient()
      return useMutation({
        mutationFn: createFn,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] })
      })
    },
    useUpdate: () => {
      const queryClient = useQueryClient()
      return useMutation({
        mutationFn: updateFn,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] })
      })
    },
    useDelete: () => {
      const queryClient = useQueryClient()
      return useMutation({
        mutationFn: deleteFn,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] })
      })
    }
  }
}

export const clientsMutations = createNomenclativeMutations('clients', 'clients')
export const ageGroupsMutations = createNomenclativeMutations('ageGroups', 'ageGroups')
export const competenceImportanceMutations = createNomenclativeMutations('competenceImportance', 'competenceImportance')
export const conflictIndexMutations = createNomenclativeMutations('conflictIndex', 'conflictIndex')
export const costDistanceMutations = createNomenclativeMutations('costDistance', 'costDistance')
export const countiesMutations = createNomenclativeMutations('county', 'counties')
export const levelsMutations = createNomenclativeMutations('levels', 'levels')
export const nacionalitiesMutations = createNomenclativeMutations('nacionality', 'nacionalities')
export const personGroupsMutations = createNomenclativeMutations('personGroups', 'personGroups')
export const projectStructuresMutations = createNomenclativeMutations('project-structure', 'projectStructures')
export const racesMutations = createNomenclativeMutations('race', 'races')
export const religionsMutations = createNomenclativeMutations('religion', 'religions')
export const roleEvaluationsMutations = createNomenclativeMutations('roleEvaluation', 'roleEvaluations')
export const roleLoadsMutations = createNomenclativeMutations('roleLoad', 'roleLoads')
