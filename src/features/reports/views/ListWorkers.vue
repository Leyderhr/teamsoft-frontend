<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { Search, RefreshCw, Plus, Trash2, Loader2 } from 'lucide-vue-next'
import MultiSelect from 'primevue/multiselect'
import DataTable from '@/shared/components/DataTable.vue'
import reportService from '@/features/reports/services/reportService.js'
import roleService from '@/features/roles/services/roleService.js'
import projectService from '@/features/projects/services/projectService.js'
import competenceService from '@/features/competences/services/competenceService.js'
import levelsService from '@/features/nomenclatives/services/levelsService.js'

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

const belbinOptions = [
  { label: 'Favorito', value: 'F' },
  { label: 'Evitado', value: 'E' },
  { label: 'Indiferente', value: 'I' }
]
const belbin = ref({ ES: null, ID: null, CO: null, IS: null, CE: null, IR: null, ME: null, CH: null, IF: null })

const filterCompetences = ref([])

const mbtiOptions = [
  'ESTJ', 'ENTJ', 'ESFJ', 'ENFJ', 'ESTP', 'ENTP', 'ESFP', 'ENFP',
  'ISTJ', 'INTJ', 'ISFJ', 'INFJ', 'ISTP', 'INTP', 'ISFP', 'INFP'
]

const workers = ref([])
const searched = ref(false)

const belbinRoleLabels = [
  { key: 'ES', label: 'Especialista (ES)' },
  { key: 'ID', label: 'Implementador (ID)' },
  { key: 'CO', label: 'Coordinador (CO)' },
  { key: 'IS', label: 'Cohesionador (IS)' },
  { key: 'CE', label: 'Cerebro (CE)' },
  { key: 'IR', label: 'Investigador Rec. (IR)' },
  { key: 'ME', label: 'Monitor Evaluador (ME)' },
  { key: 'CH', label: 'Impulsor (CH)' },
  { key: 'IF', label: 'Finalizador (IF)' }
]

const filterTabs = [
  { key: 'roles', label: 'Roles' },
  { key: 'proyectos', label: 'Proyectos' },
  { key: 'competencias', label: 'Competencias' },
  { key: 'mbti', label: 'MBTI' },
  { key: 'belbin', label: 'Belbin' },
]

const workerColumns = [
  { field: 'card', header: 'Carné', sortable: true },
  { field: 'personName', header: 'Nombre', sortable: true },
  { field: 'surName', header: 'Apellidos', sortable: true },
  { field: 'sex', header: 'Sexo', sortable: false },
  { field: 'age', header: 'Edad', sortable: true },
  { field: 'ageGroupFk.ageGroupName', header: 'Grupo de Edad', sortable: true },
  { field: 'nacionalityFk.gentilicioNac', header: 'Nacionalidad', sortable: true },
  { field: 'workerTest.tipoMB', header: 'MBTI', sortable: true },
]

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

