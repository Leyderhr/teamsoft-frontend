<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import { AlertCircle, Save, Loader2, Plus, Pencil, Trash2, X } from 'lucide-vue-next'
import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppAutoGrow from '@/components/ui/AppAutoGrow.vue'
import roleService from '@/features/roles/services/roleService.js'
import competenceService from '@/features/competences/services/competenceService.js'
import levelsService from '@/features/nomenclatives/services/levelsService.js'
import competenceImportanceService from '@/features/nomenclatives/services/competenceImportanceService.js'
import { parseApiError } from '@/lib/apiError'

const props = defineProps({
  mode: { type: String, default: 'create' },
  itemId: { type: String, default: null },
})

const router = useRouter()
const route = useRoute()
const toast = useToast()
const { t } = useI18n()

// ── Form data ──────────────────────────────────────────────────────────────
const form = reactive({ roleName: '', roleDesc: '', impact: null, isBoss: false })
const errors = reactive({})
const saving = ref(false)
const loadingData = ref(false)

// ── Catalogs ───────────────────────────────────────────────────────────────
const allCompetences = ref([])
const allLevels = ref([])
const allImportances = ref([])
const allRoles = ref([])

const competenceOptions = computed(() =>
  allCompetences.value.map(c => ({ label: c.competitionName, value: c.id }))
)
const levelOptions = computed(() =>
  allLevels.value.map(l => ({ label: `${l.levels} - ${l.significance}`, value: l.id }))
)
const importanceOptions = computed(() =>
  allImportances.value.map(i => ({ label: i.significance, value: i.id }))
)
const incompatibleRoleOptions = computed(() => {
  const selfId = props.mode === 'edit' ? Number(route.params.id) : null
  const usedIds = new Set(selectedIncompatibleIds.value)
  return allRoles.value
    .filter(r => r.id !== selfId && !usedIds.has(r.id))
    .map(r => ({ label: r.roleName, value: r.id }))
})

// ── Role competitions ──────────────────────────────────────────────────────
const competitions = ref([])  // { competenceId, competenceName, importanceId, importanceName, levelsId, levelLabel }
const selCompetenceId = ref(null)
const selLevelsId = ref(null)
const selImportanceId = ref(null)
const editingCompIdx = ref(-1)
const selectedCompIdx = ref(-1)

const isEditingComp = computed(() => editingCompIdx.value >= 0)

function getCompetence(id) { return allCompetences.value.find(c => c.id === id) }
function getLevel(id) { return allLevels.value.find(l => l.id === id) }
function getImportance(id) { return allImportances.value.find(i => i.id === id) }

function onAddOrUpdateComp() {
  if (!selCompetenceId.value || !selLevelsId.value || !selImportanceId.value) return
  const comp = getCompetence(selCompetenceId.value)
  const level = getLevel(selLevelsId.value)
  const imp = getImportance(selImportanceId.value)
  if (!comp || !level || !imp) return

  const entry = {
    competenceId: comp.id,
    competenceName: comp.competitionName,
    levelsId: level.id,
    levelLabel: `${level.levels} - ${level.significance}`,
    importanceId: imp.id,
    importanceName: imp.significance,
  }

  if (isEditingComp.value) {
    competitions.value[editingCompIdx.value] = entry
    cancelEditComp()
  } else {
    competitions.value.push(entry)
    selCompetenceId.value = null
    selLevelsId.value = null
    selImportanceId.value = null
  }
}

function onSelectCompRow(idx) {
  if (selectedCompIdx.value === idx && isEditingComp.value) {
    cancelEditComp()
    return
  }
  selectedCompIdx.value = idx
  const c = competitions.value[idx]
  selCompetenceId.value = c.competenceId
  selLevelsId.value = c.levelsId
  selImportanceId.value = c.importanceId
  editingCompIdx.value = idx
}

function onDeleteComp() {
  if (selectedCompIdx.value < 0) return
  competitions.value.splice(selectedCompIdx.value, 1)
  cancelEditComp()
}

function cancelEditComp() {
  editingCompIdx.value = -1
  selectedCompIdx.value = -1
  selCompetenceId.value = null
  selLevelsId.value = null
  selImportanceId.value = null
}

