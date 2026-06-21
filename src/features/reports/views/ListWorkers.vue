<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { Search, RefreshCw, Plus, Trash2, Loader2 } from 'lucide-vue-next'
import AppSelect from '@/components/ui/AppSelect.vue'
import DataTable from '@/shared/components/DataTable.vue'
import reportService from '@/features/reports/services/reportService.js'
import roleService from '@/features/roles/services/roleService.js'
import projectService from '@/features/projects/services/projectService.js'
import competenceService from '@/features/competences/services/competenceService.js'
import levelsService from '@/features/nomenclatives/services/levelsService.js'

const { t } = useI18n()
const toast = useToast()
const loading = ref(false)
const loadingFilters = ref(false)
const activeFilterTab = ref('roles')

// Filter options
const roleOptions = ref([])
const projectOptions = ref([])
const competenceOptions = ref([])
const levelOptions = ref([])

// Filter selections
const selectedRoles = ref([])
const selectedProjects = ref([])
const selectedCompetence = ref('')
const selectedLevel = ref('')
const selectedMbtiTypes = ref([])
const minAge = ref(null)
const maxAge = ref(null)

// Temporary selections for adding
const tempRoleId = ref(null)
const tempProjectId = ref(null)

// Preference for roles and projects
const rolePreferences = ref({}) // { roleId: true/false }
const projectPreferences = ref({}) // { projectId: true/false }

const belbinOptions = computed(() => [
  { label: t('features.reports.belbin.favorite'), value: 'F' },
  { label: t('features.reports.belbin.avoided'), value: 'E' },
  { label: t('features.reports.belbin.indifferent'), value: 'I' }
])
const belbin = ref({ e_S: null, i_M: null, c_O: null, i_S: null, c_E: null, i_R: null, m_E: null, c_H: null, i_F: null })

const filterCompetences = ref([])

const mbtiOptions = [
  'ESTJ', 'ENTJ', 'ESFJ', 'ENFJ', 'ESTP', 'ENTP', 'ESFP', 'ENFP',
  'ISTJ', 'INTJ', 'ISFJ', 'INFJ', 'ISTP', 'INTP', 'ISFP', 'INFP'
]

const workers = ref([])
const searched = ref(false)

const belbinRoleLabels = computed(() => [
  { key: 'e_S', label: t('features.reports.belbin.roles.specialist') },
  { key: 'i_M', label: t('features.reports.belbin.roles.implementer') },
  { key: 'c_O', label: t('features.reports.belbin.roles.coordinator') },
  { key: 'i_S', label: t('features.reports.belbin.roles.teamworker') },
  { key: 'c_E', label: t('features.reports.belbin.roles.plant') },
  { key: 'i_R', label: t('features.reports.belbin.roles.resourceInvestigator') },
  { key: 'm_E', label: t('features.reports.belbin.roles.monitorEvaluator') },
  { key: 'c_H', label: t('features.reports.belbin.roles.shaper') },
  { key: 'i_F', label: t('features.reports.belbin.roles.completerFinisher') }
])

const filterTabs = computed(() => [
  { key: 'roles', label: t('features.reports.tabs.roles') },
  { key: 'proyectos', label: t('features.reports.tabs.projects') },
  { key: 'competencias', label: t('features.reports.tabs.competences') },
  { key: 'mbti', label: t('features.reports.tabs.mbti') },
  { key: 'belbin', label: t('features.reports.tabs.belbin') },
])

const workerColumns = computed(() => [
  { field: 'card', header: t('common.columns.idCard'), sortable: true },
  { field: 'personName', header: t('common.columns.name'), sortable: true },
  { field: 'surName', header: t('common.fields.surname'), sortable: true },
  { field: 'sex', header: t('common.fields.sex'), sortable: false },
  { field: 'age', header: t('common.fields.age'), sortable: true },
  { field: 'ageGroup.ageGroupName', header: t('common.fields.ageGroup'), sortable: true },
  { field: 'nacionality.gentilicioNac', header: t('common.fields.nationality'), sortable: true },
  { field: 'personTest.mbtiType', header: t('features.reports.fields.mbti'), sortable: true },
])

// Computed options for AppSelect
const roleSelectOptions = computed(() => 
  roleOptions.value.map(r => ({ value: r.id, label: r.roleName }))
)

const projectSelectOptions = computed(() => 
  projectOptions.value.map(p => ({ value: p.id, label: p.projectName }))
)

const competenceSelectOptions = computed(() => [
  { value: '', label: t('features.reports.placeholders.selectCompetence') },
  ...competenceOptions.value.map(c => ({ value: c.id, label: c.competitionName }))
])

