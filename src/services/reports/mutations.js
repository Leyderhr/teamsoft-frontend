import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '@/lib/api'

async function generateReport(data) {
  return api.post('reports', { json: data }).json()
}

async function exportReport(id, format) {
  return api.get(`reports/${id}/export?format=${format}`).blob()
}

export function useGenerateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: generateReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({ id, format }) => exportReport(id, format),
  })
}
