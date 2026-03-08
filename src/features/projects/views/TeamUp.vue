<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Panel from 'primevue/panel'
import Button from 'primevue/button'
import MultiSelect from 'primevue/multiselect'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import RadioButton from 'primevue/radiobutton'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import Tag from 'primevue/tag'
import Divider from 'primevue/divider'
import ProgressSpinner from 'primevue/progressspinner'

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

// Configuración de roles
const confRole     = ref('custom')  // 'custom' | 'all'
const maximumRoles = ref(3)

// Opciones booleanas de formación
const onlyOneProject = ref(true)
const confAllGroup   = ref(false)

// Modo de formación (1-4)
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
const proposal   = ref(null)   // { formattedEval, projectsProposal }

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
// Construcción del payload para la API
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
// Generar propuesta de equipo
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
// Guardar equipos en la BD
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

onMounted(() => {
  loadProjects()
  loadGroups()
})
</script>

<template>
  <div class="p-4 pl-15">
    <h1 class="titulo text-black text-left">Formar Equipo</h1>

    <!-- ======================== -->
    <!-- Indicador de pasos       -->
    <!-- ======================== -->
    <div class="steps-bar flex align-items-center gap-0 mb-6">
      <div
          v-for="(stepLabel, idx) in ['Selección y Configuración', 'Parámetros del Algoritmo', 'Generar y Guardar']"
          :key="idx"
          class="step-item flex align-items-center"
      >
        <div class="flex align-items-center gap-2 step-btn" @click="idx + 1 < currentStep && (currentStep = idx + 1)">
          <div :class="['step-circle', currentStep > idx + 1 ? 'done' : currentStep === idx + 1 ? 'active' : '']">
            <i v-if="currentStep > idx + 1" class="pi pi-check" style="font-size: 0.85rem"/>
            <span v-else>{{ idx + 1 }}</span>
          </div>
          <span :class="['step-label', currentStep === idx + 1 ? 'active-label' : '']">{{ stepLabel }}</span>
        </div>
        <div v-if="idx < 2" class="step-line"/>
      </div>
    </div>

    <!-- ============================== -->
    <!-- PASO 1: Selección y config     -->
    <!-- ============================== -->
    <div v-show="currentStep === 1">
      <Panel header="Selección de Proyectos y Grupos">
        <div class="two-col-grid gap-6 mb-4">
          <div>
            <label class="block font-semibold mb-2 text-gray-700">
              Proyectos a formar equipo <span class="text-red-500">*</span>
            </label>
            <MultiSelect
                v-model="selectedProjectIds"
                :options="availableProjects"
                optionLabel="label"
                optionValue="id"
                placeholder="Seleccione proyectos..."
                :loading="loadingProjects"
                filter
                filterPlaceholder="Buscar proyecto..."
                class="w-full"
                display="chip"
            />
          </div>
          <div>
            <label class="block font-semibold mb-2 text-gray-700">
              Grupos de búsqueda <span class="text-red-500">*</span>
            </label>
            <MultiSelect
                v-model="selectedGroupIds"
                :options="availableGroups"
                optionLabel="label"
                optionValue="id"
                placeholder="Seleccione grupos..."
                :loading="loadingGroups"
                filter
                filterPlaceholder="Buscar grupo..."
                class="w-full"
                display="chip"
            />
          </div>
        </div>
      </Panel>

      <Panel header="Configuración de Roles" class="mt-4">
        <div class="two-col-grid gap-6">
          <div>
            <p class="font-semibold mb-3 text-gray-700">Cantidad máxima de roles por persona</p>
            <div class="flex-col gap-3">
              <div class="flex align-items-center gap-2 mb-2">
                <RadioButton v-model="confRole" inputId="confCustom" value="custom"/>
                <label for="confCustom" class="cursor-pointer">Limitar cantidad máxima de roles</label>
              </div>
              <div v-if="confRole === 'custom'" class="ml-6 mb-3">
                <InputNumber
                    v-model="maximumRoles"
                    :min="1"
                    :max="20"
                    showButtons
                    inputClass="w-20"
                />
              </div>
              <div class="flex align-items-center gap-2">
                <RadioButton v-model="confRole" inputId="confAll" value="all"/>
                <label for="confAll" class="cursor-pointer">Todos los roles posibles</label>
              </div>
            </div>
          </div>
          <div>
            <p class="font-semibold mb-3 text-gray-700">Restricciones adicionales</p>
            <div class="flex-col gap-3">
              <div class="flex align-items-center gap-2 mb-3">
                <Checkbox v-model="onlyOneProject" :binary="true" inputId="onlyOne"/>
                <label for="onlyOne" class="cursor-pointer">Cada trabajador en un solo proyecto</label>
              </div>
              <div class="flex align-items-center gap-2">
                <Checkbox v-model="confAllGroup" :binary="true" inputId="allGroup"/>
                <label for="allGroup" class="cursor-pointer">Usar toda la plantilla de grupos</label>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel header="Modo de Formación" class="mt-4">
        <p class="text-gray-500 mb-4 text-sm">Define el orden y estrategia con que el algoritmo construye los equipos.</p>
        <div class="two-col-grid gap-3">
          <div v-for="opt in formModeOptions" :key="opt.value" class="flex align-items-center gap-2">
            <RadioButton v-model="confFormMode" :inputId="'fm' + opt.value" :value="opt.value"/>
            <label :for="'fm' + opt.value" class="cursor-pointer">{{ opt.label }}</label>
          </div>
        </div>
      </Panel>
    </div>

    <!-- ================================= -->
    <!-- PASO 2: Parámetros del algoritmo  -->
    <!-- ================================= -->
    <div v-show="currentStep === 2">
      <Panel header="Funciones Objetivo">
        <p class="text-gray-500 mb-4 text-sm">
          Seleccione las funciones a optimizar y asigne sus pesos. La suma de los pesos activos debe ser ≤ 1.0.
        </p>
        <div class="two-col-grid gap-4">
          <div :class="['obj-card', maxCompetences ? 'obj-card--active' : '']">
            <div class="flex align-items-center gap-2 mb-2">
              <Checkbox v-model="maxCompetences" :binary="true" inputId="chkComp"/>
              <label for="chkComp" class="font-semibold cursor-pointer">Maximizar Competencias</label>
            </div>
            <div v-if="maxCompetences" class="ml-6">
              <label class="text-sm text-gray-600 block mb-1">Peso</label>
              <InputNumber v-model="maxCompetencesWeight" :min="0" :max="1" :step="0.05"
                           :minFractionDigits="2" :maxFractionDigits="2" showButtons mode="decimal"/>
            </div>
          </div>
          <div :class="['obj-card', maxInterests ? 'obj-card--active' : '']">
            <div class="flex align-items-center gap-2 mb-2">
              <Checkbox v-model="maxInterests" :binary="true" inputId="chkInt"/>
              <label for="chkInt" class="font-semibold cursor-pointer">Maximizar Intereses</label>
            </div>
            <div v-if="maxInterests" class="ml-6">
              <label class="text-sm text-gray-600 block mb-1">Peso</label>
              <InputNumber v-model="maxInterestsWeight" :min="0" :max="1" :step="0.05"
                           :minFractionDigits="2" :maxFractionDigits="2" showButtons mode="decimal"/>
            </div>
          </div>
          <div :class="['obj-card', minIncomp ? 'obj-card--active' : '']">
            <div class="flex align-items-center gap-2 mb-2">
              <Checkbox v-model="minIncomp" :binary="true" inputId="chkInc"/>
              <label for="chkInc" class="font-semibold cursor-pointer">Minimizar Incompatibilidades</label>
            </div>
            <div v-if="minIncomp" class="ml-6">
              <label class="text-sm text-gray-600 block mb-1">Peso</label>
              <InputNumber v-model="minIncompWeight" :min="0" :max="1" :step="0.05"
                           :minFractionDigits="2" :maxFractionDigits="2" showButtons mode="decimal"/>
            </div>
          </div>
          <div :class="['obj-card', takeWorkLoad ? 'obj-card--active' : '']">
            <div class="flex align-items-center gap-2 mb-2">
              <Checkbox v-model="takeWorkLoad" :binary="true" inputId="chkWork"/>
              <label for="chkWork" class="font-semibold cursor-pointer">Considerar Carga de Trabajo</label>
            </div>
            <div v-if="takeWorkLoad" class="ml-6">
              <label class="text-sm text-gray-600 block mb-1">Peso</label>
              <InputNumber v-model="workLoadWeight" :min="0" :max="1" :step="0.05"
                           :minFractionDigits="2" :maxFractionDigits="2" showButtons mode="decimal"/>
            </div>
          </div>
        </div>
        <div class="flex align-items-center gap-3 mt-4">
          <span class="font-semibold text-gray-700">Suma de pesos:</span>
          <Tag :value="totalWeights.toString()" :severity="weightsOk ? 'success' : 'danger'"/>
          <span v-if="!weightsOk" class="text-red-500 text-sm">La suma no debe superar 1.0</span>
        </div>
      </Panel>

      <Panel header="Configuración del Algoritmo" class="mt-4">
        <div class="three-col-grid gap-6">
          <div>
            <label class="block font-semibold mb-2 text-gray-700">Tipo de algoritmo</label>
            <div class="flex-col gap-2">
              <div v-for="opt in algorithmOptions" :key="opt.value" class="flex align-items-center gap-2 mb-2">
                <RadioButton v-model="solutionAlgorithm" :inputId="'alg' + opt.value" :value="opt.value"/>
                <label :for="'alg' + opt.value" class="cursor-pointer">{{ opt.label }}</label>
              </div>
            </div>
          </div>
          <div>
            <label class="block font-semibold mb-2 text-gray-700">Iteraciones</label>
            <InputNumber v-model="iterations" :min="1" :max="10000" showButtons class="w-full"/>
            <p class="text-gray-400 text-xs mt-1">A mayor número, mejor calidad pero más tiempo de cómputo.</p>
          </div>
          <div>
            <label class="block font-semibold mb-2 text-gray-700">Carga máxima de rol (h)</label>
            <InputNumber v-model="maxRoleLoad" :min="1" :max="200" :step="0.5"
                         :minFractionDigits="1" showButtons class="w-full"/>
            <div class="flex align-items-center gap-2 mt-3">
              <Checkbox v-model="anyIncompatibility" :binary="true" inputId="chkAnyInc"/>
              <label for="chkAnyInc" class="cursor-pointer text-sm">No permitir ninguna incompatibilidad</label>
            </div>
          </div>
        </div>
      </Panel>
    </div>

    <!-- ================================= -->
    <!-- PASO 3: Generar y Guardar         -->
    <!-- ================================= -->
    <div v-show="currentStep === 3">
      <Panel header="Generar Propuesta de Equipo">

        <!-- Estado inicial: sin propuesta y sin cargar -->
        <div class="initial-state" v-if="!proposal && !generating">
          <i class="pi pi-users" style="font-size: 3rem; color: #1094b9"/>
          <p class="text-gray-600 text-center desc-text">
            Todo está configurado. Haz clic en <strong>Generar</strong> para que el algoritmo calcule la mejor propuesta de equipos.
          </p>
          <Button label="Generar Propuesta" icon="pi pi-cog" @click="generateTeams"/>
        </div>

        <!-- Spinner de carga -->
        <div class="initial-state" v-if="generating">
          <ProgressSpinner style="width: 60px; height: 60px;" strokeWidth="4"/>
          <p class="text-gray-600">Ejecutando algoritmo, por favor espere...</p>
        </div>

        <!-- Resultados de la propuesta -->
        <div v-if="proposal && !generating">
          <div class="eval-banner mb-4">
            <i class="pi pi-chart-bar mr-2"/>
            <span class="font-semibold">Evaluación global: </span>
            <span class="text-blue-700">{{ proposal.formattedEval }}</span>
          </div>

          <Accordion :value="['0']" multiple>
            <AccordionPanel
                v-for="(item, pIdx) in (proposal.projectsProposal || [])"
                :key="pIdx"
                :value="String(pIdx)"
            >
              <AccordionHeader>
                <div class="flex align-items-center gap-3 w-full">
                  <i class="pi pi-briefcase text-blue-600"/>
                  <span class="font-semibold">{{ item.project?.projectName || 'Proyecto ' + (pIdx + 1) }}</span>
                  <Tag :value="(item.assignedRoles?.length || 0) + ' roles'" severity="info" class="ml-auto"/>
                </div>
              </AccordionHeader>
              <AccordionContent>
                <div v-for="(roleItem, rIdx) in (item.assignedRoles || [])" :key="rIdx" class="role-section mb-3">
                  <div class="role-header flex align-items-center gap-2 mb-2">
                    <i class="pi pi-id-card text-gray-500"/>
                    <span class="font-semibold text-gray-700">{{ roleItem.role?.roleName }}</span>
                    <Tag :value="(roleItem.persons?.length || 0) + ' persona(s)'" severity="secondary"/>
                  </div>
                  <DataTable :value="roleItem.persons || []" size="small" stripedRows>
                    <Column field="personName" header="Nombre"/>
                    <Column field="surName"    header="Apellidos"/>
                    <Column field="card"       header="C.I."/>
                  </DataTable>
                </div>
              </AccordionContent>
            </AccordionPanel>
          </Accordion>

          <Divider/>
          <div class="flex gap-3 justify-end mt-2">
            <Button label="Regenerar" icon="pi pi-refresh" class="p-button-secondary"
                    @click="generateTeams" :loading="generating"/>
            <Button label="Guardar Equipos" icon="pi pi-save" class="p-button-success"
                    @click="saveTeams" :loading="saving"/>
          </div>
        </div>
      </Panel>
    </div>

    <!-- ======================== -->
    <!-- Navegación entre pasos   -->
    <!-- ======================== -->
    <div class="flex gap-3 mt-5">
      <Button v-if="currentStep > 1" label="Anterior" icon="pi pi-arrow-left"
              class="p-button-secondary" @click="prevStep"/>
      <Button v-if="currentStep < 3" label="Siguiente" icon="pi pi-arrow-right"
              iconPos="right" @click="nextStep"/>
    </div>
  </div>
