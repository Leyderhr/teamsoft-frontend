<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { ArrowLeft, Loader2, FileText, BarChart2 } from 'lucide-vue-next'
import DataTable from '@/shared/components/DataTable.vue'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import reportService from '@/features/reports/services/reportService.js'

const { t } = useI18n()
const toast = useToast()
const loading = ref(false)
const loadingTeam = ref(false)

const finishedProjects = ref([])
const selectedProject = ref(null)
const showReport = ref(false)
const teamMembers = ref([])

const projectColumns = computed(() => [
  { field: 'projectName', header: t('features.projects.nameLabel'), sortable: true },
  { field: 'initialDate', header: t('features.reports.finishedTeams.startDate'), sortable: true },
  { field: 'state', header: t('features.reports.finishedTeams.state'), type: 'badge', sortable: true },
])

const teamColumns = computed(() => [
  { field: 'fullName', header: t('features.reports.finishedTeams.name'), sortable: true },
  { field: 'roleName', header: t('features.projects.structure.role'), sortable: true },
  { field: 'evaluation', header: t('features.reports.finishedTeams.evaluation'), sortable: true },
])

const loadFinishedProjects = async () => {
  loading.value = true
  try {
    const { default: projectService } = await import('@/features/projects/services/projectService.js')
    finishedProjects.value = await projectService.getByState('CLOSED')
  } catch (e) {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('features.reports.finishedTeams.loadError'), life: 3000 })
  } finally {
    loading.value = false
  }
}

const handleSeeReport = async (project) => {
  if (!project) {
    toast.add({ severity: 'warn', summary: t('common.notice'), detail: t('features.reports.finishedTeams.selectTeam'), life: 3000 })
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
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('features.reports.finishedTeams.teamLoadError'), life: 3000 })
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
      :page-title="showReport ? t('features.reports.finishedTeams.teamTitle') : t('features.reports.finishedTeams.title')"
      :items="showReport ? [{ label: t('features.reports.finishedTeams.title') }] : []"
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
        {{ t('common.back') }}
      </button>

      <!-- Cabecera del proyecto -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-base font-semibold text-gray-800">{{ selectedProject.projectName }}</h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700">
            <div>
              <span class="font-medium text-gray-500 block mb-0.5">{{ t('features.reports.finishedTeams.startDate') }}</span>
              <span>{{ selectedProject.initialDate || '—' }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-500 block mb-0.5">{{ t('features.reports.finishedTeams.endDate') }}</span>
              <span>{{ selectedProject.endDate || '—' }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-500 block mb-0.5">{{ t('features.reports.finishedTeams.state') }}</span>
              <span>{{ selectedProject.state || '—' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de miembros del equipo -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-base font-semibold text-gray-800">{{ t('features.reports.finishedTeams.teamMembers') }}</h3>
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
