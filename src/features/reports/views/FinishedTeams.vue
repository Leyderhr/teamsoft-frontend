<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { ArrowLeft, Loader2, FileText, BarChart2 } from 'lucide-vue-next'
import DataTable from '@/shared/components/DataTable.vue'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import reportService from '@/features/reports/services/reportService.js'

const toast = useToast()
const loading = ref(false)
const loadingTeam = ref(false)

const finishedProjects = ref([])
const selectedProject = ref(null)
const showReport = ref(false)
const teamMembers = ref([])

const projectColumns = [
  { field: 'projectName', header: 'Nombre del Proyecto', sortable: true },
  { field: 'initialDate', header: 'Fecha Inicio', sortable: true },
  { field: 'state', header: 'Estado', type: 'badge', sortable: true },
]

const teamColumns = [
  { field: 'fullName', header: 'Nombre', sortable: true },
  { field: 'roleName', header: 'Rol', sortable: true },
  { field: 'evaluation', header: 'Evaluación', sortable: true },
]

const loadFinishedProjects = async () => {
  loading.value = true
  try {
    const { default: projectService } = await import('@/features/projects/services/projectService.js')
    finishedProjects.value = await projectService.getByState('CLOSED')
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los equipos cerrados', life: 3000 })
  } finally {
    loading.value = false
  }
}

const handleSeeReport = async (project) => {
  if (!project) {
    toast.add({ severity: 'warn', summary: 'Aviso', detail: 'Seleccione un equipo para ver el reporte', life: 3000 })
    return
  }
  selectedProject.value = project
  showReport.value = true
  loadingTeam.value = true
  try {
    const data = await reportService.getProjectDetail(project.id)
    selectedProject.value = data
    teamMembers.value = (data.members ?? []).map(m => ({
      fullName: `${m.person?.personName ?? ''} ${m.person?.surName ?? ''}`.trim(),
      roleName: m.role?.roleName ?? '—',
      evaluation: m.evaluation ?? '—',
    }))
  } catch (error) {
    console.error('Error cargando equipo:', error)
    teamMembers.value = []
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el equipo del proyecto', life: 3000 })
  } finally {
    loadingTeam.value = false
  }
}

const goBack = () => {
  showReport.value = false
  teamMembers.value = []
}

onMounted(loadFinishedProjects)
</script>

<template>
  <div>
    <PageBreadcrumb
      :page-title="showReport ? 'Equipo del Proyecto' : 'Equipos Cerrados'"
      :items="showReport ? [{ label: 'Equipos Cerrados' }] : []"
    />

    <!-- Step 1: selección de proyecto finalizado -->
    <div v-if="!showReport" class="space-y-4">
      <div>
        <DataTable
          :columns="projectColumns"
          :items="finishedProjects"
          :loading="loading"
          :show-actions="false"
          :show-report-button="true"
          :default-rows="10"
          @report="handleSeeReport"
        />
      </div>
    </div>

    <!-- Step 2: reporte del equipo -->
    <div v-else class="space-y-5">
      <button @click="goBack" class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-500 transition-colors">
        <ArrowLeft class="w-4 h-4" />
        Volver
      </button>

      <!-- Cabecera del proyecto -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-base font-semibold text-gray-800">{{ selectedProject.projectName }}</h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700">
            <div>
              <span class="font-medium text-gray-500 block mb-0.5">Fecha Inicio</span>
              <span>{{ selectedProject.initialDate || '—' }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-500 block mb-0.5">Fecha Fin</span>
              <span>{{ selectedProject.endDate || '—' }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-500 block mb-0.5">Estado</span>
              <span>{{ selectedProject.state || '—' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de miembros del equipo -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-base font-semibold text-gray-800">Miembros del Equipo</h3>
        </div>
        <div class="p-6">
          <DataTable
            :columns="teamColumns"
            :items="teamMembers"
            :loading="loadingTeam"
            :show-actions="false"
            :default-rows="10"
          />
        </div>
      </div>
    </div>
  </div>
</template>
