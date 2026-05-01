<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import {
  Award, BarChart2, Bookmark, Brain, Navigation, Lightbulb,
  Cog, Users, ChevronRight, Trash2, UserCircle, Folder, Loader2, Crown,
} from 'lucide-vue-next'
import AppSelect from '@/components/ui/AppSelect.vue'
import { useLevels, useCompetenceImportance } from '@/services/nomenclatives/queries'
import { useCompetences } from '@/services/competences/queries'
import { useRoles } from '@/services/roles/queries'
import { useBossProposals, useMemberProposals } from '@/services/team-formation/mutations'

const props = defineProps({
  config: { type: Object, required: true },
  availableProjects: { type: Array, default: () => [] },
  selectedGroupIds: { type: Array, default: () => [] },
  teamFormationParams: { type: Object, default: () => ({}) },
})

const toast = useToast()

// Factor card definitions
const factors = [
  { id: 'competencia',     label: 'Competencia',                  icon: Award      },
  { id: 'workload',        label: 'Carga de trabajo',             icon: BarChart2  },
  { id: 'rolInterest',     label: 'Interés por el rol',           icon: Bookmark   },
  { id: 'psico',           label: 'Características psicológicas', icon: Brain      },
  { id: 'distance',        label: 'Costo a distancia',            icon: Navigation },
  { id: 'projectInterest', label: 'Interés por el proyecto',      icon: Lightbulb  },
]

const selectedFactor = ref(null)

// Queries
const { data: levelsData      } = useLevels()
const { data: importanceData  } = useCompetenceImportance()
const { data: competencesData } = useCompetences()
const { data: rolesData        } = useRoles()

const levelOptions = computed(() =>
  levelsData.value?.map(l => ({ label: l.levelName ?? l.name, value: l.id })) || []
)
const importanceOptions = computed(() =>
  importanceData.value?.map(i => ({ label: i.importanceName ?? i.name, value: i.id })) || []
)
const roleOptions = computed(() =>
  rolesData.value?.map(r => ({ label: r.roleName, value: r.id })) || []
)
const technicalCompetences = computed(() =>
  competencesData.value?.filter(c => c.technical === true) || []
)
const genericCompetences = computed(() =>
  competencesData.value?.filter(c => c.technical === false) || []
)

// Factor enabled/weight maps derived from config
const factorEnabled = computed(() => ({
  competencia:     props.config.maxCompetences,
  workload:        props.config.takeWorkLoad,
  rolInterest:     props.config.maxInterests,
  psico:           props.config.psicoEnabled,
  distance:        props.config.distanceEnabled,
  projectInterest: props.config.projectInterestEnabl,
}))
const factorWeight = computed(() => ({
  competencia:     props.config.maxCompetences       ? props.config.maxCompetencesWeight   : null,
  workload:        props.config.takeWorkLoad         ? props.config.workLoadWeight         : null,
  rolInterest:     props.config.maxInterests         ? props.config.maxInterestsWeight     : null,
  psico:           props.config.psicoEnabled         ? props.config.psicoWeight            : null,
  distance:        props.config.distanceEnabled      ? props.config.distanceWeight         : null,
  projectInterest: props.config.projectInterestEnabl ? props.config.projectInterestWeight  : null,
}))

// Competence settings helpers
const getMinLevel   = (id) => props.config.competenceSettings[id]?.minLevel  ?? null
const getImportance = (id) => props.config.competenceSettings[id]?.importance ?? null

function setMinLevel(id, val) {
  props.config.competenceSettings[id] = { ...(props.config.competenceSettings[id] || {}), minLevel: val }
}
function setImportance(id, val) {
  props.config.competenceSettings[id] = { ...(props.config.competenceSettings[id] || {}), importance: val }
}

// ────────────────────────────────────────────────
// Proposals
// ────────────────────────────────────────────────
const proposalMode = ref('boss')   // 'boss' | 'member'
const proposalsTree       = ref([])
const selectedTreePerson  = ref(null)
const assignRoleId        = ref(null)

// Member proposals config
const memberProposalProjectId = ref(null)
const memberProposalRoleId    = ref(null)

// Clear tree when switching modes
watch(proposalMode, () => {
  proposalsTree.value = []
  selectedTreePerson.value = null
  assignRoleId.value = null
})

