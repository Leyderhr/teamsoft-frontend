<script setup>
import { ref, computed, watch } from 'vue'
import {
  Award, BarChart2, AlertCircle, Navigation, Bookmark, Brain, Lightbulb,
  Cpu, Network, Equal, Globe, BookOpen, Calendar, Cog, Plus, Minus,
} from 'lucide-vue-next'
import AppSelect from '@/components/ui/AppSelect.vue'
import TeamUpStep3Panel from '@/features/projects/components/TeamUpStep3Panel.vue'
import { useLevels, useCompetenceImportance, useRoleLoad } from '@/services/nomenclatives/queries'
import { useCompetences } from '@/services/competences/queries'
import { useTeamFormationStore } from '@/stores/teamFormation'

const store = useTeamFormationStore()

// ──────────────────────────────────────────────
// Factor definitions
// ──────────────────────────────────────────────
const factors = [
  { id: 'competencia',  label: 'Competencia',          icon: Award,       hasBalance: true,
    enabledKey: 'maxCompetences',          weightKey: 'maxCompetencesWeight',
    balanceKey: 'balanceCompetences',      balanceWeightKey: 'balanceCompetenceWeight' },
  { id: 'workload',     label: 'Carga de trabajo',     icon: BarChart2,   hasBalance: true,
    enabledKey: 'takeWorkLoad',            weightKey: 'workLoadWeight',
    balanceKey: 'balancePersonWorkload',   balanceWeightKey: 'balanceWorkLoadWeight' },
  { id: 'incomp',       label: 'Incompatibilidades',   icon: AlertCircle, hasBalance: false,
    enabledKey: 'minIncomp',              weightKey: 'minIncompWeight',
    balanceKey: null,                     balanceWeightKey: null },
  { id: 'distance',     label: 'Costo a distancia',    icon: Navigation,  hasBalance: true,
    enabledKey: 'minCostDistance',        weightKey: 'minCostDistanceWeight',
    balanceKey: 'balanceCostDistance',    balanceWeightKey: 'balanceCostDistanceWeight' },
  { id: 'rolInterest',  label: 'Interés por el rol',   icon: Bookmark,    hasBalance: true,
    enabledKey: 'maxInterests',           weightKey: 'maxInterestsWeight',
    balanceKey: 'balanceInterests',       balanceWeightKey: 'balanceInterestWeight' },
  { id: 'psico',        label: 'Caract. psicológicas', icon: Brain,       hasBalance: true,
    enabledKey: 'maxBelbinRoles',         weightKey: 'maxBelbinWeight',
    balanceKey: 'balanceBelbinRoles',     balanceWeightKey: 'balanceBelbinWeight' },
  { id: 'teamInterest', label: 'Interés por el equipo',icon: Lightbulb,   hasBalance: false,
    enabledKey: 'maxProjectInterests',    weightKey: 'maxProjectInterestsWeight',
    balanceKey: null,                     balanceWeightKey: null },
  { id: 'mbtiTypes',    label: 'Tipos MBTI',           icon: Cpu,         hasBalance: false,
    enabledKey: 'maxMbtiTypes',           weightKey: 'maxMbtiTypesWeight',
    balanceKey: null,                     balanceWeightKey: null },
  { id: 'multirole',    label: 'Equipo multirol',      icon: Network,     hasBalance: true,
    enabledKey: 'maxMultiroleTeamMembers',       weightKey: 'maxMultiroleTeamMembersWeight',
    balanceKey: 'balanceMultiroleTeamMembers',   balanceWeightKey: 'balanceMultiroleTeamMembersWeight' },
  { id: 'sex',          label: 'Sexo',                 icon: Equal,       hasBalance: true,
    enabledKey: 'maxSex',                        weightKey: 'maxSexWeight',
    balanceKey: 'balanceMaximizeSexFactor',       balanceWeightKey: 'balanceMaximizeSexFactorWeight' },
  { id: 'nationality',  label: 'Nacionalidad',         icon: Globe,       hasBalance: true,
    enabledKey: 'heterogeneousTeams',             weightKey: 'heterogeneousTeamsWeight',
    balanceKey: 'balanceHeterogeneousTeams',       balanceWeightKey: 'balanceHeterogeneousTeamsNacionalityFactorWeight' },
  { id: 'religion',     label: 'Religión',             icon: BookOpen,    hasBalance: true,
    enabledKey: 'maxReligion',                    weightKey: 'maxReligionWeight',
    balanceKey: 'balanceMaximizeReligion',         balanceWeightKey: 'balanceMaximizeReligionWeight' },
  { id: 'age',          label: 'Rango de edades',      icon: Calendar,    hasBalance: true,
    enabledKey: 'maxAgeHeterogeneity',             weightKey: 'maxAgeHeterogeneityWeight',
    balanceKey: 'balanceMaximizeAgeHeterogeneity', balanceWeightKey: 'balanceMaximizeAgeHeterogeneityWeight' },
]

const selectedFactor = ref(null)

// ──────────────────────────────────────────────
// Solution method + algorithm
// ──────────────────────────────────────────────
const solutionModeOptions = [
  { value: 'weighted', label: 'Ponderar los factores' },
  { value: 'equal',    label: 'Dar igual prioridad a todos los factores' },
  { value: 'priority', label: 'Priorizar los factores' },
]

const algorithmLabels = [
  '', 'Búsqueda Directa', 'Algoritmo Greedy', 'Temple Simulado',
  'Búsqueda Tabú', 'Algoritmo Genético', 'Evolución Diferencial',
  'Colonia de Hormigas', 'Optimización por Enjambre', 'Algoritmo Memético',
]

const maxAlgorithm = computed(() =>
  store.step3Factors.solutionMethodOptionTeam === 'MultiObjetivoPuro' ? 9 : 7
)

