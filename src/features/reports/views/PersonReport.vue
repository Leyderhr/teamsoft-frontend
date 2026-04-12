<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { ArrowLeft, User, Mail, CreditCard, Activity, Loader2 } from 'lucide-vue-next'
import reportService from '@/features/reports/services/reportService.js'
import DataTable from '@/shared/components/DataTable.vue'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'

const toast = useToast()
const loading = ref(false)
const loadingDetail = ref(false)
const workers = ref([])
const selectedWorker = ref(null)
const workerProjects = ref([])
const selectedProject = ref(null)
const rolesInProject = ref([])
const showDetail = ref(false)

// Columnas para la tabla de trabajadores
const workerColumns = [
  { field: 'personName', header: 'Nombre', sortable: true },
  { field: 'surName', header: 'Apellidos', sortable: true },
  { field: 'card', header: 'Carné', sortable: true },
  { field: 'email', header: 'Correo', sortable: true },
  { field: 'phone', header: 'Teléfono' },
  { field: 'sex', header: 'Sexo' },
  { field: 'inDate', header: 'Fecha Entrada', sortable: true },
  { field: 'workload', header: 'Carga' },
  { field: 'experience', header: 'Experiencia' },
  { field: 'status', header: 'Estado', type: 'badge', sortable: true },
  { field: 'countyFk.countyName', header: 'Provincia', sortable: true },
  { field: 'groupFk.name', header: 'Grupo', sortable: true },
  { field: 'raceFk.raceName', header: 'Raza', sortable: true },
  { field: 'nacionalityFk.gentilicioNac', header: 'Nacionalidad', sortable: true },
]

const loadWorkers = async () => {
  loading.value = true
  try {
    workers.value = await reportService.getPersonReport()
  } catch (error) {
    console.error('Error cargando reporte de personas:', error)
    try {
      const { default: personService } = await import('@/features/persons/services/personService.js')
      workers.value = await personService.getAll()
    } catch {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el reporte de personas', life: 3000 })
    }
  } finally {
    loading.value = false
  }
}

const handleWorkerSelect = async (item) => {
  if (!item) return
  selectedWorker.value = item
  selectedProject.value = null
  rolesInProject.value = []
  showDetail.value = true
  loadingDetail.value = true
  try {
    workerProjects.value = await reportService.getPersonProjects(item.id)
  } catch {
    workerProjects.value = []
  } finally {
    loadingDetail.value = false
  }
}

const handleProjectSelect = async (project) => {
  selectedProject.value = project
  loadingDetail.value = true
  try {
    rolesInProject.value = await reportService.getPersonRolesInProject(selectedWorker.value.id, project.id)
  } catch {
    rolesInProject.value = []
  } finally {
    loadingDetail.value = false
  }
}

const goBack = () => {
  showDetail.value = false
  selectedWorker.value = null
  workerProjects.value = []
  rolesInProject.value = []
  selectedProject.value = null
}

onMounted(loadWorkers)
</script>

<template>
  <div class="space-y-6">

    <!-- Breadcrumb + título -->
    <PageBreadcrumb
      :page-title="showDetail ? (selectedWorker?.personName + ' ' + selectedWorker?.surName) : 'Reporte de Personas'"
      :items="showDetail ? [{ label: 'Reporte de Personas' }] : []"
    />

    <!-- ── Vista principal: lista de trabajadores ── -->
    <div v-if="!showDetail">
      <DataTable
        :columns="workerColumns"
        :items="workers"
        :loading="loading"
        :show-actions="false"
        :default-rows="10"
        @row-select="handleWorkerSelect"
      />
    </div>

    <!-- ── Vista detalle: perfil + proyectos + roles ── -->
    <div v-else class="space-y-6">

      <!-- Botón volver -->
      <div>
        <button
          @click="goBack"
          class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-500 transition-colors"
        >
          <ArrowLeft class="w-4 h-4" />
          Volver al listado
        </button>
      </div>

      <!-- Tarjeta de información del trabajador -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-xs overflow-hidden">
        <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-brand-500">
          <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <User class="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-white">
              {{ selectedWorker.personName }} {{ selectedWorker.surName }}
            </h3>
            <p class="text-white/70 text-sm">{{ selectedWorker.status }}</p>
          </div>
        </div>
        <div class="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="flex items-center gap-2">
            <CreditCard class="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div>
              <p class="text-xs text-gray-400">Carné</p>
              <p class="text-sm font-medium text-gray-700">{{ selectedWorker.card || '—' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Mail class="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div>
              <p class="text-xs text-gray-400">Correo</p>
              <p class="text-sm font-medium text-gray-700">{{ selectedWorker.email || '—' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Activity class="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div>
              <p class="text-xs text-gray-400">Carga de trabajo</p>
              <p class="text-sm font-medium text-gray-700">{{ selectedWorker.workload || '—' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid: Proyectos + Roles -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Proyectos del trabajador -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-xs overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h4 class="text-sm font-semibold text-gray-700">Proyectos asignados</h4>
          </div>

          <div v-if="loadingDetail" class="flex items-center justify-center py-10">
            <Loader2 class="w-5 h-5 text-brand-500 animate-spin" />
          </div>

          <div v-else-if="!workerProjects.length" class="px-5 py-10 text-center text-sm text-gray-400">
            Sin proyectos asignados
          </div>

          <ul v-else class="divide-y divide-gray-100">
            <li
              v-for="project in workerProjects"
              :key="project.id"
              @click="handleProjectSelect(project)"
              class="px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
              :class="selectedProject?.id === project.id ? 'bg-brand-50' : ''"
            >
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-700 truncate">{{ project.projectName }}</p>
                <p v-if="project.evaluation != null" class="text-xs text-gray-400">
                  Evaluación: {{ project.evaluation }}
                </p>
              </div>
              <div
                class="w-2 h-2 rounded-full flex-shrink-0 ml-3"
                :class="selectedProject?.id === project.id ? 'bg-brand-500' : 'bg-gray-200'"
              ></div>
            </li>
          </ul>
        </div>

        <!-- Roles en el proyecto seleccionado -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-xs overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h4 class="text-sm font-semibold text-gray-700">
              Roles en
              <span class="text-brand-600">{{ selectedProject?.projectName || 'proyecto seleccionado' }}</span>
            </h4>
          </div>

          <div v-if="loadingDetail" class="flex items-center justify-center py-10">
            <Loader2 class="w-5 h-5 text-brand-500 animate-spin" />
          </div>

          <div v-else-if="!selectedProject" class="px-5 py-10 text-center text-sm text-gray-400">
            Seleccione un proyecto para ver los roles
          </div>

          <div v-else-if="!rolesInProject.length" class="px-5 py-10 text-center text-sm text-gray-400">
            Sin roles en este proyecto
          </div>

          <ul v-else class="divide-y divide-gray-100">
            <li
              v-for="(role, idx) in rolesInProject"
              :key="idx"
              class="px-5 py-3"
            >
              <p class="text-sm font-medium text-gray-700">{{ role.roleName || '—' }}</p>
              <p v-if="role.roleEvaluation != null" class="text-xs text-gray-400">
                Evaluación: {{ role.roleEvaluation }}
              </p>
            </li>
          </ul>
        </div>

      </div>
    </div>

  </div>
</template>
