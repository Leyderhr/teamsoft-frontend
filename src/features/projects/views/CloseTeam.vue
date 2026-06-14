<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { RefreshCw, Loader2, Search, Lock } from 'lucide-vue-next'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import projectService from '@/features/projects/services/projectService.js'

const router = useRouter()
const toast = useToast()

const projects    = ref([])
const loading     = ref(false)
const selectedId  = ref(null)
const searchQuery = ref('')

// Solo equipos FINALIZADOS pueden cerrarse
async function loadProjects() {
  loading.value = true
  try {
    projects.value = await projectService.getByState('FINALIZED')
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los equipos finalizados', life: 3000 })
  } finally {
    loading.value = false
  }
}

onMounted(loadProjects)

const filteredProjects = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return projects.value
  return projects.value.filter(p => p.projectName?.toLowerCase().includes(q))
})

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES')
}

const selectedProject = computed(() => projects.value.find(p => p.id === selectedId.value) ?? null)

function selectRow(p) {
  selectedId.value = selectedId.value === p.id ? null : p.id
}

function goEvaluate() {
  if (!selectedProject.value) return
  router.push({ name: 'CloseTeamEvaluate', params: { projectId: selectedProject.value.id } })
}
</script>

<template>
  <div class="space-y-6">
    <PageBreadcrumb page-title="Cerrar Equipo" />

    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
        <h2 class="text-base font-semibold text-gray-800">Equipos finalizados</h2>
        <div class="flex items-center gap-3 flex-wrap">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar equipo..."
              class="pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors w-56"
            />
          </div>
          <button
            type="button"
            @click="loadProjects"
            :disabled="loading"
            class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <RefreshCw class="w-4 h-4" :class="loading ? 'animate-spin' : ''" />
            Actualizar
          </button>
        </div>
      </div>

      <!-- Tabla -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-100">
          <thead class="bg-gray-50">
            <tr>
              <th class="w-10 px-4 py-3"></th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Inicio</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="loading">
              <td colspan="4" class="px-4 py-10 text-center">
                <div class="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <Loader2 class="w-5 h-5 animate-spin" />
                  Cargando equipos...
                </div>
              </td>
            </tr>
            <tr v-else-if="!filteredProjects.length">
              <td colspan="4" class="px-4 py-10 text-center text-sm text-gray-400">
                No hay equipos finalizados para cerrar
              </td>
            </tr>
            <tr
              v-else
              v-for="p in filteredProjects"
              :key="p.id"
              class="hover:bg-gray-50 cursor-pointer transition-colors"
              :class="selectedId === p.id ? 'bg-brand-50' : ''"
              @click="selectRow(p)"
            >
              <td class="px-4 py-3">
                <input
                  type="radio"
                  :value="p.id"
                  v-model="selectedId"
                  class="w-4 h-4 text-brand-500 border-gray-300 focus:ring-brand-500/20 cursor-pointer"
                  @click.stop
                />
              </td>
              <td class="px-4 py-3 text-sm font-medium text-gray-800">{{ p.projectName }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ formatDate(p.initialDate) }}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-light-50 text-blue-light-700 ring-1 ring-blue-light-200">
                  Finalizado
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer de acciones -->
      <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-4 flex-wrap">
        <div class="text-sm text-gray-500">
          <span v-if="selectedProject">
            Seleccionado: <strong class="text-gray-800">{{ selectedProject.projectName }}</strong>
          </span>
          <span v-else class="text-gray-400">Ningún equipo seleccionado</span>
        </div>
        <button
          type="button"
          :disabled="!selectedProject"
          @click="goEvaluate"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Lock class="w-4 h-4" />
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>
