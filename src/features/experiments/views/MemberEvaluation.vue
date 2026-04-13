<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { ArrowLeft, ChevronRight, Loader2, Plus, Trash2, Save, Flag, Star } from 'lucide-vue-next'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import DataTable from '@/shared/components/DataTable.vue'
import experimentService from '@/features/experiments/services/experimentService.js'
import projectService from '@/features/projects/services/projectService.js'
import competenceService from '@/features/competences/services/competenceService.js'
import levelsService from '@/features/nomenclatives/services/levelsService.js'
import roleEvaluationService from '@/features/nomenclatives/services/roleEvaluationService.js'
import conflictIndexService from '@/features/nomenclatives/services/conflictIndexService.js'

const toast = useToast()

// =====================
// Wizard step
// =====================
const currentStep = ref(1)

// =====================
// STEP 1: Select project
// =====================
const projects = ref([])
const loadingProjects = ref(false)
const selectedProject = ref(null)

// =====================
// STEP 2: Select member
// =====================
const members = ref([])
const loadingMembers = ref(false)
const selectedMember = ref(null)

// =====================
// STEP 3: Evaluate member
// =====================
const activeEvalTab = ref('0')
const loadingEval = ref(false)

// Competences
const competenceOptions = ref([])
const levelOptions = ref([])
const selectedGenCompetence = ref(null)
const selectedGenLevel = ref(null)
const genCompetences = ref([])

const selectedTechCompetence = ref(null)
const selectedTechLevel = ref(null)
const techCompetences = ref([])

// Role evaluation
const roleEvalOptions = ref([])
const memberRoles = ref([])

// Compatibility
const conflictIndexOptions = ref([])
const otherMembers = ref([])

const saving = ref(false)

// =====================
// Computed
// =====================
const stepTitle = computed(() => {
  if (currentStep.value === 1) return 'Seleccionar Proyecto'
  if (currentStep.value === 2) return 'Seleccionar Miembro'
  return `Evaluando: ${selectedMember.value?.personName || ''} ${selectedMember.value?.surName || ''}`
})

const allEvaluated = computed(() => members.value.length > 0 && members.value.every(m => m.evaluated))

// =====================
// Load data
// =====================
const loadProjects = async () => {
  loadingProjects.value = true
  try {
    const data = await projectService.getAll()
    projects.value = data.filter(p => p.finalize && !p.close)
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los proyectos', life: 3000 })
  } finally {
    loadingProjects.value = false
  }
}

const loadMembers = async () => {
  loadingMembers.value = true
  try {
    members.value = await experimentService.getMembersToEvaluate(selectedProject.value.id)
  } catch {
    members.value = []
    toast.add({ severity: 'warn', summary: 'Aviso', detail: 'No se pudieron cargar los miembros', life: 3000 })
  } finally {
    loadingMembers.value = false
  }
}

const loadEvaluationData = async () => {
  loadingEval.value = true
  try {
    const [competences, levels, roleEvals, conflictIndexes] = await Promise.allSettled([
      competenceService.getAll(),
      levelsService.getAll(),
      roleEvaluationService.getAll(),
      conflictIndexService.getAll()
    ])
    if (competences.status === 'fulfilled') competenceOptions.value = competences.value
    if (levels.status === 'fulfilled') levelOptions.value = levels.value
    if (roleEvals.status === 'fulfilled') roleEvalOptions.value = roleEvals.value
    if (conflictIndexes.status === 'fulfilled') conflictIndexOptions.value = conflictIndexes.value

    memberRoles.value = selectedMember.value?.assignedRoles?.map(r => ({
      roleName: r.rolesFk?.roleName || r.roleName,
      roleId: r.id,
      roleEvalId: null
    })) || []

    otherMembers.value = members.value
      .filter(m => m.id !== selectedMember.value.id)
      .map(m => ({ memberId: m.id, personName: m.personName, surName: m.surName, conflictIndexId: null }))
  } catch (err) {
    console.error('Error loading evaluation data:', err)
  } finally {
    loadingEval.value = false
  }
}