function incAlgorithm() {
  const next = Math.min((store.step3Factors.solutionAlgorithm ?? 1) + 1, maxAlgorithm.value)
  store.updateStep3Factors({ solutionAlgorithm: next })
}
function decAlgorithm() {
  const prev = Math.max((store.step3Factors.solutionAlgorithm ?? 1) - 1, 1)
  store.updateStep3Factors({ solutionAlgorithm: prev })
}

watch(
  () => store.step3Factors.solutionMethodOptionTeam,
  () => {
    if (store.step3Factors.solutionAlgorithm > maxAlgorithm.value) {
      store.updateStep3Factors({ solutionAlgorithm: maxAlgorithm.value })
    }
  }
)

const solutionMethod = computed({
  get: () => {
    const val = store.step3Factors.solutionMethodOptionTeam
    return val === 'MultiObjetivoPuro' ? 'priority' : 'weighted'
  },
  set: (uiVal) => {
    const map = { weighted: 'FactoresPonderados', equal: 'FactoresPonderados', priority: 'MultiObjetivoPuro' }
    store.updateStep3Factors({ solutionMethodOptionTeam: map[uiVal] ?? 'FactoresPonderados' })
  },
})

// ──────────────────────────────────────────────
// Local refs for UI-only fields
// ──────────────────────────────────────────────
const selectProjectCompetences = ref(false)
const competenceProjectId      = ref(null)
const competenceSettings       = ref({})
const considerNewProjectLoad   = ref(true)
const workLoadRoleLoadId       = ref(null)

// ──────────────────────────────────────────────
// Queries (competence + workload panels)
// ──────────────────────────────────────────────
const { data: levelsData      } = useLevels()
const { data: importanceData  } = useCompetenceImportance()
const { data: competencesData } = useCompetences()
const { data: roleLoadData    } = useRoleLoad()

const levelOptions = computed(() =>
  levelsData.value?.map(l => ({ label: l.levelName ?? l.name, value: l.id })) || []
)
const importanceOptions = computed(() =>
  importanceData.value?.map(i => ({ label: i.importanceName ?? i.name, value: i.id })) || []
)
const roleLoadOptions = computed(() =>
  roleLoadData.value?.map(r => ({ label: r.significance, value: r.id })) || []
)
const technicalCompetences = computed(() =>
  competencesData.value?.filter(c => c.technical === true) || []
)
const genericCompetences = computed(() =>
  competencesData.value?.filter(c => c.technical === false) || []
)

const getMinLevel   = (id) => competenceSettings.value[id]?.minLevel  ?? null
const getImportance = (id) => competenceSettings.value[id]?.importance ?? null
function setMinLevel(id, val) {
  competenceSettings.value[id] = { ...(competenceSettings.value[id] || {}), minLevel: val }
}
function setImportance(id, val) {
  competenceSettings.value[id] = { ...(competenceSettings.value[id] || {}), importance: val }
}

function onRoleLoadSelect(id) {
  workLoadRoleLoadId.value = id
  if (!considerNewProjectLoad.value) return
  const match = roleLoadData.value?.find(r => r.id === id)
  store.updateStep3Factors({
    maxRoleLoad: match ? { value: match.value ?? 40.0 } : null,
  })
}

watch(considerNewProjectLoad, (val) => {
  if (!val) {
    store.updateStep3Factors({ maxRoleLoad: null })
  } else {
    const match = roleLoadData.value?.find(r => r.id === workLoadRoleLoadId.value)
    store.updateStep3Factors({
      maxRoleLoad: match ? { value: match.value ?? 40.0 } : null,
    })
  }
})
</script>

