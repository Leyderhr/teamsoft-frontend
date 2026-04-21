import { useQuery } from '@tanstack/vue-query'
import { isRef } from 'vue'
import { api } from '@/lib/api'

const resolve = (val) => (isRef(val) ? val.value : val)

export function useNomenclative(endpoint) {
  return useQuery({
    queryKey: [endpoint],
    queryFn: () => api.get(resolve(endpoint)).json(),
  })
}

export function useNomenclativeItem(endpoint, id) {
  return useQuery({
    queryKey: [endpoint, id],
    queryFn: () => api.get(`${resolve(endpoint)}/${resolve(id)}`).json(),
    enabled: () => !!resolve(id),
  })
}

// Hooks específicos para cada nomenclativo
export const useCounties = () => useNomenclative('county')
export const useRaces = () => useNomenclative('race')
export const useReligions = () => useNomenclative('religion')
export const useNacionalities = () => useNomenclative('nacionality')
export const usePersonGroups = () => useNomenclative('personGroups')
export const useAgeGroups = () => useNomenclative('ageGroups')
export const useClients = () => useNomenclative('clients')
export const useLevels = () => useNomenclative('levels')
export const useCompetenceImportance = () => useNomenclative('competenceImportance')
export const useConflictIndex = () => useNomenclative('conflictIndex')
export const useCostDistance = () => useNomenclative('costDistance')
export const useRoleEvaluation = () => useNomenclative('roleEvaluation')
export const useRoleLoad = () => useNomenclative('roleLoad')
