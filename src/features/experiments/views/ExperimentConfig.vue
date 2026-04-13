<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { Save, Loader2, RefreshCw } from 'lucide-vue-next'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import experimentService from '@/features/experiments/services/experimentService.js'

const toast = useToast()
const saving = ref(false)
const loading = ref(false)

// ============ TeamSoft Parameters ============
const initialSolutionOptions = [
  { label: 'Belbin', value: 'BELBIN' },
  { label: 'Competencias', value: 'COMPETENCES' },
  { label: 'Mínimo de roles', value: 'MIN_ROLES' },
  { label: 'Jefe de equipo', value: 'TEAM_LEADER' },
  { label: 'Aleatorio', value: 'RANDOM' }
]
const selectedInitialSolution = ref('RANDOM')
const numPersonTries = ref(3)

const operatorOptions = [
  { label: 'Mutación', value: 'MUTATION' },
  { label: 'Cruzamiento', value: 'CROSSOVER' },
  { label: 'Aleatorio', value: 'RANDOM' }
]
const selectedOperator = ref('RANDOM')

const mutationTypeOptions = [
  { label: 'Sustitución', value: 'SUBSTITUTION' },
  { label: 'Permutación de roles', value: 'ROLE_PERMUTATION' },
  { label: 'Permutación de proyectos', value: 'PROJECT_PERMUTATION' },
  { label: 'Sustitución del jefe', value: 'BOSS_SUBSTITUTION' },
  { label: 'Permutación en todos los roles', value: 'ALL_ROLES_PERMUTATION' }
]

const crossoverTypeOptions = [
  { label: 'Cruce de vector de proyecto', value: 'PROJECT_VECTOR' },
  { label: 'Cruce de vector de rol', value: 'ROLE_VECTOR' },
  { label: 'Cruce de vector de persona', value: 'PERSON_VECTOR' },
  { label: 'Cruce de experiencia en rol', value: 'ROLE_EXPERIENCE' },
  { label: 'Cruce de un punto', value: 'ONE_POINT' },
  { label: 'Cruce de dos puntos', value: 'TWO_POINT' },
  { label: 'Cruce de vector de mejor estado', value: 'BEST_STATE_VECTOR' },
  { label: 'Cruce general de mejor estado', value: 'BEST_STATE_GENERAL' }
]

const operatorTypeOptions = computed(() => {
  if (selectedOperator.value === 'MUTATION') return mutationTypeOptions
  if (selectedOperator.value === 'CROSSOVER') return crossoverTypeOptions
  return []
})
const operatorTypeDisabled = computed(() => selectedOperator.value === 'RANDOM')
const selectedOperatorType = ref(null)

watch(selectedOperator, () => {
  selectedOperatorType.value = null
})

// ============ Configuration Strategy ============
const executions = ref(5)
const iterations = ref(1000)
const calculateTime = ref(false)
const validate = ref(true)
const possibleValidateNumber = ref(10)

// ============ Algorithm Parameters (BICIAM) ============
const hillClimbingRestartCount = ref(10)
const tabuListSize = ref(10)
const tabuListNeighborhoodSize = ref(5)
const distanceHillClimbingRestart = ref(5)
const tabuMultiobjectiveSize = ref(10)

// ============ Load / Save ============
const loadConfig = async () => {
  loading.value = true
  try {
    const data = await experimentService.getConfig()
    selectedInitialSolution.value = data.initialSolution ?? 'RANDOM'
    numPersonTries.value = data.numPersonTries ?? 3
    selectedOperator.value = data.operator ?? 'RANDOM'
    selectedOperatorType.value = data.operatorType ?? null
    executions.value = data.executions ?? 5
    iterations.value = data.iterations ?? 1000
    calculateTime.value = data.calculateTime ?? false
    validate.value = data.validate ?? true
    possibleValidateNumber.value = data.possibleValidateNumber ?? 10
    hillClimbingRestartCount.value = data.hillClimbingRestartCount ?? 10
    tabuListSize.value = data.tabuListSize ?? 10
    tabuListNeighborhoodSize.value = data.tabuListNeighborhoodSize ?? 5
    distanceHillClimbingRestart.value = data.distanceHillClimbingRestart ?? 5
    tabuMultiobjectiveSize.value = data.tabuMultiobjectiveSize ?? 10
  } catch (error) {
    console.warn('Usando valores por defecto para la configuración del experimento')
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    await experimentService.saveConfig({
      initialSolution: selectedInitialSolution.value,
      numPersonTries: numPersonTries.value,
      operator: selectedOperator.value,
      operatorType: selectedOperatorType.value,
      executions: executions.value,
      iterations: iterations.value,
      calculateTime: calculateTime.value,
      validate: validate.value,
      possibleValidateNumber: possibleValidateNumber.value,
      hillClimbingRestartCount: hillClimbingRestartCount.value,
      tabuListSize: tabuListSize.value,
      tabuListNeighborhoodSize: tabuListNeighborhoodSize.value,
      distanceHillClimbingRestart: distanceHillClimbingRestart.value,
      tabuMultiobjectiveSize: tabuMultiobjectiveSize.value
    })
    toast.add({ severity: 'success', summary: 'Guardado', detail: 'Configuración guardada correctamente', life: 3000 })
  } catch (error) {
    console.error('Error guardando configuración:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la configuración', life: 3000 })
  } finally {
    saving.value = false
  }
}