// ── Incompatible roles ─────────────────────────────────────────────────────
const selectedIncompatibleIds = ref([])   // final list of IDs to submit
const incompatibleRoles = ref([])          // { id, roleName } for display
const selIncompatibleId = ref(null)

function onAddIncompatible() {
  if (!selIncompatibleId.value) return
  const role = allRoles.value.find(r => r.id === selIncompatibleId.value)
  if (!role) return
  if (!selectedIncompatibleIds.value.includes(role.id)) {
    selectedIncompatibleIds.value.push(role.id)
    incompatibleRoles.value.push({ id: role.id, roleName: role.roleName })
  }
  selIncompatibleId.value = null
}

function onRemoveIncompatible(roleId) {
  selectedIncompatibleIds.value = selectedIncompatibleIds.value.filter(id => id !== roleId)
  incompatibleRoles.value = incompatibleRoles.value.filter(r => r.id !== roleId)
}

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(async () => {
  loadingData.value = true
  try {
    const [levelsRes, competencesRes, importancesRes, rolesRes] = await Promise.all([
      levelsService.getAll(),
      competenceService.getAll(),
      competenceImportanceService.getAll(),
      roleService.getAll(),
    ])
    allLevels.value = levelsRes?.data ?? levelsRes
    allCompetences.value = competencesRes?.data ?? competencesRes
    allImportances.value = importancesRes?.data ?? importancesRes
    allRoles.value = rolesRes?.data ?? rolesRes
  } catch {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('features.roles.catalogsLoadError'), life: 3000 })
  }

  if (props.mode === 'edit' && route.params.id) {
    try {
      const res = await roleService.getById(route.params.id)
      const data = res?.data ?? res
      form.roleName = data.roleName ?? ''
      form.roleDesc = data.roleDesc ?? ''
      form.impact = data.impact ?? null
      form.isBoss = data.isBoss ?? false

      if (data.roleCompetitions?.length) {
        competitions.value = data.roleCompetitions.map(rc => ({
          competenceId: rc.competence?.id,
          competenceName: rc.competence?.competitionName,
          levelsId: rc.level?.id,
          levelLabel: rc.level ? `${rc.level.levels} - ${rc.level.significance}` : '',
          importanceId: rc.competenceImportance?.id,
          importanceName: rc.competenceImportance?.significance,
        }))
      }

      if (data.incompatibleRoles?.length) {
        incompatibleRoles.value = data.incompatibleRoles.map(r => ({ id: r.id, roleName: r.roleName }))
        selectedIncompatibleIds.value = data.incompatibleRoles.map(r => r.id)
      }
    } catch {
      toast.add({ severity: 'error', summary: t('common.error'), detail: t('features.roles.loadError'), life: 3000 })
    }
  }
  loadingData.value = false
})

// ── Save ───────────────────────────────────────────────────────────────────
const formTitle = computed(() =>
  props.mode === 'create'
    ? `${t('common.add')} ${t('features.roles.formTitle')}`
    : `${t('common.edit')} ${t('features.roles.formTitle')}`
)

