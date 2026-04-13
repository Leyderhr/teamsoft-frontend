<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { Check, Briefcase, Users, Loader2, Cog, RefreshCw, Save, ArrowLeft, ArrowRight } from 'lucide-vue-next'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import projectService from '@/features/projects/services/projectService.js'
import personGroupService from '@/features/nomenclatives/services/personGroupService.js'
import teamFormationService from '@/features/projects/services/teamFormationService.js'

const toast = useToast()

// ===========================
// Estado del wizard (3 pasos)
// ===========================
const currentStep = ref(1)

// ===========================
// Paso 1 — Selección y config básica
// ===========================
const availableProjects = ref([])
const availableGroups   = ref([])
const loadingProjects   = ref(false)
const loadingGroups     = ref(false)

const selectedProjectIds = ref([])
const selectedGroupIds   = ref([])

const confRole     = ref('custom')
const maximumRoles = ref(3)

const onlyOneProject = ref(true)
const confAllGroup   = ref(false)

const confFormMode    = ref(2)
const formModeOptions = [
  { label: 'Secuencial — asignando jefe primero',   value: 1 },
  { label: 'Simultáneo — asignando jefe primero',   value: 2 },
  { label: 'Secuencial — sin asignar jefe primero', value: 3 },
  { label: 'Simultáneo — sin asignar jefe primero', value: 4 }
]

// ===========================
// Paso 2 — Parámetros del algoritmo
// ===========================
const maxCompetences = ref(true)
const maxInterests   = ref(true)
const minIncomp      = ref(false)
const takeWorkLoad   = ref(true)

const maxCompetencesWeight = ref(0.4)
const maxInterestsWeight   = ref(0.3)
const minIncompWeight      = ref(0.1)
const workLoadWeight       = ref(0.2)

const solutionAlgorithm = ref(1)
const algorithmOptions  = [
  { label: 'Algoritmo 1', value: 1 },
  { label: 'Algoritmo 2', value: 2 },
  { label: 'Algoritmo 3', value: 3 },
  { label: 'Algoritmo 4', value: 4 },
  { label: 'Algoritmo 5', value: 5 }
]

const iterations         = ref(100)
const anyIncompatibility = ref(false)
const maxRoleLoad        = ref(40.0)

// ===========================
// Paso 3 — Propuesta generada
// ===========================
const generating = ref(false)
const saving     = ref(false)
const proposal   = ref(null)

// ===========================
// Validaciones computadas
// ===========================
const step1Valid = computed(() =>
  selectedProjectIds.value.length > 0 && selectedGroupIds.value.length > 0
)

const atLeastOneFuncSelected = computed(() =>
  maxCompetences.value || maxInterests.value || minIncomp.value || takeWorkLoad.value
)

const totalWeights = computed(() => {
  let t = 0
  if (maxCompetences.value) t += maxCompetencesWeight.value ?? 0
  if (maxInterests.value)   t += maxInterestsWeight.value   ?? 0
  if (minIncomp.value)      t += minIncompWeight.value      ?? 0
  if (takeWorkLoad.value)   t += workLoadWeight.value       ?? 0
  return parseFloat(t.toFixed(2))
})

const weightsOk = computed(() => totalWeights.value > 0 && totalWeights.value <= 1.01)

// ===========================
// Carga de datos iniciales
// ===========================
const loadProjects = async () => {
  loadingProjects.value = true
  try {
    const data = await projectService.getAll()
    availableProjects.value = data
      .filter(p => !p.close)
      .map(p => ({ id: p.id, label: p.projectName }))
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los proyectos', life: 3000 })
  } finally {
    loadingProjects.value = false
  }
}

const loadGroups = async () => {
  loadingGroups.value = true
  try {
    const data = await personGroupService.getAll()
    availableGroups.value = data.map(g => ({ id: g.id, label: g.name }))
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los grupos', life: 3000 })
  } finally {
    loadingGroups.value = false
  }
}

// ===========================
// Navegación entre pasos
// ===========================
const nextStep = () => {
  if (currentStep.value === 1 && !step1Valid.value) {
    toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Seleccione al menos un proyecto y un grupo', life: 3000 })
    return
  }
  if (currentStep.value === 2) {
    if (!atLeastOneFuncSelected.value) {
      toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Seleccione al menos una función objetivo', life: 3000 })
      return
    }
    if (!weightsOk.value) {
      toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'La suma de los pesos no puede superar 1.0', life: 3000 })
      return
    }
  }
  if (currentStep.value < 3) currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--
}

