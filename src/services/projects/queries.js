import { useQuery } from '@tanstack/vue-query'
import { api } from '@/lib/api'

async function fetchProjects() {
  return api.get('project').json()
}

async function fetchProject(id) {
  return api.get(`project/${id}`).json()
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