</template>

<style scoped>
.titulo {
  font-size: 2.5rem;
  margin: 20px 0;
  font-family: Arial, "Arial CE", "Lucida Grande CE", lucida, "Helvetica CE", sans-serif;
}

/* ---- Step bar ---- */
.steps-bar { flex-wrap: wrap; }
.step-btn  { cursor: default; }

.step-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.95rem;
  background: #e0e0e0;
  color: #666;
  transition: background 0.3s, color 0.3s;
  flex-shrink: 0;
}
.step-circle.active { background: #1094b9; color: #fff; }
.step-circle.done   { background: #2e7d32; color: #fff; cursor: pointer; }

.step-label           { font-size: 0.88rem; color: #888; white-space: nowrap; }
.step-label.active-label { color: #1094b9; font-weight: 600; }

.step-line { height: 2px; width: 60px; background: #e0e0e0; margin: 0 8px; }

/* ---- Grid ---- */
.two-col-grid   { display: grid; grid-template-columns: repeat(2, 1fr); }
.three-col-grid { display: grid; grid-template-columns: repeat(3, 1fr); }

/* ---- Objective function cards ---- */
.obj-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.obj-card--active {
  border-color: #1094b9;
  box-shadow: 0 0 0 2px rgba(16, 148, 185, 0.12);
}

/* ---- Initial / loading state ---- */
.initial-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  padding: 3rem 1rem;
}
.desc-text { max-width: 28rem; }

/* ---- Eval banner ---- */
.eval-banner {
  background: #e3f2fd;
  border-left: 4px solid #1094b9;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  color: #0d47a1;
  font-size: 0.95rem;
}

/* ---- Role section ---- */
.role-section {
  padding: 0.75rem;
  background: #fafafa;
  border-radius: 6px;
}
.role-header {
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e8e8e8;
}

/* ---- Helpers ---- */
.flex-col        { display: flex; flex-direction: column; }
.gap-2           { gap: 0.5rem; }
.gap-3           { gap: 0.75rem; }
.gap-4           { gap: 1rem; }
.gap-6           { gap: 1.5rem; }
.mb-1            { margin-bottom: 0.25rem; }
.mb-2            { margin-bottom: 0.5rem; }
.mb-3            { margin-bottom: 0.75rem; }
.mb-4            { margin-bottom: 1rem; }
.mb-6            { margin-bottom: 1.5rem; }
.mt-1            { margin-top: 0.25rem; }
.mt-2            { margin-top: 0.5rem; }
.mt-3            { margin-top: 0.75rem; }
.mt-4            { margin-top: 1rem; }
.mt-5            { margin-top: 1.25rem; }
.mr-2            { margin-right: 0.5rem; }
.ml-6            { margin-left: 1.5rem; }
.ml-auto         { margin-left: auto; }
.w-full          { width: 100%; }
.w-20            { width: 5rem; }
.block           { display: block; }
.text-center     { text-align: center; }
.text-sm         { font-size: 0.875rem; }
.text-xs         { font-size: 0.75rem; }
.text-red-500    { color: #ef4444; }
.text-blue-600   { color: #2563eb; }
.text-blue-700   { color: #1d4ed8; }
.text-gray-400   { color: #9ca3af; }
.text-gray-500   { color: #6b7280; }
.text-gray-600   { color: #4b5563; }
.text-gray-700   { color: #374151; }
.font-semibold   { font-weight: 600; }
.justify-end     { justify-content: flex-end; }
.cursor-pointer  { cursor: pointer; }
</style>
