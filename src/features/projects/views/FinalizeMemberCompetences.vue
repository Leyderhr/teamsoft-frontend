<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import {
  Loader2, Save, ArrowLeft, Award, Cpu, ShieldAlert, Trash2, Plus,
} from 'lucide-vue-next'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import personService from '@/features/persons/services/personService.js'
import projectService from '@/features/projects/services/projectService.js'
import { useLevels, useConflictIndex } from '@/services/nomenclatives/queries'
import { useCompetences } from '@/services/competences/queries'
import { parseApiError } from '@/lib/apiError'

const props = defineProps({
  projectId: { type: [String, Number], required: true },
  personId: { type: [String, Number], required: true },
})

const router = useRouter()
const toast = useToast()
const { t } = useI18n()

const activeTab = ref('competences')

const loading = ref(false)
const saving  = ref(false)
const personName = ref('')

const techCompetences = ref([])
const genCompetences  = ref([])
const conflicts       = ref([])

const techNewCompetence = ref(null)
const techNewLevel      = ref(null)
const genNewCompetence  = ref(null)
const genNewLevel       = ref(null)

const personsList       = ref([])
const newConflictPerson = ref(null)
const newConflictIndex  = ref(null)

const { data: levelsData }       = useLevels()
const { data: competencesData }  = useCompetences()
const { data: conflictIndexData } = useConflictIndex()

const levelOptions = computed(() =>
  levelsData.value?.map(l => ({ label: l.significance, value: l.id })) ?? []
)
const conflictIndexOptions = computed(() =>
  conflictIndexData.value?.map(c => ({ label: c.description, value: c.id })) ?? []
)

const conflictPersonOptions = computed(() =>
  personsList.value
    .filter(p => p.id !== Number(props.personId) && !conflicts.value.some(c => c.personConflictId === p.id))
    .map(p => ({ label: `${p.personName} ${p.surName}`, value: p.id }))
)

const availableTechCompetences = computed(() =>
  (competencesData.value ?? [])
    .filter(c => c.technical && !techCompetences.value.some(t => t.competenceId === c.id))
    .map(c => ({ label: c.competitionName, value: c.id }))
)
const availableGenCompetences = computed(() =>
  (competencesData.value ?? [])
    .filter(c => !c.technical && !genCompetences.value.some(g => g.competenceId === c.id))
    .map(c => ({ label: c.competitionName, value: c.id }))
)

const tabs = computed(() => [
  { id: 'competences', label: t('features.projects.finalizeTeam.competencesTab'), icon: Award },
  { id: 'compatibility', label: t('features.projects.finalizeTeam.compatibilityTab'), icon: ShieldAlert },
])

async function loadPerson() {
  loading.value = true
  try {
    const person = await personService.getById(props.personId)
    personName.value = [person.personName, person.surName].filter(Boolean).join(' ')

    const competenceValues = person.competenceValues ?? []
    techCompetences.value = competenceValues
      .filter(cv => cv.competence?.technical)
      .map(cv => ({ competenceId: cv.competence.id, name: cv.competence.competitionName, levelsId: cv.level?.id ?? null }))
    genCompetences.value = competenceValues
      .filter(cv => cv.competence && !cv.competence.technical)
      .map(cv => ({ competenceId: cv.competence.id, name: cv.competence.competitionName, levelsId: cv.level?.id ?? null }))

    conflicts.value = (person.personConflicts ?? []).map(pc => ({
      personConflictId: pc.personConflict?.id,
      name: pc.personConflict?.personName ?? '',
      surName: pc.personConflict?.surName ?? '',
      card: pc.personConflict?.card ?? '',
      conflictIndexId: pc.conflictIndex?.id ?? null,
    }))
  } catch {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('features.projects.finalizeTeam.memberLoadError'), life: 3000 })
  } finally {
    loading.value = false
  }
}

async function loadPersons() {
  try {
    const data = await projectService.getNonBossAssignedRoles(props.projectId)
    const byId = new Map()
    for (const assignedRole of data ?? []) {
      for (const person of assignedRole.persons ?? []) {
        if (!byId.has(person.id)) byId.set(person.id, person)
      }
    }
    personsList.value = [...byId.values()]
  } catch {
    // failures here only disable adding new conflicts
  }
}

