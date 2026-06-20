<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import {
  Award, BarChart2, Bookmark, Brain, Navigation, Lightbulb,
  Cog, Users, ChevronRight, Trash2, UserCircle, Folder, Loader2, Crown, AlertCircle,
} from 'lucide-vue-next'
import AppSelect from '@/components/ui/AppSelect.vue'
import { useLevels, useCompetenceImportance, useRoleLoad } from '@/services/nomenclatives/queries'
import { useCompetences } from '@/services/competences/queries'
import { useRoles } from '@/services/roles/queries'
import { useNonBossRoles, useBossCompetitions } from '@/services/projects/queries'
import { useBossProposals, useMemberProposals } from '@/services/team-formation/mutations'
import { useTeamFormationStore } from '@/stores/teamFormation'
import { parseApiError } from '@/lib/apiError'

const props = defineProps({
  availableProjects: { type: Array, default: () => [] },
})

const store = useTeamFormationStore()
const toast = useToast()
const { t } = useI18n()

// ──────────────────────────────────────────────
// Factor definitions (reactive labels via i18n)
// ──────────────────────────────────────────────
const factors = computed(() => [
  { id: 'competencia',     label: t('features.projects.teamFormation.factorCompetencia'),    icon: Award,      hasWeight: true  },
  { id: 'workload',        label: t('features.projects.teamFormation.factorWorkload'),        icon: BarChart2,  hasWeight: true  },
  { id: 'rolInterest',     label: t('features.projects.teamFormation.factorRolInterest'),     icon: Bookmark,   hasWeight: true  },
  { id: 'psico',           label: t('features.projects.teamFormation.factorPsico'),           icon: Brain,      hasWeight: false },
  { id: 'distance',        label: t('features.projects.teamFormation.factorDistance'),        icon: Navigation, hasWeight: true  },
  { id: 'projectInterest', label: t('features.projects.teamFormation.factorProjectInterest'), icon: Lightbulb,  hasWeight: true  },
])

const selectedFactor = ref(null)

// ──────────────────────────────────────────────
// Queries
// ──────────────────────────────────────────────
const { data: levelsData      } = useLevels()
const { data: importanceData  } = useCompetenceImportance()
const { data: competencesData } = useCompetences()
const { data: rolesData       } = useRoles()
const { data: roleLoadData    } = useRoleLoad()

const levelOptions = computed(() =>
  levelsData.value?.map(l => ({ label: l.significance, value: l.id })) || []
)
const importanceOptions = computed(() =>
  importanceData.value?.map(i => ({ label: i.significance, value: i.id })) || []
)
const roleOptions = computed(() =>
  rolesData.value?.map(r => ({ label: r.roleName, value: r.id })) || []
)
const roleLoadOptions = computed(() =>
  roleLoadData.value?.map(r => ({ label: r.significance, value: r.id })) || []
)

const selectedProjectOptions = computed(() =>
  props.availableProjects.filter(p => store.step1.selectedProjectIds.includes(p.value))
)
const technicalCompetences = computed(() =>
  competencesData.value?.filter(c => c.technical === true) || []
)
const genericCompetences = computed(() =>
  competencesData.value?.filter(c => c.technical === false) || []
)

// ──────────────────────────────────────────────
// Factor enabled/weight state (derived from store)
// ──────────────────────────────────────────────
const factorEnabled = computed(() => ({
  competencia:     store.step2Factors.maxCompetences,
  workload:        store.step2Factors.takeWorkLoad,
  rolInterest:     store.step2Factors.maxInterests,
  psico:           store.step2Factors.belbinPreference || store.step2Factors.mbtiExtrovertedPlanner,
  distance:        store.step2Factors.minCostDistance,
  projectInterest: store.step2Factors.maxProjectInterests,
}))

const factorWeight = computed(() => ({
  competencia:     store.step2Factors.maxCompetences      ? store.step2Factors.maxCompetencesWeight      : null,
  workload:        store.step2Factors.takeWorkLoad        ? store.step2Factors.workLoadWeight            : null,
  rolInterest:     store.step2Factors.maxInterests        ? store.step2Factors.maxInterestsWeight        : null,
  psico:           null,
  distance:        store.step2Factors.minCostDistance     ? store.step2Factors.minCostDistanceWeight     : null,
  projectInterest: store.step2Factors.maxProjectInterests ? store.step2Factors.maxProjectInterestsWeight : null,
}))