const addCompetenceFilter = () => {
  if (!selectedCompetence.value) return
  const comp = competenceOptions.value.find(c => c.id === selectedCompetence.value)
  const level = levelOptions.value.find(l => l.id === selectedLevel.value)
  if (!comp) return
  filterCompetences.value.push({
    competenceId: selectedCompetence.value,
    levelId: selectedLevel.value || null,
    label: `${comp.competitionName}${level ? ' - ' + level.significance : ''}`
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
    const filters_payload = {
      roleIds: selectedRoles.value.map(r => r.id || r),
      projectIds: selectedProjects.value.map(p => p.id || p),
      competences: filterCompetences.value.map(c => ({ competenceId: c.competenceId, levelId: c.levelId })),
      mbtiTypes: selectedMbtiTypes.value,
      belbin: Object.fromEntries(Object.entries(belbin.value).filter(([, v]) => v !== null)),
      minAge: minAge.value,
      maxAge: maxAge.value
    }
    workers.value = await reportService.getFilteredWorkers(filters_payload)
  } catch (error) {
    console.error('Error filtrando trabajadores:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo realizar la búsqueda', life: 3000 })
    workers.value = []
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  selectedRoles.value = []
  selectedProjects.value = []
  filterCompetences.value = []
  selectedMbtiTypes.value = []
  belbin.value = { ES: null, ID: null, CO: null, IS: null, CE: null, IR: null, ME: null, CH: null, IF: null }
  minAge.value = null
  maxAge.value = null
  workers.value = []
  searched.value = false
}

onMounted(loadFilterOptions)
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Listar Personas</h1>

    <!-- Filters Card -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden mb-6">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-base font-semibold text-gray-800">Filtros de búsqueda</h3>
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
        <div v-if="activeFilterTab === 'roles'" class="flex flex-col gap-3">
          <label class="text-sm font-medium text-gray-700">Intereses en Roles</label>
          <MultiSelect
            v-model="selectedRoles"
            :options="roleOptions"
            optionLabel="roleName"
            placeholder="Seleccione roles de interés"
            filter
            class="w-full max-w-lg"
          />
          <div v-if="selectedRoles.length" class="flex flex-wrap gap-2">
            <span
              v-for="r in selectedRoles"
              :key="r.id"
              class="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-600"
            >
              {{ r.roleName }}
            </span>
          </div>
        </div>

        <!-- Tab: Proyectos -->
        <div v-if="activeFilterTab === 'proyectos'" class="flex flex-col gap-3">
          <label class="text-sm font-medium text-gray-700">Intereses en Proyectos</label>
          <MultiSelect
            v-model="selectedProjects"
            :options="projectOptions"
            optionLabel="projectName"
            placeholder="Seleccione proyectos de interés"
            filter
            class="w-full max-w-lg"
          />
          <div v-if="selectedProjects.length" class="flex flex-wrap gap-2">
            <span
              v-for="p in selectedProjects"
              :key="p.id"
              class="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-600"
            >
              {{ p.projectName }}
            </span>
          </div>
        </div>

        <!-- Tab: Competencias -->
        <div v-if="activeFilterTab === 'competencias'" class="flex flex-col gap-4">
          <div class="flex flex-wrap gap-3 items-end">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Competencia</label>
              <select
                v-model="selectedCompetence"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white w-64"
              >
                <option value="">Seleccionar competencia</option>
                <option v-for="c in competenceOptions" :key="c.id" :value="c.id">
                  {{ c.competitionName }}
                </option>
              </select>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Nivel (opcional)</label>
              <select
                v-model="selectedLevel"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white w-48"
              >
                <option value="">Sin nivel</option>
                <option v-for="l in levelOptions" :key="l.id" :value="l.id">
                  {{ l.significance }}
                </option>
              </select>
            </div>
            <button
              @click="addCompetenceFilter"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
            >
              <Plus class="w-4 h-4" />
              Agregar
            </button>
          </div>

          <div v-if="filterCompetences.length" class="overflow-hidden rounded-xl border border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Competencia — Nivel
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
          <p v-else class="text-sm text-gray-400">Sin competencias agregadas</p>
        </div>

        <!-- Tab: MBTI -->
        <div v-if="activeFilterTab === 'mbti'" class="flex flex-col gap-3">
          <label class="text-sm font-medium text-gray-700">Tipos MBTI</label>
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
            <select
              v-model="belbin[role.key]"
              class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white"
            >
              <option :value="null">Indiferente</option>
              <option v-for="opt in belbinOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Age range -->
        <div class="flex flex-wrap items-end gap-4 pt-4 border-t border-gray-200">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-gray-700">Rango de edad</label>
            <div class="flex items-center gap-3">
              <input
                v-model.number="minAge"
                type="number"
                placeholder="Mín."
                min="0"
                max="100"
                class="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
              <span class="text-gray-400">—</span>
              <input
                v-model.number="maxAge"
                type="number"
                placeholder="Máx."
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
            Limpiar
          </button>
          <button
            @click="handleSearch"
            :disabled="loading"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <Search v-else class="w-4 h-4" />
            Buscar
          </button>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div v-if="searched">
      <div class="flex items-center gap-3 mb-4">
        <h3 class="text-base font-semibold text-gray-800">Resultados</h3>
        <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-600">
          {{ workers.length }} persona(s)
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