onMounted(() => {
  loadPerson()
  loadPersons()
})

function addConflict() {
  if (!newConflictPerson.value || !newConflictIndex.value) return
  if (conflicts.value.some(c => c.personConflictId === newConflictPerson.value)) {
    toast.add({ severity: 'warn', summary: t('features.projects.finalizeTeam.duplicateConflictSummary'), detail: t('features.projects.finalizeTeam.duplicateConflictDetail'), life: 3000 })
    return
  }
  const person = personsList.value.find(p => p.id === newConflictPerson.value)
  conflicts.value.push({
    personConflictId: newConflictPerson.value,
    name: person?.personName ?? '',
    surName: person?.surName ?? '',
    card: person?.card ?? '',
    conflictIndexId: newConflictIndex.value,
  })
  newConflictPerson.value = null
  newConflictIndex.value = null
}

function removeConflict(index) {
  conflicts.value.splice(index, 1)
}

function addCompetence(kind) {
  const compId = kind === 'tech' ? techNewCompetence.value : genNewCompetence.value
  const levelId = kind === 'tech' ? techNewLevel.value : genNewLevel.value
  if (!compId || !levelId) return

  const source = (competencesData.value ?? []).find(c => c.id === compId)
  const row = { competenceId: compId, name: source?.competitionName ?? `Competencia ${compId}`, levelsId: levelId }

  if (kind === 'tech') {
    techCompetences.value.push(row)
    techNewCompetence.value = null
    techNewLevel.value = null
  } else {
    genCompetences.value.push(row)
    genNewCompetence.value = null
    genNewLevel.value = null
  }
}

function removeCompetence(kind, index) {
  if (kind === 'tech') techCompetences.value.splice(index, 1)
  else genCompetences.value.splice(index, 1)
}

async function handleSave() {
  const allCompetences = [...techCompetences.value, ...genCompetences.value]
  if (allCompetences.some(c => c.levelsId == null)) {
    toast.add({ severity: 'warn', summary: t('features.projects.finalizeTeam.missingLevel'), detail: t('features.projects.finalizeTeam.missingLevelDetail'), life: 4000 })
    return
  }
  if (conflicts.value.some(c => c.conflictIndexId == null)) {
    toast.add({ severity: 'warn', summary: t('features.projects.finalizeTeam.missingConflictLevel'), detail: t('features.projects.finalizeTeam.missingConflictLevelDetail'), life: 4000 })
    return
  }

  const payload = {
    competenceValues: allCompetences.map(c => ({ competenceId: c.competenceId, levelsId: c.levelsId })),
    personConflicts: conflicts.value.map(c => ({ personConflictId: c.personConflictId, conflictIndexId: c.conflictIndexId })),
  }

  saving.value = true
  try {
    await personService.patchCompetencesConflicts(props.personId, payload)
    toast.add({ severity: 'success', summary: t('features.projects.finalizeTeam.savedSummary'), detail: t('features.projects.finalizeTeam.savedDetail'), life: 4000 })
    router.push({ name: 'FinalizeTeamMembers', params: { projectId: props.projectId } })
  } catch (e) {
    const detail = await parseApiError(e, t('common.saveError'))
    toast.add({ severity: 'error', summary: t('features.projects.finalizeTeam.saveErrorSummary'), detail, life: 6000 })
  } finally {
    saving.value = false
  }
}

function goBack() {
  router.push({ name: 'FinalizeTeamMembers', params: { projectId: props.projectId } })
}
</script>