// ──────────────────────────────────────────────
// Local refs for UI-only fields (not in store)
// ──────────────────────────────────────────────
const selectProjectCompetences = ref(false)
const competenceProjectId      = ref(null)
const competenceSettings       = ref({})
const considerNewProjectLoad   = ref(true)
const workLoadRoleLoadId       = ref(null)

// ──────────────────────────────────────────────
// Competence settings helpers
// ──────────────────────────────────────────────
const getMinLevel   = (id) => competenceSettings.value[id]?.minLevel  ?? null
const getImportance = (id) => competenceSettings.value[id]?.importance ?? null

function setMinLevel(id, val) {
  competenceSettings.value[id] = { ...(competenceSettings.value[id] || {}), minLevel: val }
}
function setImportance(id, val) {
  competenceSettings.value[id] = { ...(competenceSettings.value[id] || {}), importance: val }
}

// ──────────────────────────────────────────────
// Workload: roleLoad selection updates maxRoleLoad float
// ──────────────────────────────────────────────
function onRoleLoadSelect(id) {
  workLoadRoleLoadId.value = id
  if (!considerNewProjectLoad.value) return
  const match = roleLoadData.value?.find(r => r.id === id)
  store.updateStep2Factors({
    maxRoleLoad: match ? { value: match.value ?? 40.0 } : null,
  })
}

watch(considerNewProjectLoad, (val) => {
  if (!val) {
    store.updateStep2Factors({ maxRoleLoad: null })
  } else {
    const match = roleLoadData.value?.find(r => r.id === workLoadRoleLoadId.value)
    store.updateStep2Factors({
      maxRoleLoad: match ? { value: match.value ?? 40.0 } : null,
    })
  }
})

watch(roleLoadOptions, (opts) => {
  if (opts.length && workLoadRoleLoadId.value === null) {
    onRoleLoadSelect(opts[opts.length - 1].value)
  }
}, { immediate: true })

// ──────────────────────────────────────────────
// Proposals
// ──────────────────────────────────────────────
const proposalMode       = ref('boss')
const bossTree           = ref([])
const memberTree         = ref([])
const proposalsTree      = computed({
  get: () => proposalMode.value === 'boss' ? bossTree.value : memberTree.value,
  set: (v) => { if (proposalMode.value === 'boss') bossTree.value = v; else memberTree.value = v },
})
const selectedTreePerson = ref(null)
const assignRoleId       = ref(null)

const memberProposalProjectId = ref(null)
const memberProposalRoleId    = ref(null)

// ──────────────────────────────────────────────
// Project-scoped queries (non-boss roles + boss competitions)
// ──────────────────────────────────────────────
const nonBossRolesIds       = computed(() => memberProposalProjectId.value ? [memberProposalProjectId.value] : [])
const bossCompetitionIds    = computed(() => competenceProjectId.value      ? [competenceProjectId.value]      : [])
const bossProposalProjectIds = computed(() => bossTree.value.map(p => p.projectId))

const { data: nonBossRolesData     } = useNonBossRoles(nonBossRolesIds)
const { data: bossCompetitionsData } = useBossCompetitions(bossCompetitionIds)
const { data: bossNonBossRolesData } = useNonBossRoles(bossProposalProjectIds)

const nonBossRoleOptions = computed(() => {
  const list = nonBossRolesData.value
  if (!list?.length) return []
  return (list[0].nonBossRoles ?? []).map(r => ({ label: r.roleName, value: r.id }))
})

const bossProjectTechnicalCompetences = computed(() => {
  const list = bossCompetitionsData.value
  if (!list?.length) return []
  return (list[0].technicalCompetitions ?? []).map(rc => rc.competence)
})

const bossProjectGenericCompetences = computed(() => {
  const list = bossCompetitionsData.value
  if (!list?.length) return []
  return (list[0].nonTechnicalCompetitions ?? []).map(rc => rc.competence)
})

const displayTechnicalCompetences = computed(() =>
  selectProjectCompetences.value && competenceProjectId.value
    ? bossProjectTechnicalCompetences.value
    : technicalCompetences.value
)

const displayGenericCompetences = computed(() =>
  selectProjectCompetences.value && competenceProjectId.value
    ? bossProjectGenericCompetences.value
    : genericCompetences.value
)

const weightError = ref(null)

watch(memberProposalProjectId, () => {
  memberProposalRoleId.value = null
})

watch(competenceProjectId, () => {
  competenceSettings.value = {}
})

