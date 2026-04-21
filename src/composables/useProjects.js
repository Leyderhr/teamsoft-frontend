import { useQuery, useMutation } from '@tanstack/vue-query'
import { queryClient } from '@/lib/query-client'
import {
  fetchGetProjects,
  fetchGetProjectById,
  fetchCreateProjects,
  fetchUpdateProject,
  fetchCloseProject,
  fetchDeleteProject
} from '@/services/projects'

export function useProjects() {
  const { data: projects, isLoading, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchGetProjects
  })

  const createMutation = useMutation({
    mutationFn: fetchCreateProjects,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => fetchUpdateProject(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
  })

  const closeMutation = useMutation({
    mutationFn: fetchCloseProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
  })

  const deleteMutation = useMutation({
    mutationFn: fetchDeleteProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
  })

  return {
    projects,
    isLoading,
    error,
    refetch,
    createProjects: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateProject: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    closeProject: closeMutation.mutate,
    isClosing: closeMutation.isPending,
    deleteProject: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending
  }
}

export function useProject(projectId) {
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => fetchGetProjectById(projectId.value),
    enabled: () => !!projectId.value
  })

  return { project, isLoading, error }
}
