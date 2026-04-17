import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '@/lib/api'

async function createProjects(projectsData) {
  return api.post('project', { json: projectsData }).json()
}

async function updateProject({ id, data }) {
  return api.put(`project/${id}`, { json: data }).json()
}

async function closeProject(id) {
  return api.put(`project/close/${id}`).json()
}

async function deleteProject(id) {
  return api.delete(`project/${id}`).json()
}

export function useCreateProjects() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createProjects,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useCloseProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: closeProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
