<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import {
  Settings2, X, Cog, Loader2, Save, Pin,
  Users, Folder, Briefcase, ChevronRight,
  UserCircle, UserCheck, Trash2, AlertCircle,
} from 'lucide-vue-next'
import { useTeamFormationStore } from '@/stores/teamFormation'
import { useTeamFormation } from '@/services/team-formation/queries'
import { useSaveTeams } from '@/services/team-formation/mutations'
import { parseApiError } from '@/lib/apiError'

const store = useTeamFormationStore()
const toast = useToast()
const { t } = useI18n()

const teamsPayload = computed(() => store.teamsPayload)

const {
  data: proposal,
  refetch: generateTeams,
  isFetching: generating,
} = useTeamFormation(teamsPayload, { enabled: false })

const saveTeamsMutation = useSaveTeams()
const saving = computed(() => saveTeamsMutation.isPending.value)

// ──────────────────────────────────────────────
// Panel open/close
// ──────────────────────────────────────────────
const panelOpen = ref(false)
const weightError = ref(null)

const selectedProposalIdx = ref(null)

watch(panelOpen, (open) => { if (!open) weightError.value = null })

// ──────────────────────────────────────────────
// Proposal tree expand state
// ──────────────────────────────────────────────
const expandedProposals = ref(new Set())
const expandedProjects  = ref(new Set())

function toggleProposal(idx) {
  const s = new Set(expandedProposals.value)
  s.has(idx) ? s.delete(idx) : s.add(idx)
  expandedProposals.value = s
}
function toggleProject(key) {
  const s = new Set(expandedProjects.value)
  s.has(key) ? s.delete(key) : s.add(key)
  expandedProjects.value = s
}

// ──────────────────────────────────────────────
// Generate and Save handlers
// ──────────────────────────────────────────────
async function handleGenerate() {
  weightError.value = null
  const validation = store.validateTeamsWeights()
  if (!validation.valid) {
    weightError.value = validation.error
    return
  }
  selectedProposalIdx.value = null
  const result = await generateTeams()
  if (result?.isError) {
    const detail = await parseApiError(result.error, t('common.saveError'))
    weightError.value = detail
    toast.add({ severity: 'error', summary: t('features.projects.teamFormation.generateErrorSummary'), detail, life: 6000 })
  } else if (!result?.data?.length) {
    toast.add({ severity: 'info', summary: t('features.projects.teamFormation.noTeamsSummary'), detail: t('features.projects.teamFormation.noTeamsDetail'), life: 4000 })
  }
}

function handleSave() {
  if (selectedProposalIdx.value === null) {
    toast.add({ severity: 'warn', summary: t('features.projects.teamFormation.noProposalSelected'), detail: t('features.projects.teamFormation.noProposalSelectedDetail'), life: 3000 })
    return
  }
  const selected = proposal.value?.[selectedProposalIdx.value]
  if (!selected) return
  saveTeamsMutation.mutate(selected, {
    onSuccess: () => {
      toast.add({ severity: 'success', summary: t('features.projects.teamFormation.teamSavedSummary'), detail: t('features.projects.teamFormation.teamSavedDetail'), life: 4000 })
      store.reset()
      selectedProposalIdx.value = null
      panelOpen.value = false
    },
    onError: async (e) => {
      const detail = await parseApiError(e, t('common.saveError'))
      toast.add({ severity: 'error', summary: t('features.projects.teamFormation.teamSaveErrorSummary'), detail, life: 6000 })
    },
  })
}

// ──────────────────────────────────────────────
// Fixed members
// ──────────────────────────────────────────────
const selectedTreePerson = ref(null)

function selectPersonFromTree(person, roleItem, projItem, pIdx) {
  const isSame =
    selectedTreePerson.value?.personId    === person.id &&
    selectedTreePerson.value?.proposalIdx === pIdx &&
    selectedTreePerson.value?.roleId      === roleItem.role?.id
  if (isSame) {
    selectedTreePerson.value = null
    return
  }
  selectedTreePerson.value = {
    personId:    person.id,
    personName:  person.personName,
    surName:     person.surName,
    roleName:    roleItem.role?.roleName  || '',
    roleId:      roleItem.role?.id,
    projectName: projItem.project?.projectName || '',
    projectId:   projItem.project?.id,
    proposalIdx: pIdx,
  }
}

function fixSelectedMember() {
  if (!selectedTreePerson.value) return
  const p = selectedTreePerson.value
  const isDuplicate = store.fixedWorkers.some(
    m => m.personId === p.personId && m.roleId === p.roleId && m.projectId === p.projectId
  )
  if (isDuplicate) {
    toast.add({ severity: 'warn', summary: t('features.projects.teamFormation.alreadyFixedSummary'), detail: t('features.projects.teamFormation.alreadyFixedDetail'), life: 3000 })
    return
  }
  store.addFixedWorker({
    personId:    p.personId,
    personName:  p.personName,
    surName:     p.surName,
    roleId:      p.roleId,
    roleName:    p.roleName,
    projectId:   p.projectId,
    projectName: p.projectName,
    isBoss: false,
  })
  selectedTreePerson.value = null
}