watch(proposalMode, () => {
  selectedTreePerson.value = null
  assignRoleId.value = null
  weightError.value = null
})

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

function getBossRoleForProject(projectId) {
  const allRoles = rolesData.value ?? []
  const nonBossRolesForProjects = bossNonBossRolesData.value ?? []
  const projectEntry = nonBossRolesForProjects.find(p => p.id === projectId)
  if (!projectEntry) return null
  const nonBossIds = new Set((projectEntry.nonBossRoles ?? []).map(r => r.id))
  return allRoles.find(r => !nonBossIds.has(r.id)) ?? null
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
  if (project.type === 'boss') {
    assignRoleId.value = project.roleId ?? getBossRoleForProject(project.projectId)?.id ?? null
  } else {
    assignRoleId.value = project.roleId ?? null
  }
}

function assignAsBoss() {
  if (!selectedTreePerson.value) {
    toast.add({ severity: 'warn', summary: t('features.projects.teamFormation.noSelectionSummary'), detail: t('features.projects.teamFormation.noSelectionDetail'), life: 3000 })
    return
  }
  if (!assignRoleId.value) {
    toast.add({ severity: 'warn', summary: t('features.projects.teamFormation.roleRequiredSummary'), detail: t('features.projects.teamFormation.roleRequiredDetail'), life: 3000 })
    return
  }
  const role = rolesData.value?.find(r => r.id === assignRoleId.value)
  store.addFixedWorker({
    personId:    selectedTreePerson.value.id,
    personName:  selectedTreePerson.value.name,
    roleId:      assignRoleId.value,
    roleName:    role?.roleName ?? `Rol ${assignRoleId.value}`,
    projectId:   selectedTreePerson.value.projectId,
    projectName: selectedTreePerson.value.projectName,
    isBoss:      true,
  })
  selectedTreePerson.value = null
  assignRoleId.value = null
}

