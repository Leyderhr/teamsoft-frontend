<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import { Loader2, Flag, Pencil, AlertTriangle, ArrowLeft } from 'lucide-vue-next'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import projectService from '@/features/projects/services/projectService.js'
import { useRoleEvaluation } from '@/services/nomenclatives/queries'
import { useFinalizeTeamStore } from '@/stores/finalizeTeam'
import { parseApiError } from '@/lib/apiError'

const props = defineProps({
  projectId: { type: [String, Number], required: true },
})

const router = useRouter()
const toast = useToast()
const { t } = useI18n()
const store = useFinalizeTeamStore()

const loading     = ref(false)
const finalizing  = ref(false)
const showConfirm = ref(false)
const selectedKey = ref(null)

const { data: roleEvalData } = useRoleEvaluation()
const roleEvaluationOptions = computed(() =>
  roleEvalData.value?.map(r => ({ label: r.significance, value: r.id })) ?? []
)

const members      = computed(() => store.members)
const allEvaluated = computed(() => store.allEvaluated)

const rowKey = (m) => `${m.personId}-${m.roleId}`
const isSelected = (m) => selectedKey.value === rowKey(m)
const selectedMember = computed(() => store.members.find(m => rowKey(m) === selectedKey.value) ?? null)

async function loadMembers() {
  store.setProject(Number(props.projectId), store.projectName)
  if (store.members.length) return

  loading.value = true
  try {
    const data = await projectService.getNonBossAssignedRoles(props.projectId)
    const flattened = []
    for (const assignedRole of data ?? []) {
      for (const person of assignedRole.persons ?? []) {
        flattened.push({
          personId: person.id,
          personName: person.personName,
          surName: person.surName,
          card: person.card,
          roleId: assignedRole.role?.id,
          roleName: assignedRole.role?.roleName,
          roleEvaluationId: null,
        })
      }
    }
    store.setMembers(flattened)
  } catch {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('features.projects.finalizeTeam.membersLoadError'), life: 3000 })
  } finally {
    loading.value = false
  }
}

onMounted(loadMembers)

function onEvaluationChange(member, value) {
  store.setEvaluation(member.personId, member.roleId, value)
}

function selectRow(member) {
  selectedKey.value = isSelected(member) ? null : rowKey(member)
}

function goEditCompetences() {
  if (!selectedMember.value) return
  router.push({
    name: 'FinalizeMemberCompetences',
    params: { projectId: props.projectId, personId: selectedMember.value.personId },
  })
}

