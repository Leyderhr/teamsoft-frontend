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
const initialSolutionOptions = computed(() => [
  { label: t('features.experiments.initialSolution.belbin'), value: 0 },
  { label: t('features.experiments.initialSolution.competences'), value: 1 },
  { label: t('features.experiments.initialSolution.minRoles'), value: 2 },
  { label: t('features.experiments.initialSolution.teamBoss'), value: 3 },
  { label: t('features.experiments.initialSolution.random'), value: 4 },
])
const selectedInitialSolution = ref(4)
const numPersonTries = ref(100)

// operatorOpc: 0=Mutación 1=Cruzamiento 2=Aleatorio
const operatorOptions = computed(() => [
  { label: t('features.experiments.operator.mutation'), value: 0 },
  { label: t('features.experiments.operator.crossover'), value: 1 },
  { label: t('features.experiments.operator.random'), value: 2 },
])
const selectedOperator = ref(0)

// operatorTypeOpc for mutation: 0-4
const mutationTypeOptions = computed(() => [
  { label: t('features.experiments.mutationType.substitution'), value: 0 },
  { label: t('features.experiments.mutationType.rolePermutation'), value: 1 },
  { label: t('features.experiments.mutationType.projectPermutation'), value: 2 },
  { label: t('features.experiments.mutationType.bossSubstitution'), value: 3 },
  { label: t('features.experiments.mutationType.allRolesPermutation'), value: 4 },
])

// operatorTypeOpc for crossover: 0-7
const crossoverTypeOptions = computed(() => [
  { label: t('features.experiments.crossoverType.projectVector'), value: 0 },
  { label: t('features.experiments.crossoverType.roleVector'), value: 1 },
  { label: t('features.experiments.crossoverType.personVector'), value: 2 },
  { label: t('features.experiments.crossoverType.roleExperience'), value: 3 },
  { label: t('features.experiments.crossoverType.onePoint'), value: 4 },
  { label: t('features.experiments.crossoverType.twoPoint'), value: 5 },
  { label: t('features.experiments.crossoverType.bestStateVector'), value: 6 },
  { label: t('features.experiments.crossoverType.bestStateGeneral'), value: 7 },
])

const operatorTypeOptions = computed(() => {
  if (selectedOperator.value === 0) return mutationTypeOptions.value
  if (selectedOperator.value === 1) return crossoverTypeOptions.value
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
    <PageBreadcrumb :page-title="t('features.experiments.title')" :items="[]" />

    <div class="space-y-5">

      <!-- Parámetros de TeamSoft -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-base font-semibold text-gray-800">{{ t('features.experiments.teamSoftParams') }}</h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">{{ t('features.experiments.initialSolutionLabel') }}</label>
              <AppSelect
                v-model="selectedInitialSolution"
                :options="initialSolutionOptions"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">{{ t('features.experiments.personTries') }}</label>
              <input
                v-model.number="numPersonTries"
                type="number"
                min="1"
                max="100"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">{{ t('features.experiments.operatorLabel') }}</label>
              <AppSelect
                v-model="selectedOperator"
                :options="operatorOptions"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">{{ t('features.experiments.operatorTypeLabel') }}</label>
              <AppSelect
                v-model="selectedOperatorType"
                :options="operatorTypeOptions"
                :disabled="operatorTypeDisabled"
                :placeholder="t('features.experiments.notApplicableRandom')"
              />
            </div>

          </div>
        </div>
      </div>

      <!-- Estrategia de Configuración -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-base font-semibold text-gray-800">{{ t('features.experiments.configStrategy') }}</h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">{{ t('features.experiments.executions') }}</label>
              <input
                v-model.number="executions"
                type="number"
                min="1"
                max="100"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">{{ t('features.experiments.iterations') }}</label>
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
              <label for="calcTime" class="text-sm font-medium text-gray-700 cursor-pointer">{{ t('features.experiments.calculateTime') }}</label>
            </div>

            <div class="flex items-center gap-3">
              <input
                id="validateChk"
                v-model="validate"
                type="checkbox"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer"
              />
              <label for="validateChk" class="text-sm font-medium text-gray-700 cursor-pointer">{{ t('features.experiments.validate') }}</label>
            </div>

            <div v-if="validate" class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">{{ t('features.experiments.validationsNumber') }}</label>
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
          <h3 class="text-base font-semibold text-gray-800">{{ t('features.experiments.algorithmParams') }}</h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">{{ t('features.experiments.hillClimbingRestart') }}</label>
              <input
                v-model.number="hillClimbingRestartCount"
                type="number"
                min="1"
                max="100"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">{{ t('features.experiments.tabuListSize') }}</label>
              <input
                v-model.number="tabuSolutionsMaxelements"
                type="number"
                min="1"
                max="100"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">{{ t('features.experiments.multiobjHCRestartNeighbors') }}</label>
              <input
                v-model.number="multiobjectiveHCRestartSizeNeighbors"
                type="number"
                min="1"
                max="100"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">{{ t('features.experiments.multiobjHCDistanceNeighbors') }}</label>
              <input
                v-model.number="multiobjectiveHCDistanceSizeNeighbors"
                type="number"
                min="1"
                max="100"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">{{ t('features.experiments.multiobjTabuSize') }}</label>
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
          {{ t('common.reset') }}
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