// Mutations
const bossProposalsMutation   = useBossProposals()
const memberProposalsMutation = useMemberProposals()

const generatingProposals = computed(() =>
  bossProposalsMutation.isPending.value || memberProposalsMutation.isPending.value
)

function getPersonName(person) {
  return [person.personName, person.surName].filter(Boolean).join(' ')
    || person.name
    || [person.firstName, person.lastName].filter(Boolean).join(' ')
    || `${person.id}`
}

function toggleTreeProject(projectId) {
  const item = proposalsTree.value.find(p => p.projectId === projectId)
  if (item) item.expanded = !item.expanded
}

function selectTreePerson(person, project) {
  if (selectedTreePerson.value?.id === person.id && selectedTreePerson.value?.projectId === project.projectId) {
    selectedTreePerson.value = null
    assignRoleId.value = null
    return
  }
  selectedTreePerson.value = { ...person, projectId: project.projectId, projectName: project.projectName }
  // Pre-populate role from the tree node's context (set for member proposals)
  assignRoleId.value = project.roleId ?? null
}

function assignAsBoss() {
  if (!selectedTreePerson.value) {
    toast.add({ severity: 'warn', summary: 'Sin selección', detail: 'Selecciona una persona', life: 3000 })
    return
  }
  const duplicate = props.config.fixedMembers.some(
    m => m.personId === selectedTreePerson.value.id &&
         m.isBoss &&
         m.projectId === selectedTreePerson.value.projectId
  )
  if (duplicate) {
    toast.add({ severity: 'warn', summary: 'Ya asignado', detail: 'Esta persona ya está fijada como jefe en este proyecto', life: 3000 })
    return
  }
  props.config.fixedMembers.push({
    personId:    selectedTreePerson.value.id,
    personName:  selectedTreePerson.value.name,
    roleId:      null,
    roleName:    null,
    projectId:   selectedTreePerson.value.projectId,
    projectName: selectedTreePerson.value.projectName,
    isBoss:      true,
  })
  selectedTreePerson.value = null
  assignRoleId.value = null
}

function assignAsMember() {
  if (!selectedTreePerson.value || !assignRoleId.value) {
    toast.add({ severity: 'warn', summary: 'Selección incompleta', detail: 'Selecciona una persona y un rol', life: 3000 })
    return
  }
  const duplicate = props.config.fixedMembers.some(
    m => m.personId  === selectedTreePerson.value.id &&
         !m.isBoss &&
         m.roleId    === assignRoleId.value &&
         m.projectId === selectedTreePerson.value.projectId
  )
  if (duplicate) {
    toast.add({ severity: 'warn', summary: 'Ya asignado', detail: 'Esta asignación ya existe', life: 3000 })
    return
  }
  const role = rolesData.value?.find(r => r.id === assignRoleId.value)
  props.config.fixedMembers.push({
    personId:    selectedTreePerson.value.id,
    personName:  selectedTreePerson.value.name,
    roleId:      assignRoleId.value,
    roleName:    role?.roleName ?? `Rol ${assignRoleId.value}`,
    projectId:   selectedTreePerson.value.projectId,
    projectName: selectedTreePerson.value.projectName,
    isBoss:      false,
  })
  selectedTreePerson.value = null
  assignRoleId.value = null
}

function removeMember(idx) {
  props.config.fixedMembers.splice(idx, 1)
}

function generateBossProposals() {
  const projectIDs = props.availableProjects.map(p => p.value)
  if (!projectIDs.length) {
    toast.add({ severity: 'warn', summary: 'Sin proyectos', detail: 'Selecciona al menos un proyecto en el paso 1', life: 3000 })
    return
  }
  bossProposalsMutation.mutate(
    {
      teamFormationParameters: props.teamFormationParams,
      projectIDs,
      groupIDs: props.selectedGroupIds,
    },
    {
      onSuccess: (data) => {
        proposalsTree.value = (data?.proposals ?? []).map(item => ({
          projectId:   item.project.id,
          projectName: item.project.projectName,
          expanded:    true,
          type:        'boss',
          roleId:      null,
          persons:     (item.candidates ?? []).map(c => ({
            id:         c.person.id,
            name:       getPersonName(c.person),
            evaluation: c.evaluation,
          })),
        }))
        selectedTreePerson.value = null
        assignRoleId.value = null
        if (!proposalsTree.value.length) {
          toast.add({ severity: 'info', summary: 'Sin candidatos', detail: 'No se encontraron candidatos para jefe', life: 4000 })
        }
      },
      onError: (e) => {
        toast.add({ severity: 'error', summary: 'Error al generar propuestas', detail: e?.message || 'Error en el servidor', life: 5000 })
      },
    }
  )
}