// ===========================
// Construcción del payload
// ===========================
const buildPayload = () => ({
  teamFormationParameters: {
    groupList:            selectedGroupIds.value,
    confRole:             confRole.value === 'all',
    maximunRoles:         maximumRoles.value,
    confAllGroup:         confAllGroup.value,
    onlyOneProject:       onlyOneProject.value,
    confFormMode:         confFormMode.value,
    maxCompetences:       maxCompetences.value,
    maxInterests:         maxInterests.value,
    minIncomp:            minIncomp.value,
    takeWorkLoad:         takeWorkLoad.value,
    maxCompetencesWeight: maxCompetences.value ? (maxCompetencesWeight.value ?? 0) : 0,
    maxInterestsWeight:   maxInterests.value   ? (maxInterestsWeight.value   ?? 0) : 0,
    minIncompWeight:      minIncomp.value      ? (minIncompWeight.value      ?? 0) : 0,
    workLoadWeight:       takeWorkLoad.value   ? (workLoadWeight.value       ?? 0) : 0,
    solutionAlgorithm:    solutionAlgorithm.value,
    iterations:           iterations.value,
    anyIncompatibility:   anyIncompatibility.value,
    maxRoleLoad:          { value: maxRoleLoad.value }
  },
  projectsIDs: selectedProjectIds.value,
  groupIDs:    selectedGroupIds.value
})

