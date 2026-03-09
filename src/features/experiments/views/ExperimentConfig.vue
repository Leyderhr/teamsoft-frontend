<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import Panel from 'primevue/panel'
import Divider from 'primevue/divider'
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
        // Use defaults if API not available
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
  <div class="p-4 pl-15">
    <h1 class="titulo text-black font-bold">Configuración del Experimento</h1>

    <div class="flex flex-col gap-4 max-w-3xl">

      <!-- Parámetros de TeamSoft -->
      <Panel header="Parámetros de TeamSoft">
        <div class="grid grid-cols-2 gap-5">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold">Solución Inicial</label>
            <Select
              v-model="selectedInitialSolution"
              :options="initialSolutionOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold">Intentos por persona</label>
            <InputNumber v-model="numPersonTries" :min="1" :max="100" showButtons class="w-full" />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold">Operador</label>
            <Select
              v-model="selectedOperator"
              :options="operatorOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold">Tipo de Operador</label>
            <Select
              v-model="selectedOperatorType"
              :options="operatorTypeOptions"
              optionLabel="label"
              optionValue="value"
              :disabled="operatorTypeDisabled"
              placeholder="No aplica para Aleatorio"
              class="w-full"
            />
          </div>
        </div>
      </Panel>

      <!-- Estrategia de Configuración -->
      <Panel header="Estrategia de Configuración">
        <div class="grid grid-cols-2 gap-5">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold">Ejecuciones</label>
            <InputNumber v-model="executions" :min="1" :max="100" showButtons class="w-full" />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold">Iteraciones</label>
            <InputNumber v-model="iterations" :min="1" :max="100000" showButtons class="w-full" />
          </div>

          <div class="flex items-center gap-3 pt-4">
            <Checkbox v-model="calculateTime" :binary="true" inputId="calcTime" />
            <label for="calcTime" class="text-sm font-semibold cursor-pointer">Calcular tiempo</label>
          </div>

          <div class="flex items-center gap-3 pt-4">
            <Checkbox v-model="validate" :binary="true" inputId="validateChk" />
            <label for="validateChk" class="text-sm font-semibold cursor-pointer">Validar</label>
          </div>

          <div v-if="validate" class="flex flex-col gap-2">
            <label class="text-sm font-semibold">Número posible de validaciones</label>
            <InputNumber v-model="possibleValidateNumber" :min="1" :max="100" showButtons class="w-full" />
          </div>
        </div>
      </Panel>

      <!-- Parámetros del Algoritmo BICIAM -->
      <Panel header="Parámetros del Algoritmo (BICIAM)">
        <div class="grid grid-cols-2 gap-5">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold">Reinicio Hill Climbing</label>
            <InputNumber v-model="hillClimbingRestartCount" :min="1" :max="100" showButtons class="w-full" />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold">Tamaño de Lista Tabú</label>
            <InputNumber v-model="tabuListSize" :min="1" :max="100" showButtons class="w-full" />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold">Vecindad de Lista Tabú</label>
            <InputNumber v-model="tabuListNeighborhoodSize" :min="1" :max="100" showButtons class="w-full" />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold">Distancia Reinicio HC</label>
            <InputNumber v-model="distanceHillClimbingRestart" :min="1" :max="100" showButtons class="w-full" />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold">Tamaño Tabú Multiobjetivo</label>
            <InputNumber v-model="tabuMultiobjectiveSize" :min="1" :max="100" showButtons class="w-full" />
          </div>
        </div>
      </Panel>

      <!-- Actions -->
      <div class="flex justify-end gap-2">
        <Button label="Restablecer" icon="pi pi-refresh" severity="secondary" outlined @click="loadConfig" :disabled="loading" />
        <Button label="Guardar Cambios" icon="pi pi-save" :loading="saving" @click="handleSave" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.titulo {
  font-size: 2.5rem;
  margin: 20px 0;
  font-family: Arial, "Arial CE", "Lucida Grande CE", lucida, "Helvetica CE", sans-serif;
}
</style>
