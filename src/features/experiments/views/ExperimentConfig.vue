<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { Save, Loader2, RefreshCw } from 'lucide-vue-next'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import experimentService from '@/features/experiments/services/experimentService.js'
import { parseApiError } from '@/lib/apiError'

const { t } = useI18n()
const toast = useToast()
const saving = ref(false)

// ============ TeamSoft Parameters ============
// initialSolutionConf: 0=Belbin 1=Competencias 2=Min roles 3=Jefe equipo 4=Aleatorio
const initialSolutionOptions = [
  { label: 'Belbin', value: 0 },
  { label: 'Competencias', value: 1 },
  { label: 'Mínimo de roles', value: 2 },
  { label: 'Jefe de equipo', value: 3 },
  { label: 'Aleatorio', value: 4 },
]
const selectedInitialSolution = ref(4)
const numPersonTries = ref(100)

// operatorOpc: 0=Mutación 1=Cruzamiento 2=Aleatorio
const operatorOptions = [
  { label: 'Mutación', value: 0 },
  { label: 'Cruzamiento', value: 1 },
  { label: 'Aleatorio', value: 2 },
]
const selectedOperator = ref(0)

// operatorTypeOpc for mutation: 0-4
const mutationTypeOptions = [
  { label: 'Sustitución', value: 0 },
  { label: 'Permutación de roles', value: 1 },
  { label: 'Permutación de proyectos', value: 2 },
  { label: 'Sustitución del jefe', value: 3 },
  { label: 'Permutación en todos los roles', value: 4 },
]

// operatorTypeOpc for crossover: 0-7
const crossoverTypeOptions = [
  { label: 'Cruce de vector de proyecto', value: 0 },
  { label: 'Cruce de vector de rol', value: 1 },
  { label: 'Cruce de vector de persona', value: 2 },
  { label: 'Cruce de experiencia en rol', value: 3 },
  { label: 'Cruce de un punto', value: 4 },
  { label: 'Cruce de dos puntos', value: 5 },
  { label: 'Cruce de vector de mejor estado', value: 6 },
  { label: 'Cruce general de mejor estado', value: 7 },
]

const operatorTypeOptions = computed(() => {
  if (selectedOperator.value === 0) return mutationTypeOptions
  if (selectedOperator.value === 1) return crossoverTypeOptions
  return []
})
const operatorTypeDisabled = computed(() => selectedOperator.value === 2)
const selectedOperatorType = ref(0)

watch(selectedOperator, () => {
  selectedOperatorType.value = 0
})

// ============ Configuration Strategy ============
const executions = ref(1)
const iterations = ref(100)
const calculateTime = ref(true)
const validate = ref(false)
const possibleValidateNumber = ref(20)

// ============ Algorithm Parameters (BICIAM) ============
const hillClimbingRestartCount    = ref(10)
const tabuSolutionsMaxelements    = ref(20)
const multiobjectiveHCRestartSizeNeighbors  = ref(2)
const multiobjectiveHCDistanceSizeNeighbors = ref(2)
const multiobjectiveTabuSolutionsMaxelements = ref(20)

// ============ Reset / Save ============
function resetDefaults() {
  selectedInitialSolution.value = 4
  numPersonTries.value = 100
  selectedOperator.value = 0
  selectedOperatorType.value = 0
  executions.value = 1
  iterations.value = 100
  calculateTime.value = true
  validate.value = false
  possibleValidateNumber.value = 20
  hillClimbingRestartCount.value = 10
  tabuSolutionsMaxelements.value = 20
  multiobjectiveHCRestartSizeNeighbors.value = 2
  multiobjectiveHCDistanceSizeNeighbors.value = 2
  multiobjectiveTabuSolutionsMaxelements.value = 20
}

const handleSave = async () => {
  saving.value = true
  try {
    await experimentService.saveConfig({
      initialSolutionConf:    selectedInitialSolution.value,
      numberPersonTries:      numPersonTries.value,
      operatorOpc:            selectedOperator.value,
      operatorTypeOpc:        operatorTypeDisabled.value ? 0 : (selectedOperatorType.value ?? 0),
      executions:             executions.value,
      iterations:             iterations.value,
      calculateTime:          calculateTime.value,
      validate:               validate.value,
      possibleValidateNumber: possibleValidateNumber.value,
      hillClimbingRestartCount:              hillClimbingRestartCount.value,
      tabuSolutionsMaxelements:              tabuSolutionsMaxelements.value,
      multiobjectiveHCRestartSizeNeighbors:  multiobjectiveHCRestartSizeNeighbors.value,
      multiobjectiveHCDistanceSizeNeighbors: multiobjectiveHCDistanceSizeNeighbors.value,
      multiobjectiveTabuSolutionsMaxelements: multiobjectiveTabuSolutionsMaxelements.value,
    })
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('common.recordUpdated'), life: 3000 })
  } catch (error) {
    console.error('Error guardando configuración:', error)
    toast.add({ severity: 'error', summary: t('common.error'), detail: await parseApiError(error, t('common.saveError')), life: 5000 })
  } finally {
    saving.value = false
  }
}
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
              <AppSelect
                v-model="selectedInitialSolution"
                :options="initialSolutionOptions"
              />
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
              <AppSelect
                v-model="selectedOperator"
                :options="operatorOptions"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Tipo de Operador</label>
              <AppSelect
                v-model="selectedOperatorType"
                :options="operatorTypeOptions"
                :disabled="operatorTypeDisabled"
                placeholder="No aplica para Aleatorio"
              />
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
                v-model.number="tabuSolutionsMaxelements"
                type="number"
                min="1"
                max="100"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Vecindad HC Multiobjetivo con Reinicio</label>
              <input
                v-model.number="multiobjectiveHCRestartSizeNeighbors"
                type="number"
                min="1"
                max="100"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Distancia HC Multiobjetivo con Reinicio</label>
              <input
                v-model.number="multiobjectiveHCDistanceSizeNeighbors"
                type="number"
                min="1"
                max="100"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Tamaño Tabú Multiobjetivo</label>
              <input
                v-model.number="multiobjectiveTabuSolutionsMaxelements"
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
          @click="resetDefaults"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
          {{ t('common.save') }}
        </button>
      </div>

    </div>
  </div>
</template>