<template>
  <div class="space-y-6">
    <PageBreadcrumb
      :page-title="personName || t('features.projects.finalizeTeam.editCompetences')"
      :items="[
        { label: t('features.projects.finalizeTeam.title'), path: '/manage-projects/finalize-team' },
        { label: t('features.projects.finalizeTeam.evaluateTitle'), path: `/manage-projects/finalize-team/${projectId}/members` },
      ]"
    />

    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <!-- Header + tabs -->
      <div class="px-6 pt-4 border-b border-gray-200">
        <div class="flex items-center justify-between gap-4 flex-wrap mb-3">
          <h2 class="text-base font-semibold text-gray-800">{{ personName || t('features.projects.finalizeTeam.membersTitle') }}</h2>
          <button
            type="button"
            @click="goBack"
            class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft class="w-4 h-4" />
            {{ t('common.back') }}
          </button>
        </div>
        <nav class="flex gap-6 -mb-px">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            @click="activeTab = tab.id"
            class="inline-flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer"
            :class="activeTab === tab.id
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="py-16 flex items-center justify-center gap-2 text-sm text-gray-400">
        <Loader2 class="w-5 h-5 animate-spin" />
        {{ t('features.projects.finalizeTeam.loadingMemberData') }}
      </div>

      <template v-else>
        <!-- ════════ TAB COMPETENCIAS ════════ -->
        <div v-show="activeTab === 'competences'" class="p-6 space-y-6">

          <!-- Sección Técnicas -->
          <section class="space-y-3">
            <div class="flex items-center gap-2">
              <Cpu class="w-4 h-4 text-brand-500" />
              <h3 class="text-sm font-semibold text-gray-700">{{ t('features.projects.finalizeTeam.techCompetences') }}</h3>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-end gap-3 rounded-xl bg-gray-50 border border-gray-100 p-4">
              <div class="flex-1 min-w-[200px] space-y-1.5">
                <label class="text-xs font-medium text-gray-600">{{ t('features.projects.finalizeTeam.competenceLabel') }}</label>
                <AppSelect v-model="techNewCompetence" :options="availableTechCompetences" :placeholder="t('common.select')" :searchable="true" />
              </div>
              <div class="w-full sm:w-56 space-y-1.5">
                <label class="text-xs font-medium text-gray-600">{{ t('features.projects.finalizeTeam.levelLabel') }}</label>
                <AppSelect v-model="techNewLevel" :options="levelOptions" :placeholder="t('common.select')" />
              </div>
              <button
                type="button"
                @click="addCompetence('tech')"
                :disabled="!techNewCompetence || !techNewLevel"
                class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Plus class="w-4 h-4" />
                {{ t('common.add') }}
              </button>
            </div>

            <div class="overflow-hidden rounded-xl border border-gray-200">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ t('features.projects.finalizeTeam.nameHeader') }}</th>
                    <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-56">{{ t('features.projects.finalizeTeam.levelLabel') }}</th>
                    <th class="px-2 py-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="(c, idx) in techCompetences" :key="c.competenceId" class="hover:bg-gray-50/60">
                    <td class="px-4 py-2 text-gray-700">{{ c.name }}</td>
                    <td class="px-4 py-2">
                      <AppSelect v-model="c.levelsId" :options="levelOptions" size="sm" :placeholder="t('common.select')" />
                    </td>
                    <td class="px-2 py-2 text-right">
                      <button type="button" @click="removeCompetence('tech', idx)"
                        class="p-1 rounded text-gray-300 hover:text-error-500 hover:bg-error-50 transition-colors">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!techCompetences.length">
                    <td colspan="3" class="px-4 py-6 text-center text-sm text-gray-400">{{ t('features.projects.finalizeTeam.noTechCompetences') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div class="h-px bg-gray-100" />

          <!-- Sección Genéricas -->
          <section class="space-y-3">
            <div class="flex items-center gap-2">
              <Award class="w-4 h-4 text-brand-500" />
              <h3 class="text-sm font-semibold text-gray-700">{{ t('features.projects.finalizeTeam.genericCompetences') }}</h3>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-end gap-3 rounded-xl bg-gray-50 border border-gray-100 p-4">
              <div class="flex-1 min-w-[200px] space-y-1.5">
                <label class="text-xs font-medium text-gray-600">{{ t('features.projects.finalizeTeam.competenceLabel') }}</label>
                <AppSelect v-model="genNewCompetence" :options="availableGenCompetences" :placeholder="t('common.select')" :searchable="true" />
              </div>
              <div class="w-full sm:w-56 space-y-1.5">
                <label class="text-xs font-medium text-gray-600">{{ t('features.projects.finalizeTeam.levelLabel') }}</label>
                <AppSelect v-model="genNewLevel" :options="levelOptions" :placeholder="t('common.select')" />
              </div>
              <button
                type="button"
                @click="addCompetence('gen')"
                :disabled="!genNewCompetence || !genNewLevel"
                class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Plus class="w-4 h-4" />
                {{ t('common.add') }}
              </button>
            </div>

            <div class="overflow-hidden rounded-xl border border-gray-200">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ t('features.projects.finalizeTeam.nameHeader') }}</th>
                    <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-56">{{ t('features.projects.finalizeTeam.levelLabel') }}</th>
                    <th class="px-2 py-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="(c, idx) in genCompetences" :key="c.competenceId" class="hover:bg-gray-50/60">
                    <td class="px-4 py-2 text-gray-700">{{ c.name }}</td>
                    <td class="px-4 py-2">
                      <AppSelect v-model="c.levelsId" :options="levelOptions" size="sm" :placeholder="t('common.select')" />
                    </td>
                    <td class="px-2 py-2 text-right">
                      <button type="button" @click="removeCompetence('gen', idx)"
                        class="p-1 rounded text-gray-300 hover:text-error-500 hover:bg-error-50 transition-colors">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!genCompetences.length">
                    <td colspan="3" class="px-4 py-6 text-center text-sm text-gray-400">{{ t('features.projects.finalizeTeam.noGenericCompetences') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <!-- ════════ TAB NIVEL DE COMPATIBILIDAD ════════ -->
        <div v-show="activeTab === 'compatibility'" class="p-6 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-end gap-3 rounded-xl bg-gray-50 border border-gray-100 p-4">
            <div class="flex-1 min-w-[200px] space-y-1.5">
              <label class="text-xs font-medium text-gray-600">{{ t('features.projects.finalizeTeam.personLabel') }}</label>
              <AppSelect v-model="newConflictPerson" :options="conflictPersonOptions" :placeholder="t('common.select')" :searchable="true" />
            </div>
            <div class="w-full sm:w-64 space-y-1.5">
              <label class="text-xs font-medium text-gray-600">{{ t('features.projects.finalizeTeam.conflictLevelLabel') }}</label>
              <AppSelect v-model="newConflictIndex" :options="conflictIndexOptions" :placeholder="t('common.select')" />
            </div>
            <button
              type="button"
              @click="addConflict"
              :disabled="!newConflictPerson || !newConflictIndex"
              class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus class="w-4 h-4" />
              {{ t('common.add') }}
            </button>
          </div>

          <div class="overflow-hidden rounded-xl border border-gray-200">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ t('features.projects.finalizeTeam.nameHeader') }}</th>
                  <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ t('features.projects.finalizeTeam.surnameHeader') }}</th>
                  <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ t('features.projects.finalizeTeam.dniHeader') }}</th>
                  <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-64">{{ t('features.projects.finalizeTeam.conflictLevelLabel') }}</th>
                  <th class="px-2 py-2.5 w-10"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(c, idx) in conflicts" :key="c.personConflictId" class="hover:bg-gray-50/60">
                  <td class="px-4 py-2 text-gray-700">{{ c.name }}</td>
                  <td class="px-4 py-2 text-gray-600">{{ c.surName }}</td>
                  <td class="px-4 py-2 text-gray-500">{{ c.card }}</td>
                  <td class="px-4 py-2">
                    <AppSelect v-model="c.conflictIndexId" :options="conflictIndexOptions" size="sm" :placeholder="t('common.select')" />
                  </td>
                  <td class="px-2 py-2 text-right">
                    <button type="button" @click="removeConflict(idx)"
                      class="p-1 rounded text-gray-300 hover:text-error-500 hover:bg-error-50 transition-colors">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                <tr v-if="!conflicts.length">
                  <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-400">
                    {{ t('features.projects.finalizeTeam.noPersonConflicts') }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="goBack"
            class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="button"
            :disabled="saving"
            @click="handleSave"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
            {{ t('common.save') }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