// ===========================
// Generar propuesta
// ===========================
const generateTeams = async () => {
  generating.value = true
  proposal.value   = null
  try {
    const result = await teamFormationService.generateTeams(buildPayload())
    proposal.value = result
    toast.add({ severity: 'success', summary: 'Propuesta generada', detail: 'Revise los equipos propuestos', life: 4000 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error al generar', detail: e?.message || 'Error en el servidor', life: 5000 })
  } finally {
    generating.value = false
  }
}

// ===========================
// Guardar equipos
// ===========================
const saveTeams = async () => {
  if (!proposal.value) return
  saving.value = true
  try {
    await teamFormationService.saveTeams(proposal.value)
    toast.add({ severity: 'success', summary: 'Equipos guardados', detail: 'Los equipos han sido persistidos correctamente', life: 4000 })
    currentStep.value        = 1
    proposal.value           = null
    selectedProjectIds.value = []
    selectedGroupIds.value   = []
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error al guardar', detail: e?.message || 'Error en el servidor', life: 5000 })
  } finally {
    saving.value = false
  }
}

const stepLabels = ['Selección y Configuración', 'Parámetros del Algoritmo', 'Generar y Guardar']

onMounted(() => {
  loadProjects()
  loadGroups()
})
</script>

<template>
  <div class="space-y-6">
    <PageBreadcrumb page-title="Formar Equipo" />

    <!-- Stepper -->
    <div class="flex items-center gap-1 overflow-x-auto pb-1">
      <template v-for="(label, idx) in stepLabels" :key="idx">
        <div
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all"
          :class="currentStep === idx + 1
            ? 'bg-brand-500 text-white font-semibold'
            : currentStep > idx + 1
              ? 'bg-brand-50 text-brand-600 font-medium cursor-pointer'
              : 'bg-gray-100 text-gray-500 border border-gray-200'"
          @click="currentStep > idx + 1 && (currentStep = idx + 1)"
        >
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            :class="currentStep === idx + 1 ? 'bg-white/20' : currentStep > idx + 1 ? 'bg-brand-100 text-brand-600' : 'bg-gray-200 text-gray-500'"
          >
            <Check v-if="currentStep > idx + 1" class="w-3 h-3" />
            <span v-else>{{ idx + 1 }}</span>
          </span>
          {{ label }}
        </div>
        <div v-if="idx < stepLabels.length - 1" class="h-px w-4 bg-gray-200 shrink-0" />
      </template>
    </div>

    <!-- ============================== PASO 1 ============================== -->
    <div v-show="currentStep === 1" class="space-y-5">

      <!-- Proyectos y Grupos -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-base font-semibold text-gray-800">Selección de Proyectos y Grupos</h3>
        </div>
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

          <!-- Proyectos -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">
              Proyectos a formar equipo <span class="text-error-500">*</span>
            </label>
            <div v-if="loadingProjects" class="flex items-center gap-2 text-sm text-gray-400 py-2">
              <Loader2 class="w-4 h-4 animate-spin" /> Cargando proyectos...
            </div>
            <div v-else class="overflow-y-auto max-h-48 rounded-lg border border-gray-200 divide-y divide-gray-100">
              <label
                v-for="proj in availableProjects"
                :key="proj.id"
                class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  :value="proj.id"
                  v-model="selectedProjectIds"
                  class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer"
                />
                <span class="text-sm text-gray-700">{{ proj.label }}</span>
              </label>
              <div v-if="!availableProjects.length" class="px-4 py-6 text-center text-sm text-gray-400">
                Sin proyectos disponibles
              </div>
            </div>
            <p class="text-xs text-gray-400">{{ selectedProjectIds.length }} seleccionado(s)</p>
          </div>

          <!-- Grupos -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">
              Grupos de búsqueda <span class="text-error-500">*</span>
            </label>
            <div v-if="loadingGroups" class="flex items-center gap-2 text-sm text-gray-400 py-2">
              <Loader2 class="w-4 h-4 animate-spin" /> Cargando grupos...
            </div>
            <div v-else class="overflow-y-auto max-h-48 rounded-lg border border-gray-200 divide-y divide-gray-100">
              <label
                v-for="grp in availableGroups"
                :key="grp.id"
                class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  :value="grp.id"
                  v-model="selectedGroupIds"
                  class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer"
                />
                <span class="text-sm text-gray-700">{{ grp.label }}</span>
              </label>
              <div v-if="!availableGroups.length" class="px-4 py-6 text-center text-sm text-gray-400">
                Sin grupos disponibles
              </div>
            </div>
            <p class="text-xs text-gray-400">{{ selectedGroupIds.length }} seleccionado(s)</p>
          </div>

        </div>
      </div>

      <!-- Configuración de Roles -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-base font-semibold text-gray-800">Configuración de Roles</h3>
        </div>
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

          <div class="flex flex-col gap-3">
            <p class="text-sm font-medium text-gray-700">Cantidad máxima de roles por persona</p>
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="radio" v-model="confRole" value="custom" class="w-4 h-4 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <span class="text-sm text-gray-700">Limitar cantidad máxima de roles</span>
            </label>
            <div v-if="confRole === 'custom'" class="ml-7">
              <input
                v-model.number="maximumRoles"
                type="number" min="1" max="20"
                class="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="radio" v-model="confRole" value="all" class="w-4 h-4 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <span class="text-sm text-gray-700">Todos los roles posibles</span>
            </label>
          </div>

          <div class="flex flex-col gap-3">
            <p class="text-sm font-medium text-gray-700">Restricciones adicionales</p>
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" v-model="onlyOneProject" class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <span class="text-sm text-gray-700">Cada trabajador en un solo proyecto</span>
            </label>
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" v-model="confAllGroup" class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <span class="text-sm text-gray-700">Usar toda la plantilla de grupos</span>
            </label>
          </div>

        </div>
      </div>

      <!-- Modo de Formación -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-base font-semibold text-gray-800">Modo de Formación</h3>
        </div>
        <div class="p-6">
          <p class="text-sm text-gray-500 mb-4">Define el orden y estrategia con que el algoritmo construye los equipos.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              v-for="opt in formModeOptions"
              :key="opt.value"
              class="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50/30 transition-colors"
              :class="confFormMode === opt.value ? 'border-brand-400 bg-brand-50' : ''"
            >
              <input type="radio" v-model="confFormMode" :value="opt.value" class="w-4 h-4 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <span class="text-sm text-gray-700">{{ opt.label }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================== PASO 2 ============================== -->
    <div v-show="currentStep === 2" class="space-y-5">

      <!-- Funciones Objetivo -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-base font-semibold text-gray-800">Funciones Objetivo</h3>
        </div>
        <div class="p-6 flex flex-col gap-5">
          <p class="text-sm text-gray-500">
            Seleccione las funciones a optimizar y asigne sus pesos. La suma de los pesos activos debe ser ≤ 1.0.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <!-- Maximizar Competencias -->
            <div class="rounded-xl border-2 p-4 transition-colors"
              :class="maxCompetences ? 'border-brand-400 bg-brand-50' : 'border-gray-200 bg-white hover:border-gray-300'"
            >
              <label class="flex items-center gap-3 cursor-pointer mb-3">
                <input type="checkbox" v-model="maxCompetences" class="w-4 h-4 rounded border-gray-300 text-brand-500 cursor-pointer" />
                <span class="text-sm font-semibold text-gray-800">Maximizar Competencias</span>
              </label>
              <div v-if="maxCompetences" class="ml-7 flex flex-col gap-1">
                <label class="text-xs text-gray-500">Peso</label>
                <input v-model.number="maxCompetencesWeight" type="number" min="0" max="1" step="0.05"
                  class="w-28 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
              </div>
            </div>

            <!-- Maximizar Intereses -->
            <div class="rounded-xl border-2 p-4 transition-colors"
              :class="maxInterests ? 'border-brand-400 bg-brand-50' : 'border-gray-200 bg-white hover:border-gray-300'"
            >
              <label class="flex items-center gap-3 cursor-pointer mb-3">
                <input type="checkbox" v-model="maxInterests" class="w-4 h-4 rounded border-gray-300 text-brand-500 cursor-pointer" />
                <span class="text-sm font-semibold text-gray-800">Maximizar Intereses</span>
              </label>
              <div v-if="maxInterests" class="ml-7 flex flex-col gap-1">
                <label class="text-xs text-gray-500">Peso</label>
                <input v-model.number="maxInterestsWeight" type="number" min="0" max="1" step="0.05"
                  class="w-28 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
              </div>
            </div>

            <!-- Minimizar Incompatibilidades -->
            <div class="rounded-xl border-2 p-4 transition-colors"
              :class="minIncomp ? 'border-brand-400 bg-brand-50' : 'border-gray-200 bg-white hover:border-gray-300'"
            >
              <label class="flex items-center gap-3 cursor-pointer mb-3">
                <input type="checkbox" v-model="minIncomp" class="w-4 h-4 rounded border-gray-300 text-brand-500 cursor-pointer" />
                <span class="text-sm font-semibold text-gray-800">Minimizar Incompatibilidades</span>
              </label>
              <div v-if="minIncomp" class="ml-7 flex flex-col gap-1">
                <label class="text-xs text-gray-500">Peso</label>
                <input v-model.number="minIncompWeight" type="number" min="0" max="1" step="0.05"
                  class="w-28 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
              </div>
            </div>

            <!-- Carga de Trabajo -->
            <div class="rounded-xl border-2 p-4 transition-colors"
              :class="takeWorkLoad ? 'border-brand-400 bg-brand-50' : 'border-gray-200 bg-white hover:border-gray-300'"
            >
              <label class="flex items-center gap-3 cursor-pointer mb-3">
                <input type="checkbox" v-model="takeWorkLoad" class="w-4 h-4 rounded border-gray-300 text-brand-500 cursor-pointer" />
                <span class="text-sm font-semibold text-gray-800">Considerar Carga de Trabajo</span>
              </label>
              <div v-if="takeWorkLoad" class="ml-7 flex flex-col gap-1">
                <label class="text-xs text-gray-500">Peso</label>
                <input v-model.number="workLoadWeight" type="number" min="0" max="1" step="0.05"
                  class="w-28 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
              </div>
            </div>

          </div>

          <!-- Suma de pesos -->
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium text-gray-700">Suma de pesos:</span>
            <span
              class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
              :class="weightsOk ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-600'"
            >
              {{ totalWeights }}
            </span>
            <span v-if="!weightsOk" class="text-xs text-error-600">La suma no debe superar 1.0</span>
          </div>
        </div>
      </div>

      <!-- Configuración del Algoritmo -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-base font-semibold text-gray-800">Configuración del Algoritmo</h3>
        </div>
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

          <!-- Tipo de algoritmo -->
          <div class="flex flex-col gap-3">
            <p class="text-sm font-medium text-gray-700">Tipo de algoritmo</p>
            <div class="flex flex-col gap-2">
              <label
                v-for="opt in algorithmOptions"
                :key="opt.value"
                class="flex items-center gap-3 cursor-pointer"
              >
                <input type="radio" v-model="solutionAlgorithm" :value="opt.value" class="w-4 h-4 text-brand-500 cursor-pointer" />
                <span class="text-sm text-gray-700">{{ opt.label }}</span>
              </label>
            </div>
          </div>

          <!-- Parámetros numéricos -->
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Iteraciones</label>
              <input v-model.number="iterations" type="number" min="1" max="10000"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
              <p class="text-xs text-gray-400">A mayor número, mejor calidad pero más tiempo de cómputo.</p>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Carga máxima de rol (h)</label>
              <input v-model.number="maxRoleLoad" type="number" min="1" max="200" step="0.5"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>

            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" v-model="anyIncompatibility" class="w-4 h-4 rounded border-gray-300 text-brand-500 cursor-pointer" />
              <span class="text-sm text-gray-700">No permitir ninguna incompatibilidad</span>
            </label>
          </div>

        </div>
      </div>
    </div>

    <!-- ============================== PASO 3 ============================== -->
    <div v-show="currentStep === 3">
      <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-base font-semibold text-gray-800">Generar Propuesta de Equipo</h3>
        </div>
        <div class="p-6">

          <!-- Estado inicial: sin propuesta -->
          <div v-if="!proposal && !generating" class="flex flex-col items-center gap-5 py-12">
            <div class="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center">
              <Users class="w-8 h-8 text-brand-500" />
            </div>
            <p class="text-sm text-gray-500 text-center max-w-md">
              Todo está configurado. Haz clic en <strong>Generar</strong> para que el algoritmo calcule la mejor propuesta de equipos.
            </p>
            <button
              @click="generateTeams"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
            >
              <Cog class="w-4 h-4" />
              Generar Propuesta
            </button>
          </div>

          <!-- Cargando -->
          <div v-if="generating" class="flex flex-col items-center gap-4 py-12">
            <Loader2 class="w-10 h-10 text-brand-500 animate-spin" />
            <p class="text-sm text-gray-500">Ejecutando algoritmo, por favor espere...</p>
          </div>

          <!-- Resultados -->
          <div v-if="proposal && !generating" class="flex flex-col gap-5">

            <!-- Eval banner -->
            <div class="flex items-center gap-3 px-5 py-3 rounded-xl bg-brand-50 border-l-4 border-brand-500">
              <span class="text-sm text-gray-600">Evaluación global:</span>
              <span class="text-sm font-semibold text-brand-700">{{ proposal.formattedEval }}</span>
            </div>

            <!-- Acordeones por proyecto -->
            <div class="flex flex-col gap-3">
              <details
                v-for="(item, pIdx) in (proposal.projectsProposal || [])"
                :key="pIdx"
                class="overflow-hidden rounded-xl border border-gray-200"
                open
              >
                <summary class="flex items-center gap-3 px-5 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors list-none">
                  <Briefcase class="w-4 h-4 text-brand-500 flex-shrink-0" />
                  <span class="text-sm font-semibold text-gray-800 flex-1">
                    {{ item.project?.projectName || 'Proyecto ' + (pIdx + 1) }}
                  </span>
                  <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-600">
                    {{ (item.assignedRoles?.length || 0) }} roles
                  </span>
                </summary>

                <div class="p-4 flex flex-col gap-4">
                  <div v-for="(roleItem, rIdx) in (item.assignedRoles || [])" :key="rIdx" class="flex flex-col gap-2">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-medium text-gray-700">{{ roleItem.role?.roleName }}</span>
                      <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        {{ (roleItem.persons?.length || 0) }} persona(s)
                      </span>
                    </div>
                    <div class="overflow-hidden rounded-lg border border-gray-200">
                      <table class="min-w-full">
                        <thead class="bg-gray-50">
                          <tr>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellidos</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">C.I.</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                          <tr v-for="(person, i) in (roleItem.persons || [])" :key="i" class="hover:bg-gray-50">
                            <td class="px-4 py-2.5 text-sm text-gray-700">{{ person.personName }}</td>
                            <td class="px-4 py-2.5 text-sm text-gray-700">{{ person.surName }}</td>
                            <td class="px-4 py-2.5 text-sm text-gray-700">{{ person.card }}</td>
                          </tr>
                          <tr v-if="!roleItem.persons?.length">
                            <td colspan="3" class="px-4 py-4 text-center text-sm text-gray-400">Sin personas asignadas</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </details>
            </div>

            <!-- Acciones -->
            <div class="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                @click="generateTeams"
                :disabled="generating"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw class="w-4 h-4" />
                Regenerar
              </button>
              <button
                @click="saveTeams"
                :disabled="saving"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
                <Save v-else class="w-4 h-4" />
                Guardar Equipos
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Navegación entre pasos -->
    <div class="flex gap-3">
      <button
        v-if="currentStep > 1"
        @click="prevStep"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <ArrowLeft class="w-4 h-4" />
        Anterior
      </button>
      <button
        v-if="currentStep < 3"
        @click="nextStep"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
      >
        Siguiente
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>

  </div>
</template>