function generateMemberProposals() {
  if (!memberProposalProjectId.value || !memberProposalRoleId.value) {
    toast.add({ severity: 'warn', summary: 'Faltan datos', detail: 'Selecciona un proyecto y un rol', life: 3000 })
    return
  }
  memberProposalsMutation.mutate(
    {
      teamFormationParameters: props.teamFormationParams,
      projectId: memberProposalProjectId.value,
      roleId:    memberProposalRoleId.value,
      groupIDs:  props.selectedGroupIds,
    },
    {
      onSuccess: (data) => {
        const project = data?.project
        const role    = data?.role
        const label   = [project?.projectName, role?.roleName].filter(Boolean).join(' — ')
        proposalsTree.value = project ? [{
          projectId:   project.id,
          projectName: label || project.projectName,
          expanded:    true,
          type:        'member',
          roleId:      role?.id ?? memberProposalRoleId.value,
          persons:     (data?.candidates ?? []).map(c => ({
            id:         c.person.id,
            name:       getPersonName(c.person),
            evaluation: c.evaluation,
          })),
        }] : []
        selectedTreePerson.value = null
        assignRoleId.value = null
        if (!proposalsTree.value.length || !proposalsTree.value[0]?.persons?.length) {
          toast.add({ severity: 'info', summary: 'Sin candidatos', detail: 'No se encontraron candidatos para ese rol', life: 4000 })
        }
      },
      onError: (e) => {
        toast.add({ severity: 'error', summary: 'Error al generar propuestas', detail: e?.message || 'Error en el servidor', life: 5000 })
      },
    }
  )
}
</script>