async function doFinalize() {
  finalizing.value = true
  try {
    await projectService.finalize(props.projectId, store.finalizePayload)
    toast.add({
      severity: 'success',
      summary: t('features.projects.finalizeTeam.teamFinalizedSummary'),
      detail: t('features.projects.finalizeTeam.teamFinalizedDetail', [store.projectName]),
      life: 4000,
    })
    store.reset()
    router.push({ name: 'FinalizeTeam' })
  } catch (e) {
    const detail = await parseApiError(e, t('features.projects.finalizeTeam.finalizeErrorDetail'))
    toast.add({ severity: 'error', summary: t('features.projects.finalizeTeam.finalizeErrorSummary'), detail, life: 6000 })
  } finally {
    finalizing.value = false
    showConfirm.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageBreadcrumb
      :page-title="store.projectName ? t('features.projects.finalizeTeam.evaluateTitle') + ': ' + store.projectName : t('features.projects.finalizeTeam.evaluateTitle')"
      :items="[{ label: t('features.projects.finalizeTeam.title'), path: '/manage-projects/finalize-team' }]"
    />

    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 class="text-base font-semibold text-gray-800">{{ t('features.projects.finalizeTeam.membersTitle') }}</h2>
          <p class="text-sm text-gray-400 mt-0.5">{{ t('features.projects.finalizeTeam.membersSubtitle') }}</p>
        </div>
        <button
          type="button"
          @click="router.push({ name: 'FinalizeTeam' })"
          class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft class="w-4 h-4" />
          {{ t('common.back') }}
        </button>
      </div>

      <!-- Tabla -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-100">
          <thead class="bg-gray-50">
            <tr>
              <th class="w-10 px-4 py-3"></th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('features.projects.finalizeTeam.nameHeader') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('features.projects.finalizeTeam.surnameHeader') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('features.projects.finalizeTeam.roleHeader') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-72">{{ t('features.projects.finalizeTeam.evaluationHeader') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="loading">
              <td colspan="5" class="px-4 py-10 text-center">
                <div class="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <Loader2 class="w-5 h-5 animate-spin" />
                  {{ t('features.projects.finalizeTeam.loadingMembers') }}
                </div>
              </td>
            </tr>
            <tr v-else-if="!members.length">
              <td colspan="5" class="px-4 py-10 text-center text-sm text-gray-400">
                {{ t('features.projects.finalizeTeam.noNonBossMembers') }}
              </td>
            </tr>
            <tr
              v-else
              v-for="m in members"
              :key="rowKey(m)"
              class="hover:bg-gray-50 transition-colors cursor-pointer"
              :class="isSelected(m) ? 'bg-brand-50' : ''"
              @click="selectRow(m)"
            >
              <td class="px-4 py-3">
                <input
                  type="radio"
                  :checked="isSelected(m)"
                  @click.stop.prevent="selectRow(m)"
                  class="w-4 h-4 text-brand-500 border-gray-300 focus:ring-brand-500/20 cursor-pointer"
                />
              </td>
              <td class="px-4 py-3 text-sm font-medium text-gray-800">{{ m.personName }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ m.surName }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ m.roleName }}</td>
              <td class="px-4 py-3" @click.stop>
                <AppSelect
                  :model-value="m.roleEvaluationId"
                  @update:model-value="onEvaluationChange(m, $event)"
                  :options="roleEvaluationOptions"
                  :placeholder="t('features.projects.finalizeTeam.selectEvaluationPlaceholder')"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer de acciones -->
      <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-4 flex-wrap">
        <div class="text-sm text-gray-500">
          <span v-if="selectedMember">
            {{ t('features.projects.finalizeTeam.selected') }} <strong class="text-gray-800">{{ selectedMember.personName }} {{ selectedMember.surName }}</strong>
          </span>
          <span v-else class="text-gray-400">{{ t('features.projects.finalizeTeam.selectMemberHint') }}</span>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            :disabled="!selectedMember"
            @click="goEditCompetences"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-300 bg-brand-50 text-brand-700 text-sm font-medium hover:bg-brand-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Pencil class="w-4 h-4" />
            {{ t('features.projects.finalizeTeam.editCompetences') }}
          </button>
          <button
            type="button"
            :disabled="!allEvaluated || !members.length"
            @click="showConfirm = true"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-success-500 text-white text-sm font-medium hover:bg-success-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Flag class="w-4 h-4" />
            {{ t('features.projects.finalizeTeam.finalizeTeamBtn') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <Teleport to="body">
      <div v-if="showConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40" @click="showConfirm = false" />
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-warning-50 flex items-center justify-center">
              <AlertTriangle class="w-5 h-5 text-warning-500" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-900">{{ t('features.projects.finalizeTeam.confirmTitle') }}</h3>
              <p class="mt-1 text-sm text-gray-500">
                {{ t('features.projects.finalizeTeam.confirmMessage', [store.projectName]) }}
              </p>
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              @click="showConfirm = false"
              class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              type="button"
              :disabled="finalizing"
              @click="doFinalize"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-success-500 text-white text-sm font-medium hover:bg-success-600 disabled:opacity-50 transition-colors"
            >
              <Loader2 v-if="finalizing" class="w-4 h-4 animate-spin" />
              <Flag v-else class="w-4 h-4" />
              {{ finalizing ? t('features.projects.finalizeTeam.finalizing') : t('features.projects.finalizeTeam.confirmYes') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