// =====================
// Competence handlers
// =====================
const addGenCompetence = () => {
  if (!selectedGenCompetence.value) return
  const comp = competenceOptions.value.find(c => c.id === selectedGenCompetence.value && !c.technical)
  const level = levelOptions.value.find(l => l.id === selectedGenLevel.value)
  if (!comp) return
  if (genCompetences.value.some(g => g.competenceId === selectedGenCompetence.value)) {
    toast.add({ severity: 'warn', summary: 'Aviso', detail: 'Esta competencia ya fue agregada', life: 2000 })
    return
  }
  genCompetences.value.push({
    competenceId: comp.id,
    competenceName: comp.competitionName,
    levelId: selectedGenLevel.value,
    levelName: level?.significance || '-'
  })
  selectedGenCompetence.value = null
  selectedGenLevel.value = null
}

const addTechCompetence = () => {
  if (!selectedTechCompetence.value) return
  const comp = competenceOptions.value.find(c => c.id === selectedTechCompetence.value && c.technical)
  const level = levelOptions.value.find(l => l.id === selectedTechLevel.value)
  if (!comp) return
  if (techCompetences.value.some(g => g.competenceId === selectedTechCompetence.value)) {
    toast.add({ severity: 'warn', summary: 'Aviso', detail: 'Esta competencia ya fue agregada', life: 2000 })
    return
  }
  techCompetences.value.push({
    competenceId: comp.id,
    competenceName: comp.competitionName,
    levelId: selectedTechLevel.value,
    levelName: level?.significance || '-'
  })
  selectedTechCompetence.value = null
  selectedTechLevel.value = null
}

// =====================
// Navigation
// =====================
const goToStep2 = async () => {
  if (!selectedProject.value) return
  await loadMembers()
  currentStep.value = 2
}

const goToStep3 = async () => {
  if (!selectedMember.value) return
  await loadEvaluationData()
  currentStep.value = 3
}

const handleSaveEvaluation = async () => {
  saving.value = true
  try {
    await experimentService.saveMemberEvaluation(
      selectedProject.value.id,
      selectedMember.value.id,
      {
        genCompetences: genCompetences.value,
        techCompetences: techCompetences.value,
        roleEvaluations: memberRoles.value,
        compatibilityLevels: otherMembers.value
      }
    )
    toast.add({ severity: 'success', summary: 'Guardado', detail: 'Evaluación guardada correctamente', life: 3000 })
    const member = members.value.find(m => m.id === selectedMember.value.id)
    if (member) member.evaluated = true
    currentStep.value = 2
    selectedMember.value = null
    genCompetences.value = []
    techCompetences.value = []
  } catch (error) {
    console.error('Error saving evaluation:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la evaluación', life: 3000 })
  } finally {
    saving.value = false
  }
}

const handleFinalizeProject = async () => {
  try {
    await experimentService.finalizeProjectEvaluation(selectedProject.value.id)
    toast.add({ severity: 'success', summary: 'Proyecto finalizado', detail: 'El proyecto ha sido cerrado correctamente', life: 4000 })
    currentStep.value = 1
    selectedProject.value = null
    members.value = []
    await loadProjects()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo finalizar el proyecto', life: 3000 })
  }
}

onMounted(loadProjects)
</script>

