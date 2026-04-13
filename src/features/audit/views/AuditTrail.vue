<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { RefreshCw, Loader2 } from 'lucide-vue-next'
import DataTable from '@/shared/components/DataTable.vue'
import auditService from '@/features/audit/services/auditService.js'

const toast = useToast()
const loading = ref(false)
const activeTab = ref('general')

const generalActions = ref([])
const closeActions = ref([])
const cancelActions = ref([])
const ioActions = ref([])

const auditTabs = [
  { key: 'general', label: 'Acciones Generales' },
  { key: 'cierres', label: 'Cierres / Pausas' },
  { key: 'cancelaciones', label: 'Cancelaciones' },
  { key: 'io', label: 'Importación / Exportación' },
]

const generalColumns = [
  { field: 'user', header: 'Usuario', sortable: true },
  { field: 'action', header: 'Acción Realizada', sortable: true, type: 'badge' },
  { field: 'date', header: 'Fecha', sortable: true },
  { field: 'ip', header: 'IP (v4)', sortable: false },
  { field: 'affectedTable', header: 'Tabla Afectada', sortable: true },
]

const closeColumns = [
  { field: 'user', header: 'Usuario', sortable: true },
  { field: 'action', header: 'Acción Realizada', sortable: true, type: 'badge' },
  { field: 'date', header: 'Fecha', sortable: true },
  { field: 'ip', header: 'IP (v4)', sortable: false },
  { field: 'affectedRowId', header: 'ID Fila Afectada', sortable: false },
]

const cancelColumns = [
  { field: 'user', header: 'Usuario', sortable: true },
  { field: 'action', header: 'Acción Realizada', sortable: true, type: 'badge' },
  { field: 'date', header: 'Fecha', sortable: true },
  { field: 'ip', header: 'IP (v4)', sortable: false },
  { field: 'affectedTable', header: 'Tabla Afectada', sortable: true },
  { field: 'affectedRowId', header: 'ID Fila Afectada', sortable: false },
]

const ioColumns = [
  { field: 'user', header: 'Usuario', sortable: true },
  { field: 'action', header: 'Acción', sortable: true, type: 'badge' },
  { field: 'date', header: 'Fecha', sortable: true },
  { field: 'hasErrors', header: 'Errores', sortable: false, type: 'boolean' },
  { field: 'ip', header: 'IP (v4)', sortable: false },
  { field: 'comment', header: 'Comentario', sortable: false },
]

const loadAllData = async () => {
  loading.value = true
  try {
    const [general, close, cancel, io] = await Promise.allSettled([
      auditService.getGeneralActions(),
      auditService.getCloseActions(),
      auditService.getCancelActions(),
      auditService.getIOActions()
    ])
    if (general.status === 'fulfilled') generalActions.value = general.value || []
    if (close.status === 'fulfilled') closeActions.value = close.value || []
    if (cancel.status === 'fulfilled') cancelActions.value = cancel.value || []
    if (io.status === 'fulfilled') ioActions.value = io.value || []
  } catch (error) {
    console.error('Error cargando trazas:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las trazas del sistema', life: 3000 })
  } finally {
    loading.value = false
  }
}

onMounted(loadAllData)
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Auditar Sistema</h1>
      <button
        @click="loadAllData"
        :disabled="loading"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
        <RefreshCw v-else class="w-4 h-4" />
        Actualizar
      </button>
    </div>

    <!-- Tabs card -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <!-- Tab nav -->
      <div class="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
        <button
          v-for="tab in auditTabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2"
          :class="activeTab === tab.key
            ? 'border-brand-500 text-brand-500'
            : 'border-transparent text-gray-500 hover:text-gray-700'"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab content -->
      <div class="p-6">
        <DataTable
          v-if="activeTab === 'general'"
          :columns="generalColumns"
          :items="generalActions"
          :loading="loading"
          :show-actions="false"
          :default-rows="10"
        />
        <DataTable
          v-else-if="activeTab === 'cierres'"
          :columns="closeColumns"
          :items="closeActions"
          :loading="loading"
          :show-actions="false"
          :default-rows="10"
        />
        <DataTable
          v-else-if="activeTab === 'cancelaciones'"
          :columns="cancelColumns"
          :items="cancelActions"
          :loading="loading"
          :show-actions="false"
          :default-rows="10"
        />
        <DataTable
          v-else-if="activeTab === 'io'"
          :columns="ioColumns"
          :items="ioActions"
          :loading="loading"
          :show-actions="false"
          :default-rows="10"
        />
      </div>
    </div>
  </div>
</template>