function removeFixedMember(idx) {
  store.removeFixedWorker(idx)
}
</script>

<template>
  <!-- FAB -->
  <button
    type="button"
    @click="panelOpen = true"
    class="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full bg-brand-500 text-white shadow-lg flex items-center justify-center hover:bg-brand-600 transition-colors cursor-pointer"
    :title="t('features.projects.teamFormation.actionsTitle')"
  >
    <Settings2 class="w-6 h-6" />
  </button>

  <!-- Backdrop + Panel -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div v-if="panelOpen" class="fixed inset-0 z-50 bg-black/30" @click="panelOpen = false" />
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-250 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="panelOpen"
        class="fixed right-0 top-0 bottom-0 z-50 w-[30rem] bg-white shadow-2xl flex flex-col"
      >
        <!-- Header -->
        <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h3 class="text-base font-semibold text-gray-800">{{ t('features.projects.teamFormation.actionsTitle') }}</h3>
          <button
            type="button"
            @click="panelOpen = false"
            class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Botones de acción -->
        <div class="px-4 py-4 space-y-2.5 flex-shrink-0 border-b border-gray-100">
          <button
            type="button"
            @click="handleGenerate"
            :disabled="generating"
            class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <Loader2 v-if="generating" class="w-4 h-4 animate-spin" />
            <Cog v-else class="w-4 h-4" />
            {{ t('features.projects.teamFormation.generateProposals') }}
          </button>
          <div v-if="weightError" class="flex items-start gap-2 rounded-lg bg-error-50 border border-error-200 px-3 py-2.5">
            <AlertCircle class="w-4 h-4 text-error-500 flex-shrink-0 mt-0.5" />
            <p class="text-xs text-error-700 leading-snug">{{ weightError }}</p>
          </div>
          <button
            type="button"
            @click="handleSave"
            :disabled="saving || selectedProposalIdx === null"
            class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
            {{ t('features.projects.teamFormation.saveSelectedProposal') }}
          </button>
          <p v-if="proposal?.length && selectedProposalIdx === null" class="text-xs text-gray-400 text-center">
            {{ t('features.projects.teamFormation.selectProposalHint') }}
          </p>
          <button
            type="button"
            @click="fixSelectedMember"
            :disabled="!selectedTreePerson"
            class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            :class="selectedTreePerson
              ? 'border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100'
              : 'border-gray-200 text-gray-700 hover:bg-gray-50'"
          >
            <Pin class="w-4 h-4" />
            {{ t('features.projects.teamFormation.fixMemberBtn') }}
          </button>
        </div>

        <!-- Tabla de miembros fijados -->
        <div v-if="store.fixedWorkers.length" class="px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {{ t('features.projects.teamFormation.fixedMembersTitle') }}
            <span class="ml-1.5 text-brand-500 font-bold">{{ store.fixedWorkers.length }}</span>
          </p>
          <div class="overflow-auto max-h-44 rounded-lg border border-gray-200">
            <table class="min-w-full text-xs">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th class="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wide">{{ t('features.projects.teamFormation.teamHeader') }}</th>
                  <th class="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wide">{{ t('features.projects.teamFormation.fixedPersonHeader') }}</th>
                  <th class="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wide">{{ t('features.projects.teamFormation.roleLabel') }}</th>
                  <th class="px-2 py-2 w-7"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(m, i) in store.fixedWorkers" :key="i" class="hover:bg-gray-50/60">
                  <td class="px-3 py-2 text-gray-700 truncate max-w-[7rem]">{{ m.projectName }}</td>
                  <td class="px-3 py-2 text-gray-700 whitespace-nowrap">{{ m.personName }}{{ m.surName ? ' ' + m.surName : '' }}</td>
                  <td class="px-3 py-2 text-gray-500 truncate max-w-[6rem]">{{ m.roleName || t('features.projects.teamFormation.bossLabel') }}</td>
                  <td class="px-2 py-2 text-right">
                    <button
                      type="button"
                      @click="removeFixedMember(i)"
                      class="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-error-500 hover:bg-error-50 transition-colors cursor-pointer"
                    >
                      <Trash2 class="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Árbol de propuestas -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="!proposal?.length" class="py-10 flex flex-col items-center gap-3 px-4">
            <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Users class="w-6 h-6 text-gray-300" />
            </div>
            <p class="text-xs text-gray-400 text-center leading-relaxed">
              {{ t('features.projects.teamFormation.noTeamsHint') }}
            </p>
          </div>

          <div v-else class="px-2 py-3 space-y-1">
            <div
              v-for="(prop, pIdx) in proposal"
              :key="pIdx"
              class="rounded-lg transition-colors"
              :class="selectedProposalIdx === pIdx ? 'bg-brand-50/60 ring-1 ring-brand-200' : ''"
            >
              <div class="w-full flex items-center gap-2 px-2 py-2">
                <input
                  type="radio"
                  name="proposal-to-save"
                  :checked="selectedProposalIdx === pIdx"
                  @change="selectedProposalIdx = pIdx"
                  class="w-3.5 h-3.5 text-brand-500 border-gray-300 focus:ring-brand-500/20 cursor-pointer flex-shrink-0"
                  :title="t('features.projects.teamFormation.selectProposalHint')"
                />
                <button
                  type="button"
                  @click="toggleProposal(pIdx)"
                  class="flex-1 min-w-0 flex items-center gap-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <ChevronRight
                    class="w-4 h-4 text-gray-400 transition-transform duration-150 flex-shrink-0"
                    :class="expandedProposals.has(pIdx) ? 'rotate-90' : ''"
                  />
                  <Folder class="w-4 h-4 text-brand-400 flex-shrink-0" />
                  <span class="text-sm font-semibold text-gray-700 truncate flex-1 text-left">{{ t('features.projects.teamFormation.proposalLabel') }} {{ pIdx + 1 }}</span>
                  <span class="text-xs font-medium text-brand-500 flex-shrink-0 tabular-nums">{{ prop.formattedEval }}</span>
                </button>
              </div>

              <!-- Proyectos -->
              <div v-if="expandedProposals.has(pIdx)" class="ml-5 space-y-0.5">
                <div v-for="(projItem, qIdx) in (prop.projectsProposal || [])" :key="qIdx">
                  <button
                    type="button"
                    @click="toggleProject(`${pIdx}-${qIdx}`)"
                    class="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <ChevronRight
                      class="w-3.5 h-3.5 text-gray-400 transition-transform duration-150 flex-shrink-0"
                      :class="expandedProjects.has(`${pIdx}-${qIdx}`) ? 'rotate-90' : ''"
                    />
                    <Briefcase class="w-3.5 h-3.5 text-brand-300 flex-shrink-0" />
                    <span class="text-xs font-medium text-gray-700 truncate flex-1">
                      {{ projItem.project?.projectName || `Proyecto ${qIdx + 1}` }}
                    </span>
                  </button>

                  <!-- Roles + personas -->
                  <div v-if="expandedProjects.has(`${pIdx}-${qIdx}`)" class="ml-5 space-y-1 py-0.5">
                    <div v-for="(roleItem, rIdx) in (projItem.assignedRoles || [])" :key="rIdx" class="space-y-0.5">
                      <div class="flex items-center gap-2 px-2 py-1">
                        <span class="w-3.5 flex-shrink-0" />
                        <span class="text-xs font-semibold text-gray-500 truncate flex-1">
                          {{ roleItem.role?.roleName || `Rol ${rIdx + 1}` }}
                        </span>
                        <span class="text-[10px] text-gray-400 tabular-nums flex-shrink-0">
                          {{ roleItem.persons?.length || 0 }}
                        </span>
                      </div>
                      <button
                        v-for="(person, iIdx) in (roleItem.persons || [])"
                        :key="iIdx"
                        type="button"
                        @click="selectPersonFromTree(person, roleItem, projItem, pIdx)"
                        class="w-full flex items-center gap-2 px-2 py-1 ml-3.5 rounded-lg transition-colors cursor-pointer text-left"
                        :class="selectedTreePerson?.personId === person.id &&
                                selectedTreePerson?.proposalIdx === pIdx &&
                                selectedTreePerson?.roleId === roleItem.role?.id
                          ? 'bg-brand-50 text-brand-700'
                          : 'hover:bg-gray-50 text-gray-600'"
                      >
                        <UserCheck
                          v-if="selectedTreePerson?.personId === person.id &&
                                selectedTreePerson?.proposalIdx === pIdx &&
                                selectedTreePerson?.roleId === roleItem.role?.id"
                          class="w-3 h-3 text-brand-500 flex-shrink-0"
                        />
                        <UserCircle v-else class="w-3 h-3 text-gray-300 flex-shrink-0" />
                        <span class="text-xs truncate flex-1">{{ person.personName }} {{ person.surName }}</span>
                        <Pin
                          v-if="store.fixedWorkers.some(m => m.personId === person.id && m.roleId === roleItem.role?.id)"
                          class="w-3 h-3 text-brand-400 flex-shrink-0"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>