const levelSelectOptions = computed(() => [
  { value: '', label: t('features.reports.options.noLevel') },
  ...levelOptions.value.map(l => ({ value: l.id, label: l.significance }))
])

const belbinSelectOptions = computed(() => [
  { value: null, label: t('features.reports.options.noFilter') },
  ...belbinOptions.value.map(opt => ({ value: opt.value, label: opt.label }))
])

const loadFilterOptions = async () => {
  loadingFilters.value = true
  try {
    const [roles, projects, competences, levels] = await Promise.allSettled([
      roleService.getAll(),
      projectService.getAll(),
      competenceService.getAll(),
      levelsService.getAll()
    ])
    if (roles.status === 'fulfilled') roleOptions.value = roles.value
    if (projects.status === 'fulfilled') projectOptions.value = projects.value
    if (competences.status === 'fulfilled') competenceOptions.value = competences.value
    if (levels.status === 'fulfilled') levelOptions.value = levels.value
  } catch (error) {
    console.error('Error cargando opciones de filtro:', error)
  } finally {
    loadingFilters.value = false
  }
}

const addRole = (roleId) => {
  if (!roleId || selectedRoles.value.includes(roleId)) return
  selectedRoles.value.push(roleId)
  rolePreferences.value[roleId] = true // Default preference
}

const removeRole = (roleId) => {
  selectedRoles.value = selectedRoles.value.filter(id => id !== roleId)
  delete rolePreferences.value[roleId]
}

const addProject = (projectId) => {
  if (!projectId || selectedProjects.value.includes(projectId)) return
  selectedProjects.value.push(projectId)
  projectPreferences.value[projectId] = true // Default preference
}

const removeProject = (projectId) => {
  selectedProjects.value = selectedProjects.value.filter(id => id !== projectId)
  delete projectPreferences.value[projectId]
}

const addCompetenceFilter = () => {
  if (!selectedCompetence.value || !selectedLevel.value) {
    toast.add({
      severity: 'warn',
      summary: t('common.validation'),
      detail: t('features.reports.validation.competenceLevelRequired'),
      life: 3000
    })
    return
  }
  const comp = competenceOptions.value.find(c => c.id === selectedCompetence.value)
  const level = levelOptions.value.find(l => l.id === selectedLevel.value)
  if (!comp || !level) return
  
  filterCompetences.value.push({
    competenceId: selectedCompetence.value,
    levelId: selectedLevel.value,
    label: `${comp.competitionName} - ${level.significance}`
  })
  selectedCompetence.value = ''
  selectedLevel.value = ''
}

const removeCompetence = (index) => {
  filterCompetences.value.splice(index, 1)
}

const handleSearch = async () => {
  loading.value = true
  searched.value = true
  try {
    const payload = {}
    
    // Role interests
    if (selectedRoles.value.length) {
      payload.roleInterests = selectedRoles.value.map(roleId => ({
        roleId,
        preference: rolePreferences.value[roleId] ?? true
      }))
    }
    
    // Project interests
    if (selectedProjects.value.length) {
      payload.projectInterests = selectedProjects.value.map(projectId => ({
        projectId,
        preference: projectPreferences.value[projectId] ?? true
      }))
    }
    
    // Competence levels
    if (filterCompetences.value.length) {
      payload.competenceLevels = filterCompetences.value.map(c => ({
        competenceId: c.competenceId,
        levelId: c.levelId
      }))
    }
    
    // MBTI types
    if (selectedMbtiTypes.value.length) {
      payload.mbtiTypes = selectedMbtiTypes.value
    }
    
    // Belbin (only send non-null values)
    const belbinFilters = Object.fromEntries(
      Object.entries(belbin.value).filter(([, v]) => v !== null)
    )
    if (Object.keys(belbinFilters).length) {
      payload.belbin = belbinFilters
    }
    
    // Age (only if both values are present)
    if (minAge.value !== null && maxAge.value !== null) {
      payload.age = {
        minAge: minAge.value,
        maxAge: maxAge.value
      }
    }
    
    workers.value = await reportService.getFilteredWorkers(payload)
    toast.add({
      severity: 'success',
      summary: t('features.reports.search.completed'),
      detail: t('features.reports.search.resultCount', [workers.value.length]),
      life: 3000
    })
  } catch (error) {
    console.error('Error filtrando trabajadores:', error)
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error?.response?.data?.message || t('features.reports.search.error'),
      life: 3000
    })
    workers.value = []
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  selectedRoles.value = []
  selectedProjects.value = []
  rolePreferences.value = {}
  projectPreferences.value = {}
  filterCompetences.value = []
  selectedMbtiTypes.value = []
  belbin.value = { e_S: null, i_M: null, c_O: null, i_S: null, c_E: null, i_R: null, m_E: null, c_H: null, i_F: null }
  minAge.value = null
  maxAge.value = null
  workers.value = []
  searched.value = false
}

