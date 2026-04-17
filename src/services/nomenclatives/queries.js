import { useQuery } from '@tanstack/vue-query'
import { api } from '@/lib/api'

/**
 * Hook genérico para obtener nomenclativos
 * @param {string} endpoint - Endpoint del nomenclativo (ej: 'county', 'race', etc.)
 */
export function useNomenclative(endpoint) {
  return useQuery({
    queryKey: [endpoint],
    queryFn: () => api.get(endpoint).json(),
  })
}

/**
 * Hook genérico para obtener un nomenclativo por ID
 */
export function useNomenclativeItem(endpoint, id) {
  return useQuery({
    queryKey: [endpoint, id],
    queryFn: () => api.get(`${endpoint}/${id}`).json(),
    enabled: !!id,
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
