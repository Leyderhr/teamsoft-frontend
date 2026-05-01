<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { Check, ArrowLeft, ArrowRight } from 'lucide-vue-next'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import TeamUpStep1Configure from '@/features/projects/components/TeamUpStep1Configure.vue'
import TeamUpStep2FixMember from '@/features/projects/components/TeamUpStep2FixMember.vue'
import TeamUpStep3FormTeam from '@/features/projects/components/TeamUpStep3FormTeam.vue'
import { useProjects } from '@/services/projects/queries'
import { usePersonGroups } from '@/services/nomenclatives/queries'
import { useTeamFormation } from '@/services/team-formation/queries'
import { useSaveTeams } from '@/services/team-formation/mutations'

const toast = useToast()

// ===========================
// Wizard
// ===========================
const currentStep = ref(1)
const stepLabels = ['Configurar', 'Fijar Miembro', 'Formar Equipo']

// ===========================
// Shared queries
// ===========================
const { data: projectsData, isLoading: loadingProjects } = useProjects()
const { data: groupsData,   isLoading: loadingGroups   } = usePersonGroups()

const availableProjects = computed(() =>
  projectsData.value?.filter(p => !p.close).map(p => ({ label: p.projectName, value: p.id })) || []
)
const availableGroups = computed(() =>
  groupsData.value?.map(g => ({ label: g.name, value: g.id })) || []
)

// ===========================
// Paso 1 — Configurar
// ===========================
const step1Config = reactive({
  selectedProjectIds: [],
  selectedGroupIds: [],
  confRole: false,
  maximumRoles: 3,
  isMinimunRoles: false,
  minimumRole: 1,
  onlyOneProject: true,
  confAllGroup: false,
  bossNeedToBeAssignedToAnotherRoles: false,
  assignBossFirst: true,
  formSimultaneous: true,
})

const showValidation = ref(false)

const step1Valid = computed(() =>
  step1Config.selectedProjectIds.length > 0 && step1Config.selectedGroupIds.length > 0
)
const projectError = computed(() => showValidation.value && step1Config.selectedProjectIds.length === 0)
const groupError   = computed(() => showValidation.value && step1Config.selectedGroupIds.length === 0)

watch(
  () => [step1Config.selectedProjectIds.length, step1Config.selectedGroupIds.length],
  () => {
    if (step1Config.selectedProjectIds.length > 0 && step1Config.selectedGroupIds.length > 0) {
      showValidation.value = false
    }
  }
)

// Projects selected in Step 1 — used for Step 2 competence dropdown and proposals
const step1SelectedProjects = computed(() =>
  availableProjects.value.filter(p => step1Config.selectedProjectIds.includes(p.value))
)

const confFormMode = computed(() => {
  if (step1Config.assignBossFirst) return step1Config.formSimultaneous ? 2 : 1
  return step1Config.formSimultaneous ? 4 : 3
})

// ===========================
// Paso 2 — Fijar Miembro
// ===========================
const step2Config = reactive({
  // Objective factors
  maxCompetences: false,        maxCompetencesWeight: null,
  takeWorkLoad: false,          workLoadWeight: null,
  maxInterests: false,          maxInterestsWeight: null,
  psicoEnabled: false,          psicoWeight: null,
  distanceEnabled: false,       distanceWeight: null,
  projectInterestEnabl: false,  projectInterestWeight: null,
  // Competence detail
  selectProjectCompetences: false,
  competenceProjectId: null,
  competenceSettings: {},
  // Algorithm defaults (not exposed in UI yet)
  minIncomp: false,
  minIncompWeight: 0.1,
  solutionAlgorithm: 1,
  anyIncompatibility: false,
  maxRoleLoad: 40.0,
  // Fixed members
  fixedMembers: [],
})