<template>
  <div class="space-y-5">

    <!-- ── 1. Para su solución considerar ────────────────── -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-base font-semibold text-gray-800">Para su solución considerar</h3>
      </div>
      <div class="p-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-end gap-5 flex-wrap">
          <div class="flex flex-col gap-1.5 min-w-[240px] flex-1">
            <label class="text-xs font-medium text-gray-600">Método de solución</label>
            <AppSelect
              :model-value="solutionMethod"
              @update:model-value="solutionMethod = $event"
              :options="solutionModeOptions"
              placeholder="Seleccionar método..."
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-gray-600">
              Vía de solución
              <span class="text-gray-400 font-normal ml-1">({{ store.step3Factors.solutionAlgorithm }}/{{ maxAlgorithm }})</span>
            </label>
            <div class="flex items-center gap-2">
              <button type="button" @click="decAlgorithm"
                class="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer flex-shrink-0">
                <Minus class="w-3.5 h-3.5" />
              </button>
              <div class="min-w-[200px] px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-center">
                <span class="text-sm font-semibold text-brand-600">{{ store.step3Factors.solutionAlgorithm }}</span>
                <span class="text-sm text-gray-500 ml-1.5">{{ algorithmLabels[store.step3Factors.solutionAlgorithm] }}</span>
              </div>
              <button type="button" @click="incAlgorithm"
                class="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer flex-shrink-0">
                <Plus class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 2. Factor grid ─────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-base font-semibold text-gray-800">Factores de Formación</h3>
        <p class="text-sm text-gray-400 mt-0.5">Selecciona un factor para configurarlo. Peso = peso principal · Balanceo = peso de balanceo</p>
      </div>
      <div class="p-5">
        <div class="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-3">
          <button
            v-for="f in factors"
            :key="f.id"
            type="button"
            @click="selectedFactor = selectedFactor === f.id ? null : f.id"
            class="flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all cursor-pointer text-center"
            :class="selectedFactor === f.id
              ? 'border-brand-500 bg-brand-50 shadow-sm'
              : store.step3Factors[f.enabledKey]
                ? 'border-brand-200 bg-brand-50/40 hover:border-brand-300'
                : 'border-gray-200 bg-white hover:border-gray-300'"
          >
            <component :is="f.icon" class="w-4 h-4 flex-shrink-0 transition-colors"
              :class="store.step3Factors[f.enabledKey] ? 'text-brand-500' : 'text-gray-400'" />
            <span class="text-xs font-medium leading-tight"
              :class="store.step3Factors[f.enabledKey] ? 'text-brand-700' : 'text-gray-600'">
              {{ f.label }}
            </span>
            <div class="flex flex-col items-center gap-0.5 w-full mt-0.5">
              <div class="flex items-center gap-0.5">
                <span class="text-[10px] text-gray-400">Peso:</span>
                <span class="text-[10px] font-semibold tabular-nums"
                  :class="store.step3Factors[f.enabledKey] && store.step3Factors[f.weightKey] != null ? 'text-brand-600' : 'text-gray-300'">
                  {{ store.step3Factors[f.enabledKey] && store.step3Factors[f.weightKey] != null ? store.step3Factors[f.weightKey] : '—' }}
                </span>
              </div>
              <div v-if="f.hasBalance" class="flex items-center gap-0.5">
                <span class="text-[10px] text-gray-400">Balanceo:</span>
                <span class="text-[10px] font-semibold tabular-nums"
                  :class="store.step3Factors[f.balanceKey] && store.step3Factors[f.balanceWeightKey] != null ? 'text-brand-400' : 'text-gray-300'">
                  {{ store.step3Factors[f.balanceKey] && store.step3Factors[f.balanceWeightKey] != null ? store.step3Factors[f.balanceWeightKey] : '—' }}
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- ── 3. Factor detail panels ───────────────────────── -->

    <!-- Placeholder -->
    <div v-if="!selectedFactor"
      class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm flex flex-col items-center justify-center py-14 gap-3">
      <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
        <Cog class="w-6 h-6 text-gray-400" />
      </div>
      <p class="text-sm text-gray-400 text-center max-w-xs">
        Selecciona un factor en la cuadrícula para ver y configurar sus opciones
      </p>
    </div>

    <!-- ─── COMPETENCIA ─────────────────────────────────── -->
    <div v-if="selectedFactor === 'competencia'" class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
        <Award class="w-5 h-5 text-brand-500" />
        <h3 class="text-base font-semibold text-gray-800">Competencia</h3>
      </div>
      <div class="p-6 space-y-5">
        <div class="grid grid-cols-2 gap-4">
          <!-- Enable + peso -->
          <div class="flex items-center justify-between gap-3">
            <label class="flex items-center gap-2.5 cursor-pointer min-w-0">
              <input type="checkbox" :checked="store.step3Factors.maxCompetences" @change="store.updateStep3Factors({ maxCompetences: $event.target.checked })"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer flex-shrink-0" />
              <span class="text-sm font-medium text-gray-700 select-none truncate">Tomar en consideración</span>
            </label>
            <div class="flex items-center gap-1.5 flex-shrink-0" :class="!store.step3Factors.maxCompetences && 'opacity-40 pointer-events-none'">
              <span class="text-xs text-gray-500">Peso:</span>
              <input type="number" min="0" max="1" step="0.01" placeholder="0.00"
                :value="store.step3Factors.maxCompetencesWeight" @input="store.updateStep3Factors({ maxCompetencesWeight: Number($event.target.value) })"
                class="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
          <!-- Balance + balance peso -->
          <div class="flex items-center justify-between gap-3" :class="!store.step3Factors.maxCompetences && 'opacity-40 pointer-events-none'">
            <label class="flex items-center gap-2.5 cursor-pointer min-w-0">
              <input type="checkbox" :checked="store.step3Factors.balanceCompetences" @change="store.updateStep3Factors({ balanceCompetences: $event.target.checked })"
                :disabled="!store.step3Factors.maxCompetences"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer flex-shrink-0" />
              <span class="text-sm font-medium text-gray-700 select-none truncate">Ponderar en el equipo</span>
            </label>
            <div class="flex items-center gap-1.5 flex-shrink-0" :class="!store.step3Factors.balanceCompetences && 'opacity-40 pointer-events-none'">
              <span class="text-xs text-gray-500">Balance:</span>
              <input type="number" min="0" max="1" step="0.01" placeholder="0.00"
                :value="store.step3Factors.balanceCompetenceWeight" @input="store.updateStep3Factors({ balanceCompetenceWeight: Number($event.target.value) })"
                class="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
        </div>
        <div class="h-px bg-gray-100" />
        <div :class="!store.step3Factors.maxCompetences && 'opacity-40 pointer-events-none'" class="space-y-4">
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" :checked="selectProjectCompetences" @change="selectProjectCompetences = $event.target.checked"
              :disabled="!store.step3Factors.maxCompetences"
              class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
            <span class="text-sm font-medium text-gray-700 select-none">Seleccionar competencias por proyecto</span>
          </label>
          <div v-if="selectProjectCompetences" class="space-y-5">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-gray-600">Proyecto</label>
              <AppSelect :model-value="competenceProjectId" @update:model-value="competenceProjectId = $event"
                :options="[]" placeholder="Seleccionar proyecto..." :searchable="true" />
            </div>
            <div class="space-y-2">
              <p class="text-sm font-semibold text-gray-700">Competencias Técnicas</p>
              <div class="overflow-hidden rounded-xl border border-gray-200">
                <table class="min-w-full text-sm">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                      <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">Nivel mínimo</th>
                      <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">Importancia</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr v-for="comp in technicalCompetences" :key="comp.id" class="hover:bg-gray-50/50">
                      <td class="px-4 py-2 text-gray-700">{{ comp.competitionName }}</td>
                      <td class="px-4 py-2"><AppSelect size="sm" :model-value="getMinLevel(comp.id)" @update:model-value="setMinLevel(comp.id, $event)" :options="levelOptions" placeholder="Nivel..." /></td>
                      <td class="px-4 py-2"><AppSelect size="sm" :model-value="getImportance(comp.id)" @update:model-value="setImportance(comp.id, $event)" :options="importanceOptions" placeholder="Import..." /></td>
                    </tr>
                    <tr v-if="!technicalCompetences.length"><td colspan="3" class="px-4 py-6 text-center text-sm text-gray-400">Sin competencias técnicas disponibles</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="space-y-2">
              <p class="text-sm font-semibold text-gray-700">Competencias Genéricas</p>
              <div class="overflow-hidden rounded-xl border border-gray-200">
                <table class="min-w-full text-sm">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                      <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">Nivel mínimo</th>
                      <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">Importancia</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr v-for="comp in genericCompetences" :key="comp.id" class="hover:bg-gray-50/50">
                      <td class="px-4 py-2 text-gray-700">{{ comp.competitionName }}</td>
                      <td class="px-4 py-2"><AppSelect size="sm" :model-value="getMinLevel(comp.id)" @update:model-value="setMinLevel(comp.id, $event)" :options="levelOptions" placeholder="Nivel..." /></td>
                      <td class="px-4 py-2"><AppSelect size="sm" :model-value="getImportance(comp.id)" @update:model-value="setImportance(comp.id, $event)" :options="importanceOptions" placeholder="Import..." /></td>
                    </tr>
                    <tr v-if="!genericCompetences.length"><td colspan="3" class="px-4 py-6 text-center text-sm text-gray-400">Sin competencias genéricas disponibles</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── CARGA DE TRABAJO ─────────────────────────────── -->
    <div v-if="selectedFactor === 'workload'" class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
        <BarChart2 class="w-5 h-5 text-brand-500" />
        <h3 class="text-base font-semibold text-gray-800">Carga de trabajo</h3>
      </div>
      <div class="p-6 space-y-5">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center justify-between gap-3">
            <label class="flex items-center gap-2.5 cursor-pointer min-w-0">
              <input type="checkbox" :checked="store.step3Factors.takeWorkLoad" @change="store.updateStep3Factors({ takeWorkLoad: $event.target.checked })"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer flex-shrink-0" />
              <span class="text-sm font-medium text-gray-700 select-none truncate">Tomar en consideración</span>
            </label>
            <div class="flex items-center gap-1.5 flex-shrink-0" :class="!store.step3Factors.takeWorkLoad && 'opacity-40 pointer-events-none'">
              <span class="text-xs text-gray-500">Peso:</span>
              <input type="number" min="0" max="1" step="0.01" placeholder="0.00"
                :value="store.step3Factors.workLoadWeight" @input="store.updateStep3Factors({ workLoadWeight: Number($event.target.value) })"
                class="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
          <div class="flex items-center justify-between gap-3" :class="!store.step3Factors.takeWorkLoad && 'opacity-40 pointer-events-none'">
            <label class="flex items-center gap-2.5 cursor-pointer min-w-0">
              <input type="checkbox" :checked="store.step3Factors.balancePersonWorkload" @change="store.updateStep3Factors({ balancePersonWorkload: $event.target.checked })"
                :disabled="!store.step3Factors.takeWorkLoad"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer flex-shrink-0" />
              <span class="text-sm font-medium text-gray-700 select-none truncate">Ponderar en el equipo</span>
            </label>
            <div class="flex items-center gap-1.5 flex-shrink-0" :class="!store.step3Factors.balancePersonWorkload && 'opacity-40 pointer-events-none'">
              <span class="text-xs text-gray-500">Balance:</span>
              <input type="number" min="0" max="1" step="0.01" placeholder="0.00"
                :value="store.step3Factors.balanceWorkLoadWeight" @input="store.updateStep3Factors({ balanceWorkLoadWeight: Number($event.target.value) })"
                class="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
        </div>
        <div :class="!store.step3Factors.takeWorkLoad && 'opacity-40 pointer-events-none'" class="space-y-3">
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Carga de los equipos asignados</p>
            <label class="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" :checked="store.step3Factors.notAlreadyBossAssigned" @change="store.updateStep3Factors({ notAlreadyBossAssigned: $event.target.checked })"
                :disabled="!store.step3Factors.takeWorkLoad"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <span class="text-sm text-gray-700 select-none">No permitir que ya esté asignado como jefe de proyecto</span>
            </label>
          </div>
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Carga que representa la asignación en el nuevo proyecto</p>
            <div class="flex items-center gap-3 flex-wrap">
              <label class="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" :checked="considerNewProjectLoad" @change="considerNewProjectLoad = $event.target.checked"
                  :disabled="!store.step3Factors.takeWorkLoad"
                  class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              </label>
              <div class="flex-1 min-w-[160px]" :class="!considerNewProjectLoad && 'opacity-40 pointer-events-none'">
                <AppSelect :model-value="workLoadRoleLoadId" @update:model-value="onRoleLoadSelect($event)"
                  :options="roleLoadOptions" placeholder="Seleccionar nivel de carga..."
                  :disabled="!store.step3Factors.takeWorkLoad || !considerNewProjectLoad" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── INCOMPATIBILIDADES ───────────────────────────── -->
    <div v-if="selectedFactor === 'incomp'" class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
        <AlertCircle class="w-5 h-5 text-brand-500" />
        <h3 class="text-base font-semibold text-gray-800">Incompatibilidades</h3>
      </div>
      <div class="p-6 space-y-5">
        <div class="flex items-center gap-5 flex-wrap">
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" :checked="store.step3Factors.minIncomp" @change="store.updateStep3Factors({ minIncomp: $event.target.checked })"
              class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
            <span class="text-sm font-medium text-gray-700 select-none">Minimizar incompatibilidades en el equipo</span>
          </label>
          <div class="flex items-center gap-2" :class="!store.step3Factors.minIncomp && 'opacity-40 pointer-events-none'">
            <span class="text-xs text-gray-500">Peso:</span>
            <input type="number" min="0" max="1" step="0.01" placeholder="0.00"
              :value="store.step3Factors.minIncompWeight" @input="store.updateStep3Factors({ minIncompWeight: Number($event.target.value) })"
              class="w-20 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
          </div>
        </div>
        <div class="h-px bg-gray-100" />
        <div :class="!store.step3Factors.minIncomp && 'opacity-40 pointer-events-none'">
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" :checked="store.step3Factors.anyIncompatibility" @change="store.updateStep3Factors({ anyIncompatibility: $event.target.checked })"
              :disabled="!store.step3Factors.minIncomp"
              class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
            <span class="text-sm text-gray-700 select-none">Considerar cualquier tipo de incompatibilidad</span>
          </label>
        </div>
      </div>
    </div>

    <!-- ─── COSTO A DISTANCIA ────────────────────────────── -->
    <div v-if="selectedFactor === 'distance'" class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
        <Navigation class="w-5 h-5 text-brand-500" />
        <h3 class="text-base font-semibold text-gray-800">Costo de trabajar a distancia</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center justify-between gap-3">
            <label class="flex items-center gap-2.5 cursor-pointer min-w-0">
              <input type="checkbox" :checked="store.step3Factors.minCostDistance" @change="store.updateStep3Factors({ minCostDistance: $event.target.checked })"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer flex-shrink-0" />
              <span class="text-sm font-medium text-gray-700 select-none truncate">Tomar en consideración</span>
            </label>
            <div class="flex items-center gap-1.5 flex-shrink-0" :class="!store.step3Factors.minCostDistance && 'opacity-40 pointer-events-none'">
              <span class="text-xs text-gray-500">Peso:</span>
              <input type="number" min="0" max="1" step="0.01" placeholder="0.00"
                :value="store.step3Factors.minCostDistanceWeight" @input="store.updateStep3Factors({ minCostDistanceWeight: Number($event.target.value) })"
                class="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
          <div class="flex items-center justify-between gap-3" :class="!store.step3Factors.minCostDistance && 'opacity-40 pointer-events-none'">
            <label class="flex items-center gap-2.5 cursor-pointer min-w-0">
              <input type="checkbox" :checked="store.step3Factors.balanceCostDistance" @change="store.updateStep3Factors({ balanceCostDistance: $event.target.checked })"
                :disabled="!store.step3Factors.minCostDistance"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer flex-shrink-0" />
              <span class="text-sm font-medium text-gray-700 select-none truncate">Ponderar en el equipo</span>
            </label>
            <div class="flex items-center gap-1.5 flex-shrink-0" :class="!store.step3Factors.balanceCostDistance && 'opacity-40 pointer-events-none'">
              <span class="text-xs text-gray-500">Balance:</span>
              <input type="number" min="0" max="1" step="0.01" placeholder="0.00"
                :value="store.step3Factors.balanceCostDistanceWeight" @input="store.updateStep3Factors({ balanceCostDistanceWeight: Number($event.target.value) })"
                class="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── INTERÉS POR EL ROL ───────────────────────────── -->
    <div v-if="selectedFactor === 'rolInterest'" class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
        <Bookmark class="w-5 h-5 text-brand-500" />
        <h3 class="text-base font-semibold text-gray-800">Interés por el rol</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center justify-between gap-3">
            <label class="flex items-center gap-2.5 cursor-pointer min-w-0">
              <input type="checkbox" :checked="store.step3Factors.maxInterests" @change="store.updateStep3Factors({ maxInterests: $event.target.checked })"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer flex-shrink-0" />
              <span class="text-sm font-medium text-gray-700 select-none truncate">Tomar en consideración</span>
            </label>
            <div class="flex items-center gap-1.5 flex-shrink-0" :class="!store.step3Factors.maxInterests && 'opacity-40 pointer-events-none'">
              <span class="text-xs text-gray-500">Peso:</span>
              <input type="number" min="0" max="1" step="0.01" placeholder="0.00"
                :value="store.step3Factors.maxInterestsWeight" @input="store.updateStep3Factors({ maxInterestsWeight: Number($event.target.value) })"
                class="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
          <div class="flex items-center justify-between gap-3" :class="!store.step3Factors.maxInterests && 'opacity-40 pointer-events-none'">
            <label class="flex items-center gap-2.5 cursor-pointer min-w-0">
              <input type="checkbox" :checked="store.step3Factors.balanceInterests" @change="store.updateStep3Factors({ balanceInterests: $event.target.checked })"
                :disabled="!store.step3Factors.maxInterests"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer flex-shrink-0" />
              <span class="text-sm font-medium text-gray-700 select-none truncate">Ponderar en el equipo</span>
            </label>
            <div class="flex items-center gap-1.5 flex-shrink-0" :class="!store.step3Factors.balanceInterests && 'opacity-40 pointer-events-none'">
              <span class="text-xs text-gray-500">Balance:</span>
              <input type="number" min="0" max="1" step="0.01" placeholder="0.00"
                :value="store.step3Factors.balanceInterestWeight" @input="store.updateStep3Factors({ balanceInterestWeight: Number($event.target.value) })"
                class="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── CARACTERÍSTICAS PSICOLÓGICAS ────────────────── -->
    <div v-if="selectedFactor === 'psico'" class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
        <Brain class="w-5 h-5 text-brand-500" />
        <h3 class="text-base font-semibold text-gray-800">Características psicológicas</h3>
      </div>
      <div class="p-6 space-y-5">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center justify-between gap-3">
            <label class="flex items-center gap-2.5 cursor-pointer min-w-0">
              <input type="checkbox" :checked="store.step3Factors.maxBelbinRoles" @change="store.updateStep3Factors({ maxBelbinRoles: $event.target.checked })"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer flex-shrink-0" />
              <span class="text-sm font-medium text-gray-700 select-none truncate">Maximizar diversidad Belbin</span>
            </label>
            <div class="flex items-center gap-1.5 flex-shrink-0" :class="!store.step3Factors.maxBelbinRoles && 'opacity-40 pointer-events-none'">
              <span class="text-xs text-gray-500">Peso:</span>
              <input type="number" min="0" max="1" step="0.01" placeholder="0.00"
                :value="store.step3Factors.maxBelbinWeight" @input="store.updateStep3Factors({ maxBelbinWeight: Number($event.target.value) })"
                class="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
          <div class="flex items-center justify-between gap-3" :class="!store.step3Factors.maxBelbinRoles && 'opacity-40 pointer-events-none'">
            <label class="flex items-center gap-2.5 cursor-pointer min-w-0">
              <input type="checkbox" :checked="store.step3Factors.balanceBelbinRoles" @change="store.updateStep3Factors({ balanceBelbinRoles: $event.target.checked })"
                :disabled="!store.step3Factors.maxBelbinRoles"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer flex-shrink-0" />
              <span class="text-sm font-medium text-gray-700 select-none truncate">Ponderar en el equipo</span>
            </label>
            <div class="flex items-center gap-1.5 flex-shrink-0" :class="!store.step3Factors.balanceBelbinRoles && 'opacity-40 pointer-events-none'">
              <span class="text-xs text-gray-500">Balance:</span>
              <input type="number" min="0" max="1" step="0.01" placeholder="0.00"
                :value="store.step3Factors.balanceBelbinWeight" @input="store.updateStep3Factors({ balanceBelbinWeight: Number($event.target.value) })"
                class="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
        </div>
        <div class="h-px bg-gray-100" />
        <div class="space-y-3">
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tomar en cuenta los roles de Belbin</p>
            <label class="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" :checked="store.step3Factors.belbinPreference" @change="store.updateStep3Factors({ belbinPreference: $event.target.checked })"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <span class="text-sm text-gray-700 select-none">Tener preferencia por los roles Impulsor y/o Coordinador</span>
            </label>
          </div>
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tomar en cuenta el tipo psicológico de Myers-Briggs</p>
            <label class="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" :checked="store.step3Factors.mbtiExtrovertedPlanner" @change="store.updateStep3Factors({ mbtiExtrovertedPlanner: $event.target.checked })"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
              <span class="text-sm text-gray-700 select-none">
                Ser extrovertido y planificado
                <span class="text-gray-400 text-xs ml-1">(Subtipo E, _, _, J)</span>
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── INTERÉS POR EL EQUIPO ────────────────────────── -->
    <div v-if="selectedFactor === 'teamInterest'" class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
        <Lightbulb class="w-5 h-5 text-brand-500" />
        <h3 class="text-base font-semibold text-gray-800">Interés por el equipo</h3>
      </div>
      <div class="p-6 space-y-5">
        <div class="flex items-center gap-5 flex-wrap">
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" :checked="store.step3Factors.maxProjectInterests" @change="store.updateStep3Factors({ maxProjectInterests: $event.target.checked })"
              class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
            <span class="text-sm font-medium text-gray-700 select-none">Tomar en consideración el interés por participar en el equipo</span>
          </label>
          <div class="flex items-center gap-2" :class="!store.step3Factors.maxProjectInterests && 'opacity-40 pointer-events-none'">
            <span class="text-xs text-gray-500">Peso:</span>
            <input type="number" min="0" max="1" step="0.01" placeholder="0.00"
              :value="store.step3Factors.maxProjectInterestsWeight" @input="store.updateStep3Factors({ maxProjectInterestsWeight: Number($event.target.value) })"
              class="w-20 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
          </div>
        </div>
        <div class="h-px bg-gray-100" />
        <div :class="!store.step3Factors.maxProjectInterests && 'opacity-40 pointer-events-none'">
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" :checked="store.step3Factors.bossTeamInterest" @change="store.updateStep3Factors({ bossTeamInterest: $event.target.checked })"
              :disabled="!store.step3Factors.maxProjectInterests"
              class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
            <span class="text-sm text-gray-700 select-none">Jefes de equipos interesados en estar en el equipo</span>
          </label>
        </div>
      </div>
    </div>

    <!-- ─── TIPOS MBTI ────────────────────────────────────── -->
    <div v-if="selectedFactor === 'mbtiTypes'" class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
        <Cpu class="w-5 h-5 text-brand-500" />
        <h3 class="text-base font-semibold text-gray-800">Tipos MBTI</h3>
      </div>
      <div class="p-6">
        <div class="flex items-center gap-5 flex-wrap">
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" :checked="store.step3Factors.maxMbtiTypes" @change="store.updateStep3Factors({ maxMbtiTypes: $event.target.checked })"
              class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
            <span class="text-sm font-medium text-gray-700 select-none">Maximizar la diversidad de tipos MBTI en el equipo</span>
          </label>
          <div class="flex items-center gap-2" :class="!store.step3Factors.maxMbtiTypes && 'opacity-40 pointer-events-none'">
            <span class="text-xs text-gray-500">Peso:</span>
            <input type="number" min="0" max="1" step="0.01" placeholder="0.00"
              :value="store.step3Factors.maxMbtiTypesWeight" @input="store.updateStep3Factors({ maxMbtiTypesWeight: Number($event.target.value) })"
              class="w-20 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
          </div>
        </div>
      </div>
    </div>

    <!-- ─── EQUIPO MULTIROL ──────────────────────────────── -->
    <div v-if="selectedFactor === 'multirole'" class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
        <Network class="w-5 h-5 text-brand-500" />
        <h3 class="text-base font-semibold text-gray-800">Equipo multirol</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center justify-between gap-3">
            <label class="flex items-center gap-2.5 cursor-pointer min-w-0">
              <input type="checkbox" :checked="store.step3Factors.maxMultiroleTeamMembers" @change="store.updateStep3Factors({ maxMultiroleTeamMembers: $event.target.checked })"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer flex-shrink-0" />
              <span class="text-sm font-medium text-gray-700 select-none truncate">Tomar en consideración</span>
            </label>
            <div class="flex items-center gap-1.5 flex-shrink-0" :class="!store.step3Factors.maxMultiroleTeamMembers && 'opacity-40 pointer-events-none'">
              <span class="text-xs text-gray-500">Peso:</span>
              <input type="number" min="0" max="1" step="0.01" placeholder="0.00"
                :value="store.step3Factors.maxMultiroleTeamMembersWeight" @input="store.updateStep3Factors({ maxMultiroleTeamMembersWeight: Number($event.target.value) })"
                class="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
          <div class="flex items-center justify-between gap-3" :class="!store.step3Factors.maxMultiroleTeamMembers && 'opacity-40 pointer-events-none'">
            <label class="flex items-center gap-2.5 cursor-pointer min-w-0">
              <input type="checkbox" :checked="store.step3Factors.balanceMultiroleTeamMembers" @change="store.updateStep3Factors({ balanceMultiroleTeamMembers: $event.target.checked })"
                :disabled="!store.step3Factors.maxMultiroleTeamMembers"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer flex-shrink-0" />
              <span class="text-sm font-medium text-gray-700 select-none truncate">Ponderar en el equipo</span>
            </label>
            <div class="flex items-center gap-1.5 flex-shrink-0" :class="!store.step3Factors.balanceMultiroleTeamMembers && 'opacity-40 pointer-events-none'">
              <span class="text-xs text-gray-500">Balance:</span>
              <input type="number" min="0" max="1" step="0.01" placeholder="0.00"
                :value="store.step3Factors.balanceMultiroleTeamMembersWeight" @input="store.updateStep3Factors({ balanceMultiroleTeamMembersWeight: Number($event.target.value) })"
                class="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── SEXO ─────────────────────────────────────────── -->
    <div v-if="selectedFactor === 'sex'" class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
        <Equal class="w-5 h-5 text-brand-500" />
        <h3 class="text-base font-semibold text-gray-800">Sexo</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center justify-between gap-3">
            <label class="flex items-center gap-2.5 cursor-pointer min-w-0">
              <input type="checkbox" :checked="store.step3Factors.maxSex" @change="store.updateStep3Factors({ maxSex: $event.target.checked })"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer flex-shrink-0" />
              <span class="text-sm font-medium text-gray-700 select-none truncate">Tomar en consideración</span>
            </label>
            <div class="flex items-center gap-1.5 flex-shrink-0" :class="!store.step3Factors.maxSex && 'opacity-40 pointer-events-none'">
              <span class="text-xs text-gray-500">Peso:</span>
              <input type="number" min="0" max="1" step="0.01" placeholder="0.00"
                :value="store.step3Factors.maxSexWeight" @input="store.updateStep3Factors({ maxSexWeight: Number($event.target.value) })"
                class="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
          <div class="flex items-center justify-between gap-3" :class="!store.step3Factors.maxSex && 'opacity-40 pointer-events-none'">
            <label class="flex items-center gap-2.5 cursor-pointer min-w-0">
              <input type="checkbox" :checked="store.step3Factors.balanceMaximizeSexFactor" @change="store.updateStep3Factors({ balanceMaximizeSexFactor: $event.target.checked })"
                :disabled="!store.step3Factors.maxSex"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer flex-shrink-0" />
              <span class="text-sm font-medium text-gray-700 select-none truncate">Ponderar en el equipo</span>
            </label>
            <div class="flex items-center gap-1.5 flex-shrink-0" :class="!store.step3Factors.balanceMaximizeSexFactor && 'opacity-40 pointer-events-none'">
              <span class="text-xs text-gray-500">Balance:</span>
              <input type="number" min="0" max="1" step="0.01" placeholder="0.00"
                :value="store.step3Factors.balanceMaximizeSexFactorWeight" @input="store.updateStep3Factors({ balanceMaximizeSexFactorWeight: Number($event.target.value) })"
                class="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── NACIONALIDAD ─────────────────────────────────── -->
    <div v-if="selectedFactor === 'nationality'" class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
        <Globe class="w-5 h-5 text-brand-500" />
        <h3 class="text-base font-semibold text-gray-800">Nacionalidad</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center justify-between gap-3">
            <label class="flex items-center gap-2.5 cursor-pointer min-w-0">
              <input type="checkbox" :checked="store.step3Factors.heterogeneousTeams" @change="store.updateStep3Factors({ heterogeneousTeams: $event.target.checked })"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer flex-shrink-0" />
              <span class="text-sm font-medium text-gray-700 select-none truncate">Tomar en consideración</span>
            </label>
            <div class="flex items-center gap-1.5 flex-shrink-0" :class="!store.step3Factors.heterogeneousTeams && 'opacity-40 pointer-events-none'">
              <span class="text-xs text-gray-500">Peso:</span>
              <input type="number" min="0" max="1" step="0.01" placeholder="0.00"
                :value="store.step3Factors.heterogeneousTeamsWeight" @input="store.updateStep3Factors({ heterogeneousTeamsWeight: Number($event.target.value) })"
                class="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
          <div class="flex items-center justify-between gap-3" :class="!store.step3Factors.heterogeneousTeams && 'opacity-40 pointer-events-none'">
            <label class="flex items-center gap-2.5 cursor-pointer min-w-0">
              <input type="checkbox" :checked="store.step3Factors.balanceHeterogeneousTeams" @change="store.updateStep3Factors({ balanceHeterogeneousTeams: $event.target.checked })"
                :disabled="!store.step3Factors.heterogeneousTeams"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer flex-shrink-0" />
              <span class="text-sm font-medium text-gray-700 select-none truncate">Ponderar en el equipo</span>
            </label>
            <div class="flex items-center gap-1.5 flex-shrink-0" :class="!store.step3Factors.balanceHeterogeneousTeams && 'opacity-40 pointer-events-none'">
              <span class="text-xs text-gray-500">Balance:</span>
              <input type="number" min="0" max="1" step="0.01" placeholder="0.00"
                :value="store.step3Factors.balanceHeterogeneousTeamsNacionalityFactorWeight" @input="store.updateStep3Factors({ balanceHeterogeneousTeamsNacionalityFactorWeight: Number($event.target.value) })"
                class="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── RELIGIÓN ──────────────────────────────────────── -->
    <div v-if="selectedFactor === 'religion'" class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
        <BookOpen class="w-5 h-5 text-brand-500" />
        <h3 class="text-base font-semibold text-gray-800">Religión</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center justify-between gap-3">
            <label class="flex items-center gap-2.5 cursor-pointer min-w-0">
              <input type="checkbox" :checked="store.step3Factors.maxReligion" @change="store.updateStep3Factors({ maxReligion: $event.target.checked })"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer flex-shrink-0" />
              <span class="text-sm font-medium text-gray-700 select-none truncate">Tomar en consideración</span>
            </label>
            <div class="flex items-center gap-1.5 flex-shrink-0" :class="!store.step3Factors.maxReligion && 'opacity-40 pointer-events-none'">
              <span class="text-xs text-gray-500">Peso:</span>
              <input type="number" min="0" max="1" step="0.01" placeholder="0.00"
                :value="store.step3Factors.maxReligionWeight" @input="store.updateStep3Factors({ maxReligionWeight: Number($event.target.value) })"
                class="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
          <div class="flex items-center justify-between gap-3" :class="!store.step3Factors.maxReligion && 'opacity-40 pointer-events-none'">
            <label class="flex items-center gap-2.5 cursor-pointer min-w-0">
              <input type="checkbox" :checked="store.step3Factors.balanceMaximizeReligion" @change="store.updateStep3Factors({ balanceMaximizeReligion: $event.target.checked })"
                :disabled="!store.step3Factors.maxReligion"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer flex-shrink-0" />
              <span class="text-sm font-medium text-gray-700 select-none truncate">Ponderar en el equipo</span>
            </label>
            <div class="flex items-center gap-1.5 flex-shrink-0" :class="!store.step3Factors.balanceMaximizeReligion && 'opacity-40 pointer-events-none'">
              <span class="text-xs text-gray-500">Balance:</span>
              <input type="number" min="0" max="1" step="0.01" placeholder="0.00"
                :value="store.step3Factors.balanceMaximizeReligionWeight" @input="store.updateStep3Factors({ balanceMaximizeReligionWeight: Number($event.target.value) })"
                class="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── RANGO DE EDADES ──────────────────────────────── -->
    <div v-if="selectedFactor === 'age'" class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
        <Calendar class="w-5 h-5 text-brand-500" />
        <h3 class="text-base font-semibold text-gray-800">Rango de edades</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center justify-between gap-3">
            <label class="flex items-center gap-2.5 cursor-pointer min-w-0">
              <input type="checkbox" :checked="store.step3Factors.maxAgeHeterogeneity" @change="store.updateStep3Factors({ maxAgeHeterogeneity: $event.target.checked })"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer flex-shrink-0" />
              <span class="text-sm font-medium text-gray-700 select-none truncate">Tomar en consideración</span>
            </label>
            <div class="flex items-center gap-1.5 flex-shrink-0" :class="!store.step3Factors.maxAgeHeterogeneity && 'opacity-40 pointer-events-none'">
              <span class="text-xs text-gray-500">Peso:</span>
              <input type="number" min="0" max="1" step="0.01" placeholder="0.00"
                :value="store.step3Factors.maxAgeHeterogeneityWeight" @input="store.updateStep3Factors({ maxAgeHeterogeneityWeight: Number($event.target.value) })"
                class="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
          <div class="flex items-center justify-between gap-3" :class="!store.step3Factors.maxAgeHeterogeneity && 'opacity-40 pointer-events-none'">
            <label class="flex items-center gap-2.5 cursor-pointer min-w-0">
              <input type="checkbox" :checked="store.step3Factors.balanceMaximizeAgeHeterogeneity" @change="store.updateStep3Factors({ balanceMaximizeAgeHeterogeneity: $event.target.checked })"
                :disabled="!store.step3Factors.maxAgeHeterogeneity"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer flex-shrink-0" />
              <span class="text-sm font-medium text-gray-700 select-none truncate">Ponderar en el equipo</span>
            </label>
            <div class="flex items-center gap-1.5 flex-shrink-0" :class="!store.step3Factors.balanceMaximizeAgeHeterogeneity && 'opacity-40 pointer-events-none'">
              <span class="text-xs text-gray-500">Balance:</span>
              <input type="number" min="0" max="1" step="0.01" placeholder="0.00"
                :value="store.step3Factors.balanceMaximizeAgeHeterogeneityWeight" @input="store.updateStep3Factors({ balanceMaximizeAgeHeterogeneityWeight: Number($event.target.value) })"
                class="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 4. Panel lateral (FAB + slide-out) ─────────────── -->
    <TeamUpStep3Panel />

  </div>
</template>