<template>
  <div>
    <PageBreadcrumb :page-title="stepTitle" :items="[]" />

    <!-- Step indicator -->
    <div class="flex items-center gap-2 mb-5 text-sm">
      <span :class="currentStep >= 1 ? 'text-brand-500 font-semibold' : 'text-gray-400'">Proyecto</span>
      <ChevronRight class="w-3.5 h-3.5 text-gray-400" />
      <span :class="currentStep >= 2 ? 'text-brand-500 font-semibold' : 'text-gray-400'">Miembros</span>
      <ChevronRight class="w-3.5 h-3.5 text-gray-400" />
      <span :class="currentStep >= 3 ? 'text-brand-500 font-semibold' : 'text-gray-400'">Evaluación</span>
    </div>

    <!-- ========= STEP 1: Select project ========= -->
    <div v-if="currentStep === 1" class="space-y-4">
      <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-base font-semibold text-gray-800">Seleccionar Proyecto a Evaluar</h3>
        </div>
        <div class="p-6">
          <DataTable
            :columns="[
              { field: 'projectName', header: 'Proyecto', sortable: true },
              { field: 'clientFk.entityName', header: 'Cliente', sortable: true },
              { field: 'beginDate', header: 'Fecha Inicio', sortable: true },
              { field: 'endDate', header: 'Fecha Fin', sortable: true },
            ]"
            :items="projects"
            :loading="loadingProjects"
            :show-actions="false"
            :default-rows="10"
            @row-select="selectedProject = $event"
          />
        </div>
      </div>

      <div class="flex justify-end">
        <button
          @click="goToStep2"
          :disabled="!selectedProject"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Seleccionar
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- ========= STEP 2: Select member ========= -->
    <div v-else-if="currentStep === 2" class="space-y-4">
      <button @click="currentStep = 1; selectedProject = null" class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-500 transition-colors">
        <ArrowLeft class="w-4 h-4" />
        Volver a Proyectos
      </button>

      <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-base font-semibold text-gray-800">Miembros del Proyecto: {{ selectedProject.projectName }}</h3>
        </div>
        <div class="p-6">
          <div v-if="loadingMembers" class="flex justify-center py-10">
            <Loader2 class="w-8 h-8 text-brand-500 animate-spin" />
          </div>
          <DataTable
            v-else
            :columns="[
              { field: 'personName', header: 'Nombre', sortable: true },
              { field: 'surName', header: 'Apellidos', sortable: true },
              { field: 'evaluated', header: 'Evaluado', type: 'boolean', sortable: true },
            ]"
            :items="members"
            :loading="false"
            :show-actions="false"
            :default-rows="10"
            @row-select="selectedMember = $event"
          />
        </div>
      </div>

      <div class="flex justify-between">
        <button
          @click="handleFinalizeProject"
          :disabled="!allEvaluated"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-warning-500 text-white text-sm font-medium hover:bg-warning-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Flag class="w-4 h-4" />
          Finalizar Proyecto
        </button>
        <button
          @click="goToStep3"
          :disabled="!selectedMember"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Star class="w-4 h-4" />
          Evaluar Miembro
        </button>
      </div>
    </div>

    <!-- ========= STEP 3: Evaluate member ========= -->
    <div v-else-if="currentStep === 3" class="space-y-5">
      <button @click="currentStep = 2; selectedMember = null" class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-500 transition-colors">
        <ArrowLeft class="w-4 h-4" />
        Volver a Miembros
      </button>

      <!-- Loading -->
      <div v-if="loadingEval" class="flex justify-center py-16">
        <Loader2 class="w-10 h-10 text-brand-500 animate-spin" />
      </div>

      <template v-else>
        <!-- Member info header -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
          <div class="px-6 py-4 bg-brand-500">
            <h3 class="text-base font-semibold text-white">
              Evaluando: {{ selectedMember.personName }} {{ selectedMember.surName }}
            </h3>
          </div>
        </div>

        <!-- Tabs card -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">

          <!-- Tab buttons -->
          <div class="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
            <button
              v-for="(tab, idx) in ['Competencias Genéricas', 'Competencias Técnicas', 'Evaluación en Roles', 'Nivel de Compatibilidad']"
              :key="idx"
              @click="activeEvalTab = String(idx)"
              class="px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2"
              :class="activeEvalTab === String(idx)
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              {{ tab }}
            </button>
          </div>

          <!-- Tab: Competencias Genéricas -->
          <div v-if="activeEvalTab === '0'" class="p-6 space-y-4">
            <!-- Add row -->
            <div class="flex flex-wrap gap-3 items-end">
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-gray-700">Competencia Genérica</label>
                <select
                  v-model="selectedGenCompetence"
                  class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white w-64"
                >
                  <option :value="null" disabled>Seleccione competencia</option>
                  <option v-for="c in competenceOptions.filter(c => !c.technical)" :key="c.id" :value="c.id">
                    {{ c.competitionName }}
                  </option>
                </select>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-gray-700">Nivel</label>
                <select
                  v-model="selectedGenLevel"
                  class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white w-48"
                >
                  <option :value="null" disabled>Nivel</option>
                  <option v-for="l in levelOptions" :key="l.id" :value="l.id">{{ l.significance }}</option>
                </select>
              </div>
              <button
                @click="addGenCompetence"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
              >
                <Plus class="w-4 h-4" />
                Agregar
              </button>
            </div>

            <!-- Competences table -->
            <div class="overflow-hidden rounded-xl border border-gray-200">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competencia</th>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th>
                    <th class="w-14 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-if="!genCompetences.length">
                    <td colspan="3" class="px-5 py-8 text-center text-sm text-gray-400">Sin competencias agregadas</td>
                  </tr>
                  <tr v-for="(comp, idx) in genCompetences" :key="idx" class="hover:bg-gray-50">
                    <td class="px-5 py-3 text-sm text-gray-700">{{ comp.competenceName }}</td>
                    <td class="px-5 py-3 text-sm text-gray-700">{{ comp.levelName }}</td>
                    <td class="px-4 py-3">
                      <button @click="genCompetences.splice(idx, 1)" class="text-error-500 hover:text-error-700 transition-colors">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Tab: Competencias Técnicas -->
          <div v-if="activeEvalTab === '1'" class="p-6 space-y-4">
            <!-- Add row -->
            <div class="flex flex-wrap gap-3 items-end">
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-gray-700">Competencia Técnica</label>
                <select
                  v-model="selectedTechCompetence"
                  class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white w-64"
                >
                  <option :value="null" disabled>Seleccione competencia</option>
                  <option v-for="c in competenceOptions.filter(c => c.technical)" :key="c.id" :value="c.id">
                    {{ c.competitionName }}
                  </option>
                </select>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-gray-700">Nivel</label>
                <select
                  v-model="selectedTechLevel"
                  class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white w-48"
                >
                  <option :value="null" disabled>Nivel</option>
                  <option v-for="l in levelOptions" :key="l.id" :value="l.id">{{ l.significance }}</option>
                </select>
              </div>
              <button
                @click="addTechCompetence"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
              >
                <Plus class="w-4 h-4" />
                Agregar
              </button>
            </div>

            <!-- Tech competences table -->
            <div class="overflow-hidden rounded-xl border border-gray-200">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competencia Técnica</th>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th>
                    <th class="w-14 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-if="!techCompetences.length">
                    <td colspan="3" class="px-5 py-8 text-center text-sm text-gray-400">Sin competencias técnicas agregadas</td>
                  </tr>
                  <tr v-for="(comp, idx) in techCompetences" :key="idx" class="hover:bg-gray-50">
                    <td class="px-5 py-3 text-sm text-gray-700">{{ comp.competenceName }}</td>
                    <td class="px-5 py-3 text-sm text-gray-700">{{ comp.levelName }}</td>
                    <td class="px-4 py-3">
                      <button @click="techCompetences.splice(idx, 1)" class="text-error-500 hover:text-error-700 transition-colors">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Tab: Evaluación en Roles -->
          <div v-if="activeEvalTab === '2'" class="p-6">
            <div class="overflow-hidden rounded-xl border border-gray-200">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evaluación del Rol</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-if="!memberRoles.length">
                    <td colspan="2" class="px-5 py-8 text-center text-sm text-gray-400">Sin roles asignados</td>
                  </tr>
                  <tr v-for="(role, idx) in memberRoles" :key="idx" class="hover:bg-gray-50">
                    <td class="px-5 py-3 text-sm text-gray-700">{{ role.roleName }}</td>
                    <td class="px-5 py-3">
                      <select
                        v-model="role.roleEvalId"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white"
                      >
                        <option :value="null" disabled>Seleccione evaluación</option>
                        <option v-for="opt in roleEvalOptions" :key="opt.id" :value="opt.id">{{ opt.significance }}</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Tab: Nivel de Compatibilidad -->
          <div v-if="activeEvalTab === '3'" class="p-6">
            <div class="overflow-hidden rounded-xl border border-gray-200">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miembro</th>
                    <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Índice de Compatibilidad</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-if="!otherMembers.length">
                    <td colspan="2" class="px-5 py-8 text-center text-sm text-gray-400">Sin otros miembros en el equipo</td>
                  </tr>
                  <tr v-for="(m, idx) in otherMembers" :key="idx" class="hover:bg-gray-50">
                    <td class="px-5 py-3 text-sm text-gray-700">{{ m.personName }} {{ m.surName }}</td>
                    <td class="px-5 py-3">
                      <select
                        v-model="m.conflictIndexId"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white"
                      >
                        <option :value="null" disabled>Seleccione nivel</option>
                        <option v-for="opt in conflictIndexOptions" :key="opt.id" :value="opt.id">{{ opt.description }}</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- Footer actions -->
        <div class="flex justify-end gap-3">
          <button
            @click="currentStep = 2; selectedMember = null"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="handleSaveEvaluation"
            :disabled="saving"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
            Guardar Evaluación
          </button>
        </div>

      </template>
    </div>

  </div>
</template>
