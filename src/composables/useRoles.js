import { useQuery, useMutation } from '@tanstack/vue-query'
import { queryClient } from '@/lib/query-client'
import {
  fetchGetRoles,
  fetchGetRoleById,
  fetchCreateRole,
  fetchUpdateRole,
  fetchDeleteRole,
  fetchImportRoles,
  fetchExportRoles
} from '@/services/roles'

export function useRoles() {
  const { data: roles, isLoading, error, refetch } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchGetRoles
  })

  const createMutation = useMutation({
    mutationFn: fetchCreateRole,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] })
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => fetchUpdateRole(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] })
  })

  const deleteMutation = useMutation({
    mutationFn: fetchDeleteRole,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] })
  })

  const importMutation = useMutation({
    mutationFn: ({ file, updateIfExist }) => fetchImportRoles(file, updateIfExist),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] })
  })

  return {
    roles,
    isLoading,
    error,
    refetch,
    createRole: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateRole: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteRole: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    importRoles: importMutation.mutate,
    isImporting: importMutation.isPending,
    exportRoles: fetchExportRoles
  }
}

export function useRole(roleId) {
  const { data: role, isLoading, error } = useQuery({
    queryKey: ['roles', roleId],
    queryFn: () => fetchGetRoleById(roleId.value),
    enabled: () => !!roleId.value
  })

  return { role, isLoading, error }
}