onMounted(loadConfig)
</script>

<template>
  <div>
    <PageBreadcrumb page-title="Configuración del Experimento" :items="[]" />

    <div class="space-y-5">

      <!-- Parámetros de TeamSoft -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-base font-semibold text-gray-800">Parámetros de TeamSoft</h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Solución Inicial</label>
              <select
                v-model="selectedInitialSolution"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white"
              >
                <option v-for="opt in initialSolutionOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Intentos por persona</label>
              <input
                v-model.number="numPersonTries"
                type="number"
                min="1"
                max="100"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Operador</label>
              <select
                v-model="selectedOperator"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white"
              >
                <option v-for="opt in operatorOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Tipo de Operador</label>
              <select
                v-model="selectedOperatorType"
                :disabled="operatorTypeDisabled"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <option value="" disabled selected>No aplica para Aleatorio</option>
                <option v-for="opt in operatorTypeOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

          </div>
        </div>
      </div>

      <!-- Estrategia de Configuración -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-base font-semibold text-gray-800">Estrategia de Configuración</h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Ejecuciones</label>
              <input
                v-model.number="executions"
                type="number"
                min="1"
                max="100"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Iteraciones</label>
              <input
                v-model.number="iterations"
                type="number"
                min="1"
                max="100000"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>

            <div class="flex items-center gap-3">
              <input
                id="calcTime"
                v-model="calculateTime"
                type="checkbox"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer"
              />
              <label for="calcTime" class="text-sm font-medium text-gray-700 cursor-pointer">Calcular tiempo</label>
            </div>

            <div class="flex items-center gap-3">
              <input
                id="validateChk"
                v-model="validate"
                type="checkbox"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer"
              />
              <label for="validateChk" class="text-sm font-medium text-gray-700 cursor-pointer">Validar</label>
            </div>

            <div v-if="validate" class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Número de validaciones</label>
              <input
                v-model.number="possibleValidateNumber"
                type="number"
                min="1"
                max="100"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>

          </div>
        </div>
      </div>

      <!-- Parámetros del Algoritmo (BICIAM) -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-base font-semibold text-gray-800">Parámetros del Algoritmo (BICIAM)</h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Reinicio Hill Climbing</label>
              <input
                v-model.number="hillClimbingRestartCount"
                type="number"
                min="1"
                max="100"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Tamaño de Lista Tabú</label>
              <input
                v-model.number="tabuListSize"
                type="number"
                min="1"
                max="100"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Vecindad de Lista Tabú</label>
              <input
                v-model.number="tabuListNeighborhoodSize"
                type="number"
                min="1"
                max="100"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Distancia Reinicio HC</label>
              <input
                v-model.number="distanceHillClimbingRestart"
                type="number"
                min="1"
                max="100"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Tamaño Tabú Multiobjetivo</label>
              <input
                v-model.number="tabuMultiobjectiveSize"
                type="number"
                min="1"
                max="100"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>

          </div>
        </div>
      </div>

      <!-- Footer actions -->
      <div class="flex justify-end gap-3">
        <button
          @click="loadConfig"
          :disabled="loading"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw class="w-4 h-4" />
          Restablecer
        </button>
        <button
          @click="handleSave"
          :disabled="saving"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
          <Save v-else class="w-4 h-4" />
          Guardar Cambios
        </button>
      </div>

    </div>
  </div>
</template>