function assignAsMember() {
  if (!selectedTreePerson.value || !assignRoleId.value) {
    toast.add({ severity: 'warn', summary: t('features.projects.teamFormation.incompleteSelectionSummary'), detail: t('features.projects.teamFormation.incompleteSelectionDetail'), life: 3000 })
    return
  }
  const role = rolesData.value?.find(r => r.id === assignRoleId.value)
  store.addFixedWorker({
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
  store.removeFixedWorker(idx)
}

function generateBossProposals() {
  weightError.value = null
  const { valid, error } = store.validateProposalWeights()
  if (!valid) {
    weightError.value = error
    return
  }
  bossProposalsMutation.mutate(
    store.bossProposalsPayload,
    {
      onSuccess: (data) => {
        proposalsTree.value = (data?.proposals ?? []).map(item => ({
          projectId:   item.project.id,
          projectName: item.project.projectName,
          expanded:    true,
          type:        'boss',
          roleId:      item.role?.id ?? null,
          roleName:    item.role?.roleName ?? null,
          persons:     (item.candidates ?? []).map(c => ({
            id:         c.person.id,
            name:       getPersonName(c.person),
            evaluation: c.evaluation,
          })),
        }))
        selectedTreePerson.value = null
        assignRoleId.value = null
        if (!proposalsTree.value.length) {
          toast.add({ severity: 'info', summary: t('features.projects.teamFormation.sinCandidatosSummary'), detail: t('features.projects.teamFormation.noCandidatesBoss'), life: 4000 })
        }
      },
      onError: async (e) => {
        const detail = await parseApiError(e, t('common.saveError'))
        weightError.value = detail
        toast.add({ severity: 'error', summary: t('features.projects.teamFormation.generateErrorSummary'), detail, life: 6000 })
      },
    }
  )
}

function generateMemberProposals() {
  weightError.value = null
  if (!memberProposalProjectId.value || !memberProposalRoleId.value) {
    toast.add({ severity: 'warn', summary: t('features.projects.teamFormation.missingDataSummary'), detail: t('features.projects.teamFormation.missingDataDetail'), life: 3000 })
    return
  }
  const { valid, error } = store.validateProposalWeights()
  if (!valid) {
    weightError.value = error
    return
  }
  const payload = store.memberProposalsPayload(memberProposalProjectId.value, memberProposalRoleId.value)
  memberProposalsMutation.mutate(
    payload,
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
          toast.add({ severity: 'info', summary: t('features.projects.teamFormation.sinCandidatosSummary'), detail: t('features.projects.teamFormation.noCandidatesRole'), life: 4000 })
        }
      },
      onError: async (e) => {
        const detail = await parseApiError(e, t('common.saveError'))
        weightError.value = detail
        toast.add({ severity: 'error', summary: t('features.projects.teamFormation.generateErrorSummary'), detail, life: 6000 })
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
        <h3 class="text-base font-semibold text-gray-800">{{ t('features.projects.teamFormation.factorsTitle') }}</h3>
        <p class="text-sm text-gray-400 mt-0.5">{{ t('features.projects.teamFormation.factorsSubtitle') }}</p>
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
              v-if="f.hasWeight"
              class="text-xs font-semibold tabular-nums"
              :class="factorWeight[f.id] !== null ? 'text-brand-600' : 'text-gray-300'"
            >
              {{ factorWeight[f.id] !== null ? factorWeight[f.id] : '—' }}
            </span>
            <span
              v-else
              class="text-xs font-semibold"
              :class="factorEnabled[f.id] ? 'text-brand-600' : 'text-gray-300'"
            >
              {{ factorEnabled[f.id] ? t('features.projects.teamFormation.factorActive') : '—' }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main layout: left (factor detail) + right (proposals tree + datatable) -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-5">

      <!-- Left: factor detail panel -->
      <div class="lg:col-span-3 space-y-4">

        <!-- Placeholder when no factor selected -->
        <div
          v-if="!selectedFactor"
          class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm flex flex-col items-center justify-center py-16 gap-3"
        >
          <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <Cog class="w-6 h-6 text-gray-400" />
          </div>
          <p class="text-sm text-gray-400 text-center max-w-xs">
            {{ t('features.projects.teamFormation.selectFactorHint') }}
          </p>
        </div>

        <!-- ═══════════════════════════════════════ -->
        <!-- COMPETENCIA                             -->
        <!-- ═══════════════════════════════════════ -->
        <div v-if="selectedFactor === 'competencia'" class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <Award class="w-5 h-5 text-brand-500" />
            <h3 class="text-base font-semibold text-gray-800">{{ t('features.projects.teamFormation.factorCompetencia') }}</h3>
          </div>
          <div class="p-6 space-y-5">

            <div class="flex items-center gap-5 flex-wrap">
              <label class="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox"
                  :checked="store.step2Factors.maxCompetences"
                  @change="store.updateStep2Factors({ maxCompetences: $event.target.checked })"
                  class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                <span class="text-sm font-medium text-gray-700 select-none">{{ t('features.projects.teamFormation.considerCompetences') }}</span>
              </label>
              <div class="flex items-center gap-2" :class="!store.step2Factors.maxCompetences && 'opacity-40 pointer-events-none'">
                <span class="text-xs text-gray-500">{{ t('features.projects.teamFormation.factorWeight') }}</span>
                <input
                  type="number" min="0" max="1" step="0.01"
                  placeholder="0.00"
                  :value="store.step2Factors.maxCompetencesWeight"
                  @input="store.updateStep2Factors({ maxCompetencesWeight: Number($event.target.value) })"
                  class="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div class="h-px bg-gray-100" />

            <div class="space-y-4" :class="!store.step2Factors.maxCompetences && 'opacity-40 pointer-events-none'">
              <label class="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox"
                  :checked="selectProjectCompetences"
                  @change="selectProjectCompetences = $event.target.checked"
                  :disabled="!store.step2Factors.maxCompetences"
                  class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                <span class="text-sm font-medium text-gray-700 select-none">{{ t('features.projects.teamFormation.selectByProject') }}</span>
              </label>

              <div v-if="selectProjectCompetences" class="space-y-5">
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-medium text-gray-600">{{ t('features.projects.teamFormation.projectLabel') }}</label>
                  <AppSelect
                    :model-value="competenceProjectId"
                    @update:model-value="competenceProjectId = $event"
                    :options="selectedProjectOptions"
                    :placeholder="t('common.select')"
                    :searchable="true"
                  />
                  <p v-if="!selectedProjectOptions.length" class="text-xs text-amber-500">
                    {{ t('features.projects.teamFormation.noProjectsSelected') }}
                  </p>
                </div>

                <!-- Competencias Técnicas -->
                <div class="space-y-2">
                  <p class="text-sm font-semibold text-gray-700">{{ t('features.projects.teamFormation.techCompetences') }}</p>
                  <div class="overflow-hidden rounded-xl border border-gray-200">
                    <table class="min-w-full text-sm">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ t('features.projects.teamFormation.nameHeader') }}</th>
                          <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-40">{{ t('features.projects.teamFormation.minLevelHeader') }}</th>
                          <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-40">{{ t('features.projects.teamFormation.importanceHeader') }}</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100">
                        <tr v-for="comp in displayTechnicalCompetences" :key="comp.id" class="hover:bg-gray-50/50">
                          <td class="px-4 py-2 text-gray-700">{{ comp.competitionName }}</td>
                          <td class="px-4 py-2">
                            <AppSelect size="sm" :model-value="getMinLevel(comp.id)" @update:model-value="setMinLevel(comp.id, $event)" :options="levelOptions" :placeholder="t('common.select')" />
                          </td>
                          <td class="px-4 py-2">
                            <AppSelect size="sm" :model-value="getImportance(comp.id)" @update:model-value="setImportance(comp.id, $event)" :options="importanceOptions" :placeholder="t('common.select')" />
                          </td>
                        </tr>
                        <tr v-if="!displayTechnicalCompetences.length">
                          <td colspan="3" class="px-4 py-6 text-center text-sm text-gray-400">{{ t('features.projects.teamFormation.noTechCompetences') }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Competencias Genéricas -->
                <div class="space-y-2">
                  <p class="text-sm font-semibold text-gray-700">{{ t('features.projects.teamFormation.genericCompetences') }}</p>
                  <div class="overflow-hidden rounded-xl border border-gray-200">
                    <table class="min-w-full text-sm">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ t('features.projects.teamFormation.nameHeader') }}</th>
                          <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-40">{{ t('features.projects.teamFormation.minLevelHeader') }}</th>
                          <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-40">{{ t('features.projects.teamFormation.importanceHeader') }}</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100">
                        <tr v-for="comp in displayGenericCompetences" :key="comp.id" class="hover:bg-gray-50/50">
                          <td class="px-4 py-2 text-gray-700">{{ comp.competitionName }}</td>
                          <td class="px-4 py-2">
                            <AppSelect size="sm" :model-value="getMinLevel(comp.id)" @update:model-value="setMinLevel(comp.id, $event)" :options="levelOptions" :placeholder="t('common.select')" />
                          </td>
                          <td class="px-4 py-2">
                            <AppSelect size="sm" :model-value="getImportance(comp.id)" @update:model-value="setImportance(comp.id, $event)" :options="importanceOptions" :placeholder="t('common.select')" />
                          </td>
                        </tr>
                        <tr v-if="!displayGenericCompetences.length">
                          <td colspan="3" class="px-4 py-6 text-center text-sm text-gray-400">{{ t('features.projects.teamFormation.noGenericCompetences') }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- ═══════════════════════════════════════ -->
        <!-- CARGA DE TRABAJO                        -->
        <!-- ═══════════════════════════════════════ -->
        <div v-if="selectedFactor === 'workload'" class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <BarChart2 class="w-5 h-5 text-brand-500" />
            <h3 class="text-base font-semibold text-gray-800">{{ t('features.projects.teamFormation.factorWorkload') }}</h3>
          </div>
          <div class="p-6 space-y-5">

            <div class="flex items-center gap-5 flex-wrap">
              <label class="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox"
                  :checked="store.step2Factors.takeWorkLoad"
                  @change="store.updateStep2Factors({ takeWorkLoad: $event.target.checked })"
                  class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                <span class="text-sm font-medium text-gray-700 select-none">{{ t('features.projects.teamFormation.considerWorkload') }}</span>
              </label>
              <div class="flex items-center gap-2" :class="!store.step2Factors.takeWorkLoad && 'opacity-40 pointer-events-none'">
                <span class="text-xs text-gray-500">{{ t('features.projects.teamFormation.factorWeight') }}</span>
                <input
                  type="number" min="0" max="1" step="0.01"
                  placeholder="0.00"
                  :value="store.step2Factors.workLoadWeight"
                  @input="store.updateStep2Factors({ workLoadWeight: Number($event.target.value) })"
                  class="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div :class="!store.step2Factors.takeWorkLoad && 'opacity-40 pointer-events-none'" class="space-y-4">

              <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3">
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ t('features.projects.teamFormation.assignedTeamsLoadSection') }}</p>
                <label class="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox"
                    :checked="store.step2Factors.notAlreadyBossAssigned"
                    @change="store.updateStep2Factors({ notAlreadyBossAssigned: $event.target.checked })"
                    :disabled="!store.step2Factors.takeWorkLoad"
                    class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                  <span class="text-sm text-gray-700 select-none">{{ t('features.projects.teamFormation.notAlreadyBoss') }}</span>
                </label>
              </div>

              <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3">
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ t('features.projects.teamFormation.newProjectLoadSection') }}</p>
                <div class="flex items-center gap-3 flex-wrap">
                  <label class="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox"
                      :checked="considerNewProjectLoad"
                      @change="considerNewProjectLoad = $event.target.checked"
                      :disabled="!store.step2Factors.takeWorkLoad"
                      class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                  </label>
                  <div class="flex-1 min-w-[160px]" :class="!considerNewProjectLoad && 'opacity-40 pointer-events-none'">
                    <AppSelect
                      :model-value="workLoadRoleLoadId"
                      @update:model-value="onRoleLoadSelect($event)"
                      :options="roleLoadOptions"
                      :placeholder="t('common.select')"
                      :disabled="!store.step2Factors.takeWorkLoad || !considerNewProjectLoad"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════ -->
        <!-- INTERÉS POR EL ROL                      -->
        <!-- ═══════════════════════════════════════ -->
        <div v-if="selectedFactor === 'rolInterest'" class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <Bookmark class="w-5 h-5 text-brand-500" />
            <h3 class="text-base font-semibold text-gray-800">{{ t('features.projects.teamFormation.factorRolInterest') }}</h3>
          </div>
          <div class="p-6">
            <div class="flex items-center gap-5 flex-wrap">
              <label class="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox"
                  :checked="store.step2Factors.maxInterests"
                  @change="store.updateStep2Factors({ maxInterests: $event.target.checked })"
                  class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                <span class="text-sm font-medium text-gray-700 select-none">{{ t('features.projects.teamFormation.considerRolInterest') }}</span>
              </label>
              <div class="flex items-center gap-2" :class="!store.step2Factors.maxInterests && 'opacity-40 pointer-events-none'">
                <span class="text-xs text-gray-500">{{ t('features.projects.teamFormation.factorWeight') }}</span>
                <input
                  type="number" min="0" max="1" step="0.01"
                  placeholder="0.00"
                  :value="store.step2Factors.maxInterestsWeight"
                  @input="store.updateStep2Factors({ maxInterestsWeight: Number($event.target.value) })"
                  class="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════ -->
        <!-- CARACTERÍSTICAS PSICOLÓGICAS            -->
        <!-- ═══════════════════════════════════════ -->
        <div v-if="selectedFactor === 'psico'" class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <Brain class="w-5 h-5 text-brand-500" />
            <h3 class="text-base font-semibold text-gray-800">{{ t('features.projects.teamFormation.factorPsico') }}</h3>
          </div>
          <div class="p-6 space-y-4">

            <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ t('features.projects.teamFormation.belbinSection') }}</p>
              <label class="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox"
                  :checked="store.step2Factors.belbinPreference"
                  @change="store.updateStep2Factors({ belbinPreference: $event.target.checked })"
                  class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                <span class="text-sm text-gray-700 select-none">{{ t('features.projects.teamFormation.belbinLabel') }}</span>
              </label>
            </div>

            <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ t('features.projects.teamFormation.mbtiSection') }}</p>
              <label class="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox"
                  :checked="store.step2Factors.mbtiExtrovertedPlanner"
                  @change="store.updateStep2Factors({ mbtiExtrovertedPlanner: $event.target.checked })"
                  class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                <span class="text-sm text-gray-700 select-none">{{ t('features.projects.teamFormation.mbtiLabel') }}</span>
              </label>
            </div>

          </div>
        </div>

        <!-- ═══════════════════════════════════════ -->
        <!-- COSTO DE TRABAJAR A DISTANCIA           -->
        <!-- ═══════════════════════════════════════ -->
        <div v-if="selectedFactor === 'distance'" class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <Navigation class="w-5 h-5 text-brand-500" />
            <h3 class="text-base font-semibold text-gray-800">{{ t('features.projects.teamFormation.factorDistance') }}</h3>
          </div>
          <div class="p-6">
            <div class="flex items-center gap-5 flex-wrap">
              <label class="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox"
                  :checked="store.step2Factors.minCostDistance"
                  @change="store.updateStep2Factors({ minCostDistance: $event.target.checked })"
                  class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                <span class="text-sm font-medium text-gray-700 select-none">{{ t('features.projects.teamFormation.considerDistance') }}</span>
              </label>
              <div class="flex items-center gap-2" :class="!store.step2Factors.minCostDistance && 'opacity-40 pointer-events-none'">
                <span class="text-xs text-gray-500">{{ t('features.projects.teamFormation.factorWeight') }}</span>
                <input
                  type="number" min="0" max="1" step="0.01"
                  placeholder="0.00"
                  :value="store.step2Factors.minCostDistanceWeight"
                  @input="store.updateStep2Factors({ minCostDistanceWeight: Number($event.target.value) })"
                  class="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════ -->
        <!-- INTERÉS POR EL EQUIPO                   -->
        <!-- ═══════════════════════════════════════ -->
        <div v-if="selectedFactor === 'projectInterest'" class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <Lightbulb class="w-5 h-5 text-brand-500" />
            <h3 class="text-base font-semibold text-gray-800">{{ t('features.projects.teamFormation.factorProjectInterest') }}</h3>
          </div>
          <div class="p-6 space-y-5">

            <div class="flex items-center gap-5 flex-wrap">
              <label class="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox"
                  :checked="store.step2Factors.maxProjectInterests"
                  @change="store.updateStep2Factors({ maxProjectInterests: $event.target.checked })"
                  class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                <span class="text-sm font-medium text-gray-700 select-none">{{ t('features.projects.teamFormation.considerProjectInterest') }}</span>
              </label>
              <div class="flex items-center gap-2" :class="!store.step2Factors.maxProjectInterests && 'opacity-40 pointer-events-none'">
                <span class="text-xs text-gray-500">{{ t('features.projects.teamFormation.factorWeight') }}</span>
                <input
                  type="number" min="0" max="1" step="0.01"
                  placeholder="0.00"
                  :value="store.step2Factors.maxProjectInterestsWeight"
                  @input="store.updateStep2Factors({ maxProjectInterestsWeight: Number($event.target.value) })"
                  class="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div class="h-px bg-gray-100" />

            <div :class="!store.step2Factors.maxProjectInterests && 'opacity-40 pointer-events-none'">
              <label class="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox"
                  :checked="store.step2Factors.bossTeamInterest"
                  @change="store.updateStep2Factors({ bossTeamInterest: $event.target.checked })"
                  :disabled="!store.step2Factors.maxProjectInterests"
                  class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer" />
                <span class="text-sm text-gray-700 select-none">{{ t('features.projects.teamFormation.bossTeamInterestLabel') }}</span>
              </label>
            </div>

          </div>
        </div>

      </div>
      <!-- /Left -->

      <!-- Right: proposals tree + datatable -->
      <div class="lg:col-span-2 space-y-4">

        <!-- Proposals tree -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">

          <div class="px-4 py-3 border-b border-gray-200">
            <h4 class="text-sm font-semibold text-gray-800 mb-2.5">{{ t('features.projects.teamFormation.proposalsTitle') }}</h4>
            <div class="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
              <button
                type="button"
                @click="proposalMode = 'boss'"
                class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 transition-colors cursor-pointer"
                :class="proposalMode === 'boss' ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'"
              >
                <Crown class="w-3.5 h-3.5" />
                {{ t('features.projects.teamFormation.bossMode') }}
              </button>
              <button
                type="button"
                @click="proposalMode = 'member'"
                class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 transition-colors border-l border-gray-200 cursor-pointer"
                :class="proposalMode === 'member' ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'"
              >
                <Users class="w-3.5 h-3.5" />
                {{ t('features.projects.teamFormation.memberMode') }}
              </button>
            </div>
          </div>

          <div class="px-4 pt-3 pb-2 space-y-2.5">

            <!-- Boss mode -->
            <template v-if="proposalMode === 'boss'">
              <button
                type="button"
                @click="generateBossProposals"
                :disabled="generatingProposals"
                class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Loader2 v-if="generatingProposals" class="w-3.5 h-3.5 animate-spin" />
                <Crown v-else class="w-3.5 h-3.5" />
                {{ t('features.projects.teamFormation.generateBossProposals') }}
              </button>
              <div v-if="weightError" class="flex items-start gap-2 rounded-lg bg-error-50 border border-error-200 px-3 py-2">
                <AlertCircle class="w-3.5 h-3.5 text-error-500 flex-shrink-0 mt-0.5" />
                <p class="text-xs text-error-700 leading-snug">{{ weightError }}</p>
              </div>
            </template>

            <!-- Member mode -->
            <template v-else>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs text-gray-500 font-medium">{{ t('features.projects.teamFormation.projectLabel') }}</label>
                <AppSelect
                  v-model="memberProposalProjectId"
                  :options="selectedProjectOptions"
                  :placeholder="t('common.select')"
                  :searchable="true"
                />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs text-gray-500 font-medium">{{ t('features.projects.teamFormation.roleLabel') }}</label>
                <AppSelect
                  v-model="memberProposalRoleId"
                  :options="nonBossRoleOptions"
                  :disabled="!memberProposalProjectId"
                  :placeholder="t('common.select')"
                  :searchable="true"
                />
              </div>
              <button
                type="button"
                @click="generateMemberProposals"
                :disabled="generatingProposals || !memberProposalProjectId || !memberProposalRoleId"
                class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Loader2 v-if="generatingProposals" class="w-3.5 h-3.5 animate-spin" />
                <Users v-else class="w-3.5 h-3.5" />
                {{ t('features.projects.teamFormation.generateMemberProposals') }}
              </button>
              <div v-if="weightError" class="flex items-start gap-2 rounded-lg bg-error-50 border border-error-200 px-3 py-2">
                <AlertCircle class="w-3.5 h-3.5 text-error-500 flex-shrink-0 mt-0.5" />
                <p class="text-xs text-error-700 leading-snug">{{ weightError }}</p>
              </div>
            </template>

          </div>

          <!-- Tree body -->
          <div class="overflow-y-auto max-h-64 px-2 pb-2">
            <div v-if="!proposalsTree.length" class="py-8 text-center">
              <Users class="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p class="text-xs text-gray-400">{{ t('features.projects.teamFormation.noProposalsHint') }}</p>
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

          <!-- Assignment form -->
          <div class="border-t border-gray-100 p-3 space-y-2">
            <div v-if="selectedTreePerson" class="text-xs text-gray-500 mb-1.5 truncate">
              <span class="font-semibold text-gray-700">{{ selectedTreePerson.name }}</span>
              <span class="text-gray-400"> — {{ selectedTreePerson.projectName }}</span>
            </div>

            <button
              v-if="proposalMode === 'boss'"
              type="button"
              @click="assignAsBoss"
              :disabled="!selectedTreePerson"
              class="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 border-amber-400 text-amber-700 bg-amber-50 text-xs font-semibold hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Crown class="w-3.5 h-3.5" />
              {{ t('features.projects.teamFormation.assignAsBoss') }}
            </button>
            <button
              v-else
              type="button"
              @click="assignAsMember"
              :disabled="!selectedTreePerson || !assignRoleId"
              class="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 border-brand-400 text-brand-700 bg-brand-50 text-xs font-semibold hover:bg-brand-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Users class="w-3.5 h-3.5" />
              {{ t('features.projects.teamFormation.assignAsMember') }}
            </button>
          </div>
        </div>

        <!-- Fixed members datatable -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
          <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h4 class="text-sm font-semibold text-gray-800">{{ t('features.projects.teamFormation.fixedAssignmentsTitle') }}</h4>
            <span class="text-xs text-gray-400">{{ store.fixedWorkers.length }} {{ t('features.projects.teamFormation.assignedCount') }}</span>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ t('features.projects.teamFormation.typeHeader') }}</th>
                  <th class="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ t('features.projects.teamFormation.personHeader') }}</th>
                  <th class="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ t('features.projects.teamFormation.roleLabel') }}</th>
                  <th class="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ t('features.projects.teamFormation.projectLabel') }}</th>
                  <th class="px-2 py-2.5 w-8"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(m, idx) in store.fixedWorkers" :key="idx" class="hover:bg-gray-50/50">
                  <td class="px-3 py-2.5">
                    <span
                      v-if="m.isBoss"
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700"
                    >
                      <Crown class="w-3 h-3" />
                      {{ t('features.projects.teamFormation.bossLabel') }}
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700"
                    >
                      <Users class="w-3 h-3" />
                      {{ t('features.projects.teamFormation.memberLabel') }}
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
                <tr v-if="!store.fixedWorkers.length">
                  <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-400">
                    {{ t('features.projects.teamFormation.noFixedAssignments') }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
      <!-- /Right -->

    </div>

  </div>
</template>
