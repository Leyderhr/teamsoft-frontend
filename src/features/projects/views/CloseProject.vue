<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { Lock, RefreshCw, Loader2, Search, AlertTriangle } from 'lucide-vue-next'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import projectService from '@/features/projects/services/projectService.js'

const toast = useToast()

const projects      = ref([])
const loading       = ref(false)
const selectedId    = ref(null)
const searchQuery   = ref('')
const showConfirm   = ref(false)
const closing       = ref(false)

// ---- Carga de datos ----
async function loadProjects() {
  loading.value = true
  try {
    projects.value = await projectService.getAll()
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los proyectos', life: 3000 })
  } finally {
    loading.value = false
  }
}

onMounted(loadProjects)

// ---- Filtro ----
const filteredProjects = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return projects.value
  return projects.value.filter(p =>
    p.projectName?.toLowerCase().includes(q) ||
    p.client?.entityName?.toLowerCase().includes(q) ||
    p.county?.countyName?.toLowerCase().includes(q)
  )
})

// ---- Helpers de estado ----
function statusLabel(p) {
  if (p.close)    return 'Cerrado'
  if (p.finalize) return 'Finalizado'
  return 'Activo'
}

function statusClass(p) {
  if (p.close)    return 'bg-error-50 text-error-700 ring-1 ring-error-200'
  if (p.finalize) return 'bg-warning-50 text-warning-700 ring-1 ring-warning-200'
  return 'bg-success-50 text-success-700 ring-1 ring-success-200'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES')
}

// ---- Selección ----
const selectedProject = computed(() => projects.value.find(p => p.id === selectedId.value) ?? null)
const canClose = computed(() => selectedProject.value !== null && !selectedProject.value.close)

function selectRow(p) {
  selectedId.value = selectedId.value === p.id ? null : p.id
}

// ---- Cerrar proyecto ----
async function doClose() {
  if (!selectedProject.value) return
  closing.value = true
  try {
    await projectService.close(selectedProject.value.id)
    toast.add({
      severity: 'success',
      summary: 'Proyecto cerrado',
      detail: `"${selectedProject.value.projectName}" ha sido cerrado correctamente`,
      life: 4000,
    })
    selectedId.value = null
    showConfirm.value = false
    await loadProjects()
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error al cerrar',
      detail: e?.message || 'No se pudo cerrar el proyecto',
      life: 4000,
    })
  } finally {
    closing.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageBreadcrumb page-title="Cerrar Proyecto" />

    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
        <h2 class="text-base font-semibold text-gray-800">Lista de Proyectos</h2>
        <div class="flex items-center gap-3 flex-wrap">
          <!-- Buscador -->
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar proyecto..."
              class="pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors w-56"
            />
          </div>
          <!-- Actualizar -->
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
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provincia</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Inicio</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <!-- Loading -->
            <tr v-if="loading">
              <td colspan="6" class="px-4 py-10 text-center">
                <div class="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <Loader2 class="w-5 h-5 animate-spin" />
                  Cargando proyectos...
                </div>
              </td>
            </tr>
            <!-- Sin resultados -->
            <tr v-else-if="!filteredProjects.length">
              <td colspan="6" class="px-4 py-10 text-center text-sm text-gray-400">
                Sin proyectos para mostrar
              </td>
            </tr>
            <!-- Filas -->
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
              <td class="px-4 py-3 text-sm text-gray-600">{{ p.client?.entityName || '—' }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ p.county?.countyName || '—' }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ formatDate(p.initialDate) }}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="statusClass(p)">
                  {{ statusLabel(p) }}
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
            <span v-if="selectedProject.close" class="ml-2 text-error-600">(ya está cerrado)</span>
          </span>
          <span v-else class="text-gray-400">Ningún proyecto seleccionado</span>
        </div>
        <button
          type="button"
          :disabled="!canClose"
          @click="showConfirm = true"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-error-500 text-white text-sm font-medium hover:bg-error-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Lock class="w-4 h-4" />
          Cerrar Proyecto
        </button>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <Teleport to="body">
      <div
        v-if="showConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/40" @click="showConfirm = false" />
        <!-- Panel -->
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-error-50 flex items-center justify-center">
              <AlertTriangle class="w-5 h-5 text-error-500" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-900">Confirmar cierre de proyecto</h3>
              <p class="mt-1 text-sm text-gray-500">
                ¿Está seguro de que desea cerrar el proyecto
                <strong class="text-gray-800">«{{ selectedProject?.projectName }}»</strong>?
                Esta acción cambiará su estado a <span class="text-error-600 font-medium">Cerrado</span>.
              </p>
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              @click="showConfirm = false"
              class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              :disabled="closing"
              @click="doClose"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-error-500 text-white text-sm font-medium hover:bg-error-600 disabled:opacity-50 transition-colors"
            >
              <Loader2 v-if="closing" class="w-4 h-4 animate-spin" />
              <Lock v-else class="w-4 h-4" />
              {{ closing ? 'Cerrando...' : 'Sí, cerrar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
