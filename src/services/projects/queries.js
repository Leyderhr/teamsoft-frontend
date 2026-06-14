import { toValue, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { api } from '@/lib/api'

async function fetchProjects() {
  return api.get('project').json()
}

async function fetchProject(id) {
  return api.get(`project/${id}`).json()
}

async function fetchProjectsByState(state) {
  return api.get(`project/state/${state}`).json()
}

function buildIdsParams(ids) {
  const params = new URLSearchParams()
  ids.forEach(id => params.append('ids', id))
  return params.toString()
}

async function fetchNonBossRoles(ids) {
  return api.get(`project/non-boss-roles?${buildIdsParams(ids)}`).json()
}

async function fetchBossCompetitions(ids) {
  return api.get(`project/boss-competitions?${buildIdsParams(ids)}`).json()
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  })
}

export function useProject(id) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => fetchProject(id),
    enabled: !!id,
  })
}

export function useProjectsByState(state) {
  return useQuery({
    queryKey: ['projects', 'state', state],
    queryFn: () => fetchProjectsByState(toValue(state)),
  })
}

export function useNonBossRoles(ids) {
  return useQuery({
    queryKey: ['project-non-boss-roles', ids],
    queryFn: () => fetchNonBossRoles(toValue(ids)),
    enabled: computed(() => (toValue(ids) ?? []).length > 0),
  })
}

export function useBossCompetitions(ids) {
  return useQuery({
    queryKey: ['project-boss-competitions', ids],
    queryFn: () => fetchBossCompetitions(toValue(ids)),
    enabled: computed(() => (toValue(ids) ?? []).length > 0),
  })
}
