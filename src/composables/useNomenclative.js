import { useQuery, useMutation } from '@tanstack/vue-query'
import { queryClient } from '@/lib/query-client'

/**
 * Composable genérico para nomenclativos (catálogos)
 * @param {string} queryKey - Clave para el cache de TanStack Query
 * @param {Function} fetchFn - Función para obtener datos
 * @param {Function} createFn - Función para crear
 * @param {Function} updateFn - Función para actualizar
 * @param {Function} deleteFn - Función para eliminar
 */
export function useNomenclative(queryKey, fetchFn, createFn, updateFn, deleteFn) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [queryKey],
    queryFn: fetchFn
  })

  const createMutation = useMutation({
    mutationFn: createFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] })
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateFn(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] })
  })

  const deleteMutation = useMutation({
    mutationFn: deleteFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] })
  })

  return {
    data,
    isLoading,
    error,
    refetch,
    create: createMutation.mutate,
    isCreating: createMutation.isPending,
    update: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    remove: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending
  }
}