// ===========================
// Payload builder
// ===========================
const buildTeamFormationParameters = () => ({
  confRole:             step1Config.confRole,
  maximunRoles:         step1Config.maximumRoles,
  isMinimunRoles:       step1Config.isMinimunRoles,
  minimumRole:          step1Config.minimumRole,
  confAllGroup:         step1Config.confAllGroup,
  onlyOneProject:       step1Config.onlyOneProject,
  bossNeedToBeAssignedToAnotherRoles: step1Config.bossNeedToBeAssignedToAnotherRoles,
  confFormMode:         confFormMode.value,
  maxCompetences:         step2Config.maxCompetences,
  maxCompetencesWeight:   step2Config.maxCompetences    ? (step2Config.maxCompetencesWeight  ?? 0) : 0,
  takeWorkLoad:           step2Config.takeWorkLoad,
  workLoadWeight:         step2Config.takeWorkLoad      ? (step2Config.workLoadWeight        ?? 0) : 0,
  maxInterests:           step2Config.maxInterests,
  maxInterestsWeight:     step2Config.maxInterests      ? (step2Config.maxInterestsWeight    ?? 0) : 0,
  minCostDistance:        step2Config.distanceEnabled,
  minCostDistanceWeight:  step2Config.distanceEnabled   ? (step2Config.distanceWeight        ?? 0) : 0,
  maxProjectInterests:    step2Config.projectInterestEnabl,
  maxProjectInterestsWeight: step2Config.projectInterestEnabl ? (step2Config.projectInterestWeight ?? 0) : 0,
  minIncomp:            step2Config.minIncomp,
  minIncompWeight:      step2Config.minIncomp ? (step2Config.minIncompWeight ?? 0) : 0,
  solutionAlgorithm:    step2Config.solutionAlgorithm,
  anyIncompatibility:   step2Config.anyIncompatibility,
  maxRoleLoad:          { value: step2Config.maxRoleLoad },
  fixedWorkers: step2Config.fixedMembers.map(m => ({
    project: { id: m.projectId },
    ...(m.isBoss ? {} : { role: { id: m.roleId } }),
    boss:    { id: m.personId  },
  })),
})

// Reactive params used by Step 2 proposals — always up to date
const proposalTeamParams = computed(() => buildTeamFormationParameters())

const buildPayload = () => ({
  teamFormationParameters: buildTeamFormationParameters(),
  projectsIDs: step1Config.selectedProjectIds,
  groupIDs:    step1Config.selectedGroupIds,
})

// ===========================
// Paso 3 — Formar Equipo
// ===========================
const teamFormationParams = computed(() => buildPayload())
const { data: proposal, refetch: generateTeams, isFetching: generating } = useTeamFormation(
  teamFormationParams, { enabled: false }
)
const saveTeamsMutation = useSaveTeams()
const saving = computed(() => saveTeamsMutation.isPending.value)

const saveTeams = () => {
  if (!proposal.value) return
  saveTeamsMutation.mutate(proposal.value, {
    onSuccess: () => {
      toast.add({ severity: 'success', summary: 'Equipos guardados', detail: 'Los equipos han sido persistidos correctamente', life: 4000 })
      currentStep.value = 1
      step1Config.selectedProjectIds = []
      step1Config.selectedGroupIds   = []
    },
    onError: (e) => {
      toast.add({ severity: 'error', summary: 'Error al guardar', detail: e?.message || 'Error en el servidor', life: 5000 })
    },
  })
}

// ===========================
// Navigation
// ===========================
const nextStep = () => {
  if (currentStep.value === 1) {
    showValidation.value = true
    if (!step1Valid.value) {
      toast.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'Seleccione al menos un proyecto y un grupo de búsqueda', life: 3000 })
      return
    }
  }
  if (currentStep.value < 3) currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--
}
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
          <span
            class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
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

    <!-- Paso 1 -->
    <TeamUpStep1Configure
      v-show="currentStep === 1"
      :config="step1Config"
      :available-projects="availableProjects"
      :available-groups="availableGroups"
      :loading-projects="loadingProjects"
      :loading-groups="loadingGroups"
      :show-validation="showValidation"
      :project-error="projectError"
      :group-error="groupError"
    />

    <!-- Paso 2 -->
    <TeamUpStep2FixMember
      v-show="currentStep === 2"
      :config="step2Config"
      :available-projects="step1SelectedProjects"
      :selected-group-ids="step1Config.selectedGroupIds"
      :team-formation-params="proposalTeamParams"
    />

    <!-- Paso 3 -->
    <TeamUpStep3FormTeam
      v-show="currentStep === 3"
      :proposal="proposal"
      :generating="generating"
      :saving="saving"
      @generate="generateTeams"
      @save="saveTeams"
    />

    <!-- Navegación -->
    <div class="flex justify-end gap-3">
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
