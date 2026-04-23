import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '@/lib/api'

async function createRole(roleData) {
  return api.post('role', { json: roleData }).json()
}

async function updateRole({ id, data }) {
  return api.put(`role/${id}`, { json: data }).json()
}

async function deleteRole(id) {
  return api.delete(`role/${id}`).json()
}

async function importRoles({ file, updateIfExist }) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('updateIfExist', updateIfExist)
  return api.post('role/import', { body: formData }).json()
}

async function exportRoles() {
  return api.get('role/export').blob()
}

export function useCreateRole() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}

export function useImportRoles() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: importRoles,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}

export function useExportRoles() {
  return useMutation({
    mutationFn: exportRoles,
  })
}