onMounted(loadFilterOptions)
</script>

<template>
  <div>
    <!-- Filters Card -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden mb-6">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-base font-semibold text-gray-800">{{ t('features.reports.searchFilters') }}</h3>
      </div>

      <div class="p-6 space-y-5">
        <!-- Tab nav -->
        <div class="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
          <button
            v-for="tab in filterTabs"
            :key="tab.key"
            @click="activeFilterTab = tab.key"
            class="px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2"
            :class="activeFilterTab === tab.key
              ? 'border-brand-500 text-brand-500'
              : 'border-transparent text-gray-500 hover:text-gray-700'"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab: Roles -->
        <div v-if="activeFilterTab === 'roles'" class="flex flex-col gap-4">
          <div class="flex flex-wrap gap-3 items-end">
            <div class="flex flex-col gap-1.5 flex-1 min-w-[250px]">
              <label class="text-sm font-medium text-gray-700">{{ t('features.reports.selectRole') }}</label>
              <AppSelect
                v-model="tempRoleId"
                :options="roleSelectOptions.filter(r => !selectedRoles.includes(r.value))"
                :placeholder="t('features.reports.placeholders.selectRole')"
                searchable
                :search-placeholder="t('features.reports.placeholders.searchRole')"
              />
            </div>
            <button
              @click="() => { if (tempRoleId) { addRole(tempRoleId); tempRoleId = null } }"
              :disabled="!tempRoleId"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus class="w-4 h-4" />
              {{ t('common.add') }}
            </button>
          </div>

          <div v-if="selectedRoles.length" class="overflow-hidden rounded-xl border border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ t('common.fields.role') }}
                  </th>
                  <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ t('features.reports.preference') }}
                  </th>
                  <th class="w-14 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="roleId in selectedRoles" :key="roleId" class="hover:bg-gray-50">
                  <td class="px-5 py-3 text-sm text-gray-700">
                    {{ roleOptions.find(r => r.id === roleId)?.roleName }}
                  </td>
                  <td class="px-5 py-3">
                    <label class="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        v-model="rolePreferences[roleId]"
                        class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20"
                      />
                      <span class="text-sm text-gray-600">
                        {{ rolePreferences[roleId] ? t('features.reports.interested') : t('features.reports.notInterested') }}
                      </span>
                    </label>
                  </td>
                  <td class="px-4 py-3">
                    <button
                      @click="removeRole(roleId)"
                      class="text-error-500 hover:text-error-700 transition-colors"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-sm text-gray-400">{{ t('features.reports.emptyRoles') }}</p>
        </div>

        <!-- Tab: Proyectos -->
        <div v-if="activeFilterTab === 'proyectos'" class="flex flex-col gap-4">
          <div class="flex flex-wrap gap-3 items-end">
            <div class="flex flex-col gap-1.5 flex-1 min-w-[250px]">
              <label class="text-sm font-medium text-gray-700">{{ t('features.reports.selectProject') }}</label>
              <AppSelect
                v-model="tempProjectId"
                :options="projectSelectOptions.filter(p => !selectedProjects.includes(p.value))"
                :placeholder="t('features.reports.placeholders.selectProject')"
                searchable
                :search-placeholder="t('features.reports.placeholders.searchProject')"
              />
            </div>
            <button
              @click="() => { if (tempProjectId) { addProject(tempProjectId); tempProjectId = null } }"
              :disabled="!tempProjectId"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus class="w-4 h-4" />
              {{ t('common.add') }}
            </button>
          </div>

          <div v-if="selectedProjects.length" class="overflow-hidden rounded-xl border border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ t('common.fields.project') }}
                  </th>
                  <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ t('features.reports.preference') }}
                  </th>
                  <th class="w-14 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="projectId in selectedProjects" :key="projectId" class="hover:bg-gray-50">
                  <td class="px-5 py-3 text-sm text-gray-700">
                    {{ projectOptions.find(p => p.id === projectId)?.projectName }}
                  </td>
                  <td class="px-5 py-3">
                    <label class="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        v-model="projectPreferences[projectId]"
                        class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20"
                      />
                      <span class="text-sm text-gray-600">
                        {{ projectPreferences[projectId] ? t('features.reports.interested') : t('features.reports.notInterested') }}
                      </span>
                    </label>
                  </td>
                  <td class="px-4 py-3">
                    <button
                      @click="removeProject(projectId)"
                      class="text-error-500 hover:text-error-700 transition-colors"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-sm text-gray-400">{{ t('features.reports.emptyProjects') }}</p>
        </div>

        <!-- Tab: Competencias -->
        <div v-if="activeFilterTab === 'competencias'" class="flex flex-col gap-4">
          <div class="flex flex-wrap gap-3 items-end">
            <div class="flex flex-col gap-1.5 flex-1 min-w-[200px]">
              <label class="text-sm font-medium text-gray-700">{{ t('common.fields.competence') }}</label>
              <AppSelect
                v-model="selectedCompetence"
                :options="competenceSelectOptions"
                :placeholder="t('features.reports.placeholders.selectCompetence')"
                searchable
                :search-placeholder="t('features.reports.placeholders.searchCompetence')"
              />
            </div>
            <div class="flex flex-col gap-1.5 w-48">
              <label class="text-sm font-medium text-gray-700">{{ t('common.fields.level') }} <span class="text-error-500">*</span></label>
              <AppSelect
                v-model="selectedLevel"
                :options="levelSelectOptions"
                :placeholder="t('features.reports.placeholders.selectLevel')"
              />
            </div>
            <button
              @click="addCompetenceFilter"
              :disabled="!selectedCompetence || !selectedLevel"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus class="w-4 h-4" />
              {{ t('common.add') }}
            </button>
          </div>

          <div v-if="filterCompetences.length" class="overflow-hidden rounded-xl border border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ t('features.reports.competenceLevel') }}
                  </th>
                  <th class="w-14 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(c, idx) in filterCompetences" :key="idx" class="hover:bg-gray-50">
                  <td class="px-5 py-3 text-sm text-gray-700">{{ c.label }}</td>
                  <td class="px-4 py-3">
                    <button
                      @click="removeCompetence(idx)"
                      class="text-error-500 hover:text-error-700 transition-colors"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-sm text-gray-400">{{ t('features.reports.emptyCompetences') }}</p>
        </div>

        <!-- Tab: MBTI -->
        <div v-if="activeFilterTab === 'mbti'" class="flex flex-col gap-3">
          <label class="text-sm font-medium text-gray-700">{{ t('features.reports.mbtiTypes') }}</label>
          <div class="grid grid-cols-4 sm:grid-cols-8 gap-2">
            <label
              v-for="m in mbtiOptions"
              :key="m"
              class="flex items-center justify-center px-2 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors select-none"
              :class="selectedMbtiTypes.includes(m)
                ? 'border-brand-500 bg-brand-50 text-brand-600'
                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'"
            >
              <input type="checkbox" :value="m" v-model="selectedMbtiTypes" class="sr-only" />
              {{ m }}
            </label>
          </div>
          <div v-if="selectedMbtiTypes.length" class="flex flex-wrap gap-2">
            <span
              v-for="m in selectedMbtiTypes"
              :key="m"
              class="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
            >
              {{ m }}
            </span>
          </div>
        </div>

        <!-- Tab: Belbin -->
        <div v-if="activeFilterTab === 'belbin'" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div v-for="role in belbinRoleLabels" :key="role.key" class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-gray-700">{{ role.label }}</label>
            <AppSelect
              v-model="belbin[role.key]"
              :options="belbinSelectOptions"
              :placeholder="t('features.reports.options.noFilter')"
            />
          </div>
        </div>

        <!-- Age range -->
        <div class="flex flex-wrap items-end gap-4 pt-4 border-t border-gray-200">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-gray-700">{{ t('features.reports.ageRange') }}</label>
            <div class="flex items-center gap-3">
              <input
                v-model.number="minAge"
                type="number"
                :placeholder="t('features.reports.placeholders.minAge')"
                min="0"
                max="100"
                class="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
              <span class="text-gray-400">—</span>
              <input
                v-model.number="maxAge"
                type="number"
                :placeholder="t('features.reports.placeholders.maxAge')"
                min="0"
                max="100"
                class="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-2">
          <button
            @click="handleReset"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw class="w-4 h-4" />
            {{ t('common.clear') }}
          </button>
          <button
            @click="handleSearch"
            :disabled="loading"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <Search v-else class="w-4 h-4" />
            {{ t('common.search') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div v-if="searched">
      <div class="flex items-center gap-3 mb-4">
        <h3 class="text-base font-semibold text-gray-800">{{ t('features.reports.results') }}</h3>
        <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-600">
          {{ t('features.reports.personCount', [workers.length]) }}
        </span>
      </div>
      <DataTable
        :columns="workerColumns"
        :items="workers"
        :loading="loading"
        :show-actions="false"
        :default-rows="10"
      />
    </div>
  </div>
</template>