<template>
  <div class="space-y-5">

    <!-- Fila de factores -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-base font-semibold text-gray-800">Factores de Asignación</h3>
        <p class="text-sm text-gray-400 mt-0.5">Selecciona los factores a tener en cuenta para la asignación e indique un peso a cada factor (0–1)</p>
      </div>
      <div class="p-5">
        <div class="grid grid-cols-3 md:grid-cols-6 gap-3">
          <button
            v-for="f in factors"
            :key="f.id"
            type="button"
            @click="selectedFactor = selectedFactor === f.id ? null : f.id"
            class="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer text-center"
            :class="selectedFactor === f.id
              ? 'border-brand-500 bg-brand-50 shadow-sm'
              : factorEnabled[f.id]
                ? 'border-brand-200 bg-brand-50/40 hover:border-brand-300'
                : 'border-gray-200 bg-white hover:border-gray-300'"
          >
            <component
              :is="f.icon"
              class="w-5 h-5 transition-colors"
              :class="factorEnabled[f.id] ? 'text-brand-500' : 'text-gray-400'"
            />
            <span
              class="text-xs font-medium leading-tight"
              :class="factorEnabled[f.id] ? 'text-brand-700' : 'text-gray-600'"
            >
              {{ f.label }}
            </span>
            <span
              class="text-xs font-semibold tabular-nums"
              :class="factorWeight[f.id] !== null ? 'text-brand-600' : 'text-gray-300'"
            >
              {{ factorWeight[f.id] !== null ? factorWeight[f.id] : '—' }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Cuerpo principal: izquierda (detalle factor) + derecha (árbol + datatable) -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-5">

      <!-- Izquierda: panel de detalle del factor -->
      <div class="lg:col-span-3 space-y-4">

        <!-- Placeholder cuando no hay factor seleccionado -->
        <div
          v-if="!selectedFactor"
          class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm flex flex-col items-center justify-center py-16 gap-3"
        >
          <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <Cog class="w-6 h-6 text-gray-400" />
          </div>
          <p class="text-sm text-gray-400 text-center max-w-xs">
            Selecciona un factor en la fila superior para ver y configurar sus opciones
          </p>
        </div>

        <!-- COMPETENCIA detail -->
        <div v-if="selectedFactor === 'competencia'" class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <Award class="w-5 h-5 text-brand-500" />
            <h3 class="text-base font-semibold text-gray-800">Competencia</h3>
          </div>
          <div class="p-6 space-y-5">

            <!-- Activar + peso en línea -->
            <div class="flex items-center gap-5 flex-wrap">
              <label class="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox"
                  :checked="config.maxCompetences"
                  @change="config.maxCompetences = $event.target.checked"
                  class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                <span class="text-sm font-medium text-gray-700 select-none">Tomar en consideración</span>
              </label>
              <div class="flex items-center gap-2" :class="!config.maxCompetences && 'opacity-40 pointer-events-none'">
                <span class="text-xs text-gray-500">Peso:</span>
                <input
                  type="number" min="0" max="1" step="0.01"
                  placeholder="0.00"
                  :value="config.maxCompetencesWeight"
                  @input="config.maxCompetencesWeight = Number($event.target.value)"
                  class="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div class="h-px bg-gray-100" />

            <!-- Seleccionar competencias por proyecto -->
            <div class="space-y-4" :class="!config.maxCompetences && 'opacity-40 pointer-events-none'">
              <label class="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox"
                  :checked="config.selectProjectCompetences"
                  @change="config.selectProjectCompetences = $event.target.checked"
                  :disabled="!config.maxCompetences"
                  class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                <span class="text-sm font-medium text-gray-700 select-none">Seleccionar competencias por proyecto</span>
              </label>

              <div v-if="config.selectProjectCompetences" class="space-y-5">

                <!-- Selector de proyecto (solo proyectos del Paso 1) -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-medium text-gray-600">Proyecto</label>
                  <AppSelect
                    :model-value="config.competenceProjectId"
                    @update:model-value="config.competenceProjectId = $event"
                    :options="availableProjects"
                    placeholder="Seleccionar proyecto..."
                    :searchable="true"
                  />
                  <p v-if="!availableProjects.length" class="text-xs text-amber-500">
                    No hay proyectos seleccionados. Selecciona proyectos en el Paso 1.
                  </p>
                </div>

                <!-- Tabla: Competencias Técnicas -->
                <div class="space-y-2">
                  <p class="text-sm font-semibold text-gray-700">Competencias Técnicas</p>
                  <div class="overflow-hidden rounded-xl border border-gray-200">
                    <table class="min-w-full text-sm">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                          <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-40">Nivel mínimo</th>
                          <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-40">Importancia</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100">
                        <tr v-for="comp in technicalCompetences" :key="comp.id" class="hover:bg-gray-50/50">
                          <td class="px-4 py-2 text-gray-700">{{ comp.competitionName }}</td>
                          <td class="px-4 py-2">
                            <AppSelect
                              size="sm"
                              :model-value="getMinLevel(comp.id)"
                              @update:model-value="setMinLevel(comp.id, $event)"
                              :options="levelOptions"
                              placeholder="Nivel..."
                            />
                          </td>
                          <td class="px-4 py-2">
                            <AppSelect
                              size="sm"
                              :model-value="getImportance(comp.id)"
                              @update:model-value="setImportance(comp.id, $event)"
                              :options="importanceOptions"
                              placeholder="Import..."
                            />
                          </td>
                        </tr>
                        <tr v-if="!technicalCompetences.length">
                          <td colspan="3" class="px-4 py-6 text-center text-sm text-gray-400">
                            Sin competencias técnicas disponibles
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Tabla: Competencias Genéricas -->
                <div class="space-y-2">
                  <p class="text-sm font-semibold text-gray-700">Competencias Genéricas</p>
                  <div class="overflow-hidden rounded-xl border border-gray-200">
                    <table class="min-w-full text-sm">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                          <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-40">Nivel mínimo</th>
                          <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-40">Importancia</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100">
                        <tr v-for="comp in genericCompetences" :key="comp.id" class="hover:bg-gray-50/50">
                          <td class="px-4 py-2 text-gray-700">{{ comp.competitionName }}</td>
                          <td class="px-4 py-2">
                            <AppSelect
                              size="sm"
                              :model-value="getMinLevel(comp.id)"
                              @update:model-value="setMinLevel(comp.id, $event)"
                              :options="levelOptions"
                              placeholder="Nivel..."
                            />
                          </td>
                          <td class="px-4 py-2">
                            <AppSelect
                              size="sm"
                              :model-value="getImportance(comp.id)"
                              @update:model-value="setImportance(comp.id, $event)"
                              :options="importanceOptions"
                              placeholder="Import..."
                            />
                          </td>
                        </tr>
                        <tr v-if="!genericCompetences.length">
                          <td colspan="3" class="px-4 py-6 text-center text-sm text-gray-400">
                            Sin competencias genéricas disponibles
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        <!-- Placeholder para factores no implementados aún -->
        <div
          v-if="selectedFactor && selectedFactor !== 'competencia'"
          class="bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center py-14 gap-2"
        >
          <component :is="factors.find(f => f.id === selectedFactor)?.icon" class="w-8 h-8 text-gray-300" />
          <p class="text-sm text-gray-400">
            Configuración de <span class="font-medium">{{ factors.find(f => f.id === selectedFactor)?.label }}</span> — próximamente
          </p>
        </div>

      </div>
      <!-- /Izquierda -->

      <!-- Derecha: árbol de propuestas + datatable -->
      <div class="lg:col-span-2 space-y-4">

        <!-- Árbol de propuestas -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">

          <!-- Header con toggle de modo -->
          <div class="px-4 py-3 border-b border-gray-200">
            <h4 class="text-sm font-semibold text-gray-800 mb-2.5">Propuestas</h4>
            <!-- Mode toggle -->
            <div class="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
              <button
                type="button"
                @click="proposalMode = 'boss'"
                class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 transition-colors"
                :class="proposalMode === 'boss'
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'"
              >
                <Crown class="w-3.5 h-3.5" />
                Jefes de Equipo
              </button>
              <button
                type="button"
                @click="proposalMode = 'member'"
                class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 transition-colors border-l border-gray-200"
                :class="proposalMode === 'member'
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'"
              >
                <Users class="w-3.5 h-3.5" />
                Miembros
              </button>
            </div>
          </div>

          <!-- Controles según modo -->
          <div class="px-4 pt-3 pb-2 space-y-2.5">

            <!-- Boss mode: solo botón generar -->
            <template v-if="proposalMode === 'boss'">
              <button
                type="button"
                @click="generateBossProposals"
                :disabled="generatingProposals"
                class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Loader2 v-if="generatingProposals" class="w-3.5 h-3.5 animate-spin" />
                <Crown v-else class="w-3.5 h-3.5" />
                Generar propuestas de Jefe
              </button>
            </template>

            <!-- Member mode: proyecto + rol + botón generar -->
            <template v-else>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs text-gray-500 font-medium">Proyecto</label>
                <AppSelect
                  v-model="memberProposalProjectId"
                  :options="availableProjects"
                  placeholder="Seleccionar proyecto..."
                  :searchable="true"
                />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs text-gray-500 font-medium">Rol</label>
                <AppSelect
                  v-model="memberProposalRoleId"
                  :options="roleOptions"
                  placeholder="Seleccionar rol..."
                  :searchable="true"
                />
              </div>
              <button
                type="button"
                @click="generateMemberProposals"
                :disabled="generatingProposals || !memberProposalProjectId || !memberProposalRoleId"
                class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Loader2 v-if="generatingProposals" class="w-3.5 h-3.5 animate-spin" />
                <Users v-else class="w-3.5 h-3.5" />
                Generar propuestas de Miembro
              </button>
            </template>

          </div>

          <!-- Tree body -->
          <div class="overflow-y-auto max-h-64 px-2 pb-2">
            <div v-if="!proposalsTree.length" class="py-8 text-center">
              <Users class="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p class="text-xs text-gray-400">Sin propuestas. Presiona «Generar propuestas».</p>
            </div>
            <template v-else>
              <div v-for="proj in proposalsTree" :key="proj.projectId" class="select-none">
                <button
                  type="button"
                  @click="toggleTreeProject(proj.projectId)"
                  class="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <ChevronRight
                    class="w-4 h-4 text-gray-400 transition-transform duration-150 flex-shrink-0"
                    :class="proj.expanded ? 'rotate-90' : ''"
                  />
                  <Folder class="w-4 h-4 text-brand-400 flex-shrink-0" />
                  <span class="text-sm font-medium text-gray-700 truncate flex-1">{{ proj.projectName }}</span>
                  <span class="text-xs text-gray-400 flex-shrink-0">{{ proj.persons.length }}</span>
                </button>
                <div v-if="proj.expanded" class="ml-6 space-y-0.5">
                  <button
                    v-for="person in proj.persons"
                    :key="person.id"
                    type="button"
                    @click="selectTreePerson(person, proj)"
                    class="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
                    :class="selectedTreePerson?.id === person.id && selectedTreePerson?.projectId === proj.projectId
                      ? 'bg-brand-50 text-brand-700'
                      : 'hover:bg-gray-50 text-gray-600'"
                  >
                    <UserCircle class="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                    <span class="text-sm truncate flex-1">{{ person.name }}</span>
                    <span
                      v-if="person.evaluation != null"
                      class="text-xs tabular-nums flex-shrink-0 font-medium"
                      :class="selectedTreePerson?.id === person.id ? 'text-brand-500' : 'text-gray-400'"
                    >
                      {{ (person.evaluation * 100).toFixed(0) }}%
                    </span>
                  </button>
                </div>
              </div>
            </template>
          </div>

          <!-- Formulario de asignación -->
          <div class="border-t border-gray-100 p-3 space-y-2">
            <div v-if="selectedTreePerson" class="text-xs text-gray-500 mb-1.5 truncate">
              <span class="font-semibold text-gray-700">{{ selectedTreePerson.name }}</span>
              <span class="text-gray-400"> — {{ selectedTreePerson.projectName }}</span>
            </div>

            <!-- Rol (requerido para fijar como miembro) -->
            <AppSelect
              v-model="assignRoleId"
              :options="roleOptions"
              placeholder="Seleccionar rol (para miembro)..."
              :disabled="!selectedTreePerson"
            />

            <!-- Dos botones: Fijar como Jefe y Fijar como Miembro -->
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="assignAsBoss"
                :disabled="!selectedTreePerson"
                class="flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 border-amber-400 text-amber-700 bg-amber-50 text-xs font-semibold hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Crown class="w-3.5 h-3.5" />
                Fijar como Jefe
              </button>
              <button
                type="button"
                @click="assignAsMember"
                :disabled="!selectedTreePerson || !assignRoleId"
                class="flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 border-brand-400 text-brand-700 bg-brand-50 text-xs font-semibold hover:bg-brand-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Users class="w-3.5 h-3.5" />
                Fijar como Miembro
              </button>
            </div>
          </div>
        </div>

        <!-- Datatable de miembros fijados -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
          <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h4 class="text-sm font-semibold text-gray-800">Asignados Fijados</h4>
            <span class="text-xs text-gray-400">{{ config.fixedMembers.length }} asignado(s)</span>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                  <th class="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Persona</th>
                  <th class="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</th>
                  <th class="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Proyecto</th>
                  <th class="px-2 py-2.5 w-8"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(m, idx) in config.fixedMembers" :key="idx" class="hover:bg-gray-50/50">
                  <td class="px-3 py-2.5">
                    <span
                      v-if="m.isBoss"
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700"
                    >
                      <Crown class="w-3 h-3" />
                      Jefe
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700"
                    >
                      <Users class="w-3 h-3" />
                      Miembro
                    </span>
                  </td>
                  <td class="px-3 py-2.5 text-gray-700 font-medium">{{ m.personName }}</td>
                  <td class="px-3 py-2.5 text-gray-400 text-xs">{{ m.roleName ?? '—' }}</td>
                  <td class="px-3 py-2.5 text-gray-500 truncate max-w-[100px]">{{ m.projectName }}</td>
                  <td class="px-2 py-2.5">
                    <button
                      type="button"
                      @click="removeMember(idx)"
                      class="p-1 rounded text-gray-300 hover:text-error-500 hover:bg-error-50 transition-colors cursor-pointer"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
                <tr v-if="!config.fixedMembers.length">
                  <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-400">
                    Sin asignaciones fijadas
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
      <!-- /Derecha -->

    </div>

  </div>
</template>
