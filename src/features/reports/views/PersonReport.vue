<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { ArrowLeft, User, Mail, CreditCard, Activity, Loader2 } from 'lucide-vue-next'
import reportService from '@/features/reports/services/reportService.js'
import DataTable from '@/shared/components/DataTable.vue'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'

const { t } = useI18n()
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
  { field: 'personName', header: t('features.persons.fields.name'), sortable: true },
  { field: 'surName', header: t('features.persons.fields.surname'), sortable: true },
  { field: 'card', header: t('features.persons.fields.card'), sortable: true },
  { field: 'email', header: t('features.persons.fields.email'), sortable: true },
  { field: 'phone', header: t('features.persons.fields.phone') },
  { field: 'sex', header: t('features.persons.fields.sex') },
  { field: 'inDate', header: t('features.persons.fields.inDate'), sortable: true },
  { field: 'workload', header: 'Carga' },
  { field: 'experience', header: t('features.persons.fields.experience') },
  { field: 'status', header: 'Estado', type: 'badge', sortable: true },
  { field: 'county.countyName', header: t('features.persons.fields.county'), sortable: true },
  { field: 'group.name', header: t('features.persons.fields.group'), sortable: true },
  { field: 'race.raceName', header: t('features.persons.fields.race'), sortable: true },
  { field: 'nacionality.gentilicioNac', header: t('features.persons.fields.nacionality'), sortable: true },
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
      toast.add({ severity: 'error', summary: t('common.error'), detail: t('common.loadError'), life: 3000 })
    }
  } finally {
    loading.value = false
  }
}

const report = ref(null)

const handleSeeReport = async (item) => {
  if (!item) return
  selectedWorker.value = item
  selectedProject.value = null
  rolesInProject.value = []
  showDetail.value = true
  loadingDetail.value = true
  try {
    report.value = await reportService.getPersonDetail(item.id)
    if (report.value?.person) selectedWorker.value = report.value.person
    // Proyectos distintos en los que ha participado
    const byProject = new Map()
    for (const p of report.value?.participations ?? []) {
      if (p.project && !byProject.has(p.project.id)) byProject.set(p.project.id, p.project)
    }
    workerProjects.value = [...byProject.values()]
  } catch {
    report.value = null
    workerProjects.value = []
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('common.loadError'), life: 3000 })
  } finally {
    loadingDetail.value = false
  }
}

const handleProjectSelect = (project) => {
  selectedProject.value = project
  // Roles desempeñados por la persona en el proyecto seleccionado
  rolesInProject.value = (report.value?.participations ?? [])
    .filter(p => p.project?.id === project.id)
    .map(p => ({ roleName: p.role?.roleName, roleEvaluation: p.evaluation }))
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
        :show-report-button="true"
        :default-rows="10"
        @report="handleSeeReport"
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
              <p class="text-xs text-gray-400">{{ t('features.persons.fields.card') }}</p>
              <p class="text-sm font-medium text-gray-700">{{ selectedWorker.card || '—' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Mail class="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div>
              <p class="text-xs text-gray-400">{{ t('features.persons.fields.email') }}</p>
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