async function handleSave() {
  Object.keys(errors).forEach(k => delete errors[k])
  let valid = true

  if (!form.roleName.trim()) {
    errors.roleName = t('features.roles.roleNameRequired')
    valid = false
  }
  if (!form.roleDesc.trim()) {
    errors.roleDesc = t('features.roles.descRequired')
    valid = false
  }
  if (form.impact === null || form.impact === '' || form.impact === undefined) {
    errors.impact = t('features.roles.impactRequired')
    valid = false
  }
  if (!valid) return

  const payload = {
    roleName: form.roleName,
    roleDesc: form.roleDesc,
    impact: parseFloat(form.impact),
    isBoss: form.isBoss,
    roleCompetitions: competitions.value.map(c => ({
      competenceId: c.competenceId,
      competenceImportanceId: c.importanceId,
      levelsId: c.levelsId,
    })),
    incompatibleRoleIds: selectedIncompatibleIds.value,
  }

  saving.value = true
  try {
    if (props.mode === 'create') {
      await roleService.create(payload)
      toast.add({ severity: 'success', summary: t('common.success'), detail: t('features.roles.created'), life: 3000 })
    } else {
      await roleService.update(route.params.id, payload)
      toast.add({ severity: 'success', summary: t('common.success'), detail: t('features.roles.updated'), life: 3000 })
    }
    router.push('/manage-roles/role')
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: await parseApiError(e, t('common.saveError')),
      life: 3000,
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <PageBreadcrumb
      :page-title="formTitle"
      :items="[{ label: t('features.roles.formTitle'), path: '/manage-roles/role' }]"
    />

    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <!-- Card header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-base font-semibold text-gray-800">{{ formTitle }}</h2>
      </div>

      <!-- Loading -->
      <div v-if="loadingData" class="flex items-center justify-center py-20">
        <Loader2 class="w-6 h-6 animate-spin text-brand-500" />
      </div>

      <template v-else>
        <!-- ── Sección: Datos básicos ── -->
        <div class="px-6 pt-6 pb-5">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            {{ t('features.roles.basicData') }}
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Nombre del Rol -->
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">
                {{ t('features.roles.roleNameLabel') }} <span class="text-error-500 ml-0.5">*</span>
              </label>
              <input
                v-model="form.roleName"
                type="text"
                :placeholder="t('features.roles.roleNameLabel')"
                class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                :class="errors.roleName ? 'border-error-400' : 'border-gray-300 hover:border-gray-400'"
              />
              <p v-if="errors.roleName" class="text-xs text-error-600 flex items-center gap-1">
                <AlertCircle class="w-3 h-3 flex-shrink-0" />
                {{ errors.roleName }}
              </p>
            </div>

            <!-- Impacto de trabajar a distancia -->
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">
                {{ t('features.roles.impactLabel') }} <span class="text-error-500 ml-0.5">*</span>
              </label>
              <input
                v-model="form.impact"
                type="number"
                min="0"
                max="1"
                step="0.1"
                placeholder="0.0"
                class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                :class="errors.impact ? 'border-error-400' : 'border-gray-300 hover:border-gray-400'"
              />
              <p v-if="errors.impact" class="text-xs text-error-600 flex items-center gap-1">
                <AlertCircle class="w-3 h-3 flex-shrink-0" />
                {{ errors.impact }}
              </p>
            </div>

            <!-- Jefe de equipo (checkbox) -->
            <div class="flex items-end pb-1">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="form.isBoss"
                  class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20"
                />
                <span class="text-sm font-medium text-gray-700">{{ t('features.roles.bossLabel') }}</span>
              </label>
            </div>

            <!-- Descripción – full width -->
            <div class="space-y-1 sm:col-span-2 lg:col-span-3">
              <label class="block text-sm font-medium text-gray-700">
                {{ t('features.roles.descriptionLabel') }} <span class="text-error-500 ml-0.5">*</span>
              </label>
              <AppAutoGrow
                v-model="form.roleDesc"
                :placeholder="t('features.roles.descriptionLabel')"
                :max-length="300"
                :has-error="!!errors.roleDesc"
              />
              <p v-if="errors.roleDesc" class="text-xs text-error-600 flex items-center gap-1">
                <AlertCircle class="w-3 h-3 flex-shrink-0" />
                {{ errors.roleDesc }}
              </p>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="mx-6 border-t border-gray-100"></div>

        <!-- ── Sección: Competencias genéricas ── -->
        <div class="px-6 pt-6 pb-5">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            {{ t('features.roles.genericCompetences') }}
          </p>

          <!-- Mini-formulario -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2 items-end">
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">{{ t('features.roles.competenceLabel') }}</label>
              <AppSelect
                v-model="selCompetenceId"
                :options="competenceOptions"
                :placeholder="t('common.select')"
                :searchable="true"
              />
            </div>
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">{{ t('features.roles.minLevelLabel') }}</label>
              <AppSelect
                v-model="selLevelsId"
                :options="levelOptions"
                :placeholder="t('common.select')"
                :searchable="true"
              />
            </div>
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">{{ t('features.roles.importanceLabel') }}</label>
              <AppSelect
                v-model="selImportanceId"
                :options="importanceOptions"
                :placeholder="t('common.select')"
              />
            </div>
          </div>

          <!-- Botones -->
          <div class="flex items-center gap-2 mb-5">
            <button
              type="button"
              @click="onAddOrUpdateComp"
              :disabled="!selCompetenceId || !selLevelsId || !selImportanceId"
              class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              :class="(!selCompetenceId || !selLevelsId || !selImportanceId)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-brand-500 text-white hover:bg-brand-600'"
            >
              <Pencil v-if="isEditingComp" class="w-4 h-4" />
              <Plus v-else class="w-4 h-4" />
              {{ isEditingComp ? t('common.edit') : t('common.add') }}
            </button>
            <button
              v-if="isEditingComp"
              type="button"
              @click="cancelEditComp"
              class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <X class="w-4 h-4" />
              {{ t('common.cancel') }}
            </button>
          </div>

          <!-- Tabla de competencias -->
          <div class="rounded-xl border border-gray-200 overflow-hidden">
            <div class="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
              <span class="text-xs font-medium text-gray-500">
                {{ t('features.roles.associatedCount', [competitions.length]) }}
              </span>
              <button
                v-if="selectedCompIdx >= 0"
                type="button"
                @click="onDeleteComp"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-error-200 text-xs font-medium text-error-600 hover:bg-error-50 transition-colors cursor-pointer"
              >
                <Trash2 class="w-3.5 h-3.5" />
                {{ t('common.delete') }}
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full">
                <thead>
                  <tr class="border-b border-gray-200 bg-white">
                    <th class="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ t('features.roles.competenceHeader') }}
                    </th>
                    <th class="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ t('features.roles.minLevelHeader') }}
                    </th>
                    <th class="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ t('features.roles.importanceHeader') }}
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-if="!competitions.length">
                    <td colspan="3" class="px-4 py-10 text-center text-sm text-gray-400">
                      {{ t('features.roles.noCompetences') }}
                    </td>
                  </tr>
                  <tr
                    v-for="(c, idx) in competitions"
                    :key="idx"
                    @click="onSelectCompRow(idx)"
                    class="cursor-pointer transition-colors"
                    :class="selectedCompIdx === idx ? 'bg-brand-50' : 'hover:bg-gray-50'"
                  >
                    <td class="px-4 py-3 text-sm text-gray-700">{{ c.competenceName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-700">{{ c.levelLabel }}</td>
                    <td class="px-4 py-3 text-sm text-gray-700">{{ c.importanceName }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="mx-6 border-t border-gray-100"></div>

        <!-- ── Sección: Incompatibilidades ── -->
        <div class="px-6 pt-6 pb-6">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            {{ t('features.roles.incompatibilities') }}
          </p>
          <p class="text-xs text-gray-400 mb-4">
            {{ t('features.roles.incompatibilitiesDetail') }}
          </p>

          <!-- Select + Agregar -->
          <div class="flex items-end gap-3 mb-4">
            <div class="space-y-1 flex-1 max-w-sm">
              <label class="block text-sm font-medium text-gray-700">{{ t('features.roles.incompatibleRoleLabel') }}</label>
              <AppSelect
                v-model="selIncompatibleId"
                :options="incompatibleRoleOptions"
                :placeholder="t('common.select')"
                :searchable="true"
              />
            </div>
            <button
              type="button"
              @click="onAddIncompatible"
              :disabled="!selIncompatibleId"
              class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer mb-0.5"
              :class="!selIncompatibleId
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-brand-500 text-white hover:bg-brand-600'"
            >
              <Plus class="w-4 h-4" />
              {{ t('common.add') }}
            </button>
          </div>

          <!-- Lista de roles incompatibles -->
          <div v-if="incompatibleRoles.length" class="flex flex-wrap gap-2">
            <span
              v-for="r in incompatibleRoles"
              :key="r.id"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-error-50 border border-error-200 text-sm font-medium text-error-700"
            >
              {{ r.roleName }}
              <button
                type="button"
                @click="onRemoveIncompatible(r.id)"
                class="ml-0.5 rounded-full p-0.5 hover:bg-error-100 transition-colors cursor-pointer"
              >
                <X class="w-3 h-3" />
              </button>
            </span>
          </div>
          <p v-else class="text-sm text-gray-400">
            {{ t('features.roles.noIncompatibleRoles') }}
          </p>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            @click="router.back()"
            class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="button"
            @click="handleSave"
            :disabled="saving"
            class="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
            {{ saving ? t('common.saving') : t('common.save') }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
