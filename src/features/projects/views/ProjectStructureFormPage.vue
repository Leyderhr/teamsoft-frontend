<template>
  <div>
    <PageBreadcrumb
      :page-title="pageTitle"
      :items="[{ label: t('features.projects.structure.title'), path: '/nomenclatives/project-structure' }]"
    />

    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
        <h2 class="text-base font-semibold text-gray-800">{{ pageTitle }}</h2>
      </div>

      <div class="px-6 pt-6 pb-2">
        <div class="space-y-1 w-full max-w-xl">
          <label class="block text-sm font-medium text-gray-700">
            {{ t('features.projects.structure.nameLabel') }} <span class="text-error-500">*</span>
          </label>
          <input
            v-model="structureName"
            type="text"
            :placeholder="t('common.select')"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

      <div class="border-b border-gray-200 px-6 mt-2">
        <nav class="-mb-px flex gap-0 overflow-x-auto no-scrollbar">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
            :class="activeTab === tab.key
              ? 'border-brand-500 text-brand-500'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <div class="p-6">

        <div v-show="activeTab === 'roles'">
          <div class="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-6 transition-colors">
            <h3 class="text-sm font-semibold mb-4 text-gray-700">
              {{ isEditingRole ? t('features.projects.structure.roleEditSection') : t('features.projects.structure.rolesSection') }}
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">{{ t('features.projects.structure.role') }} <span class="text-error-500">*</span></label>
                <AppSelect
                  v-model="selectedRoleId"
                  :options="roleOptions"
                  :placeholder="t('common.select')"
                  searchable
                />
              </div>

              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">{{ t('features.projects.structure.roleLoad') }} <span class="text-error-500">*</span></label>
                <AppSelect
                  v-model="selectedRoleLoadId"
                  :options="roleLoadOptions"
                  :placeholder="t('common.select')"
                />
              </div>

              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">{{ t('features.projects.structure.workersAmount') }} <span class="text-error-500">*</span></label>
                <input
                  v-model.number="workersAmount"
                  type="number"
                  min="1"
                  placeholder="1"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div class="flex gap-2">
              <button
                type="button"
                @click="addOrUpdateRole"
                :disabled="!canAddRole"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <component :is="isEditingRole ? RefreshCw : Plus" class="w-4 h-4" />
                {{ isEditingRole ? t('features.projects.structure.updateRole') : t('features.projects.structure.addRole') }}
              </button>

              <button
                v-if="isEditingRole"
                type="button"
                @click="resetRoleForm"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                {{ t('features.projects.structure.cancelEdit') }}
              </button>
            </div>
          </div>

          <div v-if="!hasBoss && projectRoles.length > 0" class="flex items-center gap-2 text-warning-700 bg-warning-50 p-3 rounded-lg border border-warning-200 mb-4">
            <AlertCircle class="w-4 h-4 flex-shrink-0" />
            <p class="text-xs font-medium">{{ t('features.projects.structure.bossAlert') }}</p>
          </div>

          <div v-if="projectRoles.length > 0" class="mt-4">
            <h3 class="text-sm font-semibold text-gray-700 mb-3">{{ t('features.projects.structure.teamStructure') }} ({{ projectRoles.length }})</h3>

            <MiniTable
              :rows="projectRoles"
              :columns="roleTableColumns"
              selection-mode="single"
              v-model:selected="selectedRolesToDelete"
              @remove="removeSelectedRoles"
              @row-click="handleRoleRowClick"
            />
            <p class="text-xs text-gray-400 mt-2">{{ t('features.projects.structure.tableNote') }}</p>
          </div>
        </div>

        <div v-show="activeTab === 'competences'">

          <div v-if="projectRoles.length === 0" class="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <AlertCircle class="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p class="text-sm text-gray-500 font-medium">{{ t('features.projects.structure.noRoles') }}</p>
            <p class="text-xs text-gray-400">{{ t('features.projects.structure.noRolesDetail') }}</p>
          </div>

          <div v-else>
            <div class="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-6 transition-colors">
              <h3 class="text-sm font-semibold mb-4 text-gray-700">
                {{ isEditingComp ? t('features.projects.structure.updateCompetence') : t('features.projects.structure.addCompetence') }}
              </h3>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div class="space-y-1">
                  <label class="block text-sm font-medium text-gray-700">{{ t('features.projects.structure.role') }} <span class="text-error-500">*</span></label>
                  <AppSelect
                    v-model="selectedCompRoleId"
                    :options="availableRolesForCompetences"
                    :placeholder="t('common.select')"
                  />
                </div>

                <div class="space-y-1">
                  <label class="block text-sm font-medium text-gray-700">{{ t('features.projects.structure.competence') }} <span class="text-error-500">*</span></label>
                  <AppSelect
                    v-model="selectedCompId"
                    :options="competenceOptions"
                    :placeholder="t('common.select')"
                    searchable
                  />
                </div>

                <div class="space-y-1">
                  <label class="block text-sm font-medium text-gray-700">{{ t('features.projects.structure.level') }} <span class="text-error-500">*</span></label>
                  <AppSelect
                    v-model="selectedCompLevelId"
                    :options="levelOptions"
                    :placeholder="t('common.select')"
                  />
                </div>

                <div class="space-y-1">
                  <label class="block text-sm font-medium text-gray-700">{{ t('features.projects.structure.importance') }} <span class="text-error-500">*</span></label>
                  <AppSelect
                    v-model="selectedCompImportanceId"
                    :options="importanceOptions"
                    :placeholder="t('common.select')"
                  />
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  type="button"
                  @click="addOrUpdateCompetence"
                  :disabled="!canAddComp"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <component :is="isEditingComp ? RefreshCw : Plus" class="w-4 h-4" />
                  {{ isEditingComp ? t('features.projects.structure.updateCompetence') : t('features.projects.structure.addCompetence') }}
                </button>

                <button
                  v-if="isEditingComp"
                  type="button"
                  @click="resetCompForm"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  {{ t('features.projects.structure.cancelEdit') }}
                </button>
              </div>
            </div>

            <div v-if="projectCompetences.length > 0" class="mt-4">
              <h3 class="text-sm font-semibold text-gray-700 mb-3">{{ t('features.projects.structure.competencesSection') }} ({{ projectCompetences.length }})</h3>

              <MiniTable
                :rows="projectCompetences"
                :columns="compTableColumns"
                selection-mode="single"
                v-model:selected="selectedCompsToDelete"
                @remove="removeSelectedComps"
                @row-click="handleCompRowClick"
              />
              <p class="text-xs text-gray-400 mt-2">{{ t('features.projects.structure.tableNote') }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <button
          type="button"
          @click="router.back()"
          class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {{ t('common.cancel') }}
        </button>

        <button
          v-if="activeTab === 'roles'"
          type="button"
          @click="activeTab = 'competences'"
          :disabled="!hasBoss || !structureName"
          class="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {{ t('common.next') }}
          <ChevronRight class="w-4 h-4" />
        </button>

        <button
          v-else
          type="button"
          @click="handleSave"
          :disabled="saving || !hasBoss || !structureName"
          class="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
          <Save v-else class="w-4 h-4" />
          {{ saving ? t('common.saving') : t('common.save') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { Save, Loader2, Plus, AlertCircle, RefreshCw, ChevronRight } from 'lucide-vue-next'

import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import MiniTable from '@/components/common/MiniTable.vue'

import { api } from '@/lib/api'
import { parseApiError } from '@/lib/apiError'
import { fetchGetRoles } from '@/services/roles/index.js'
import {
  fetchGetRoleLoads,
  fetchCreateProjectStructure,
  fetchUpdateProjectStructure
} from '@/services/nomenclatives/index.js'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const { t } = useI18n()

const isEditMode = computed(() => !!route.params.id)
const pageTitle = computed(() => isEditMode.value ? t('features.projects.structure.editTitle') : t('features.projects.structure.createTitle'))

// Tabs Configuration
const activeTab = ref('roles')
const tabs = computed(() => [
  { key: 'roles', label: t('features.projects.structure.tabs.roles') },
  { key: 'competences', label: t('features.projects.structure.tabs.competences') },
])

// ESTADO: GLOBALES Y ROLES
const structureName = ref('')
const selectedRoleId = ref('')
const selectedRoleLoadId = ref('')
const workersAmount = ref(1)

const projectRoles = ref([])
const roleOptions = ref([])
const roleLoadOptions = ref([])
const selectedRolesToDelete = ref([])
const saving = ref(false)

const editingRoleId = ref(null)
const isEditingRole = computed(() => editingRoleId.value !== null)

const roleTableColumns = computed(() => [
  { field: 'roleName', header: t('features.projects.structure.role').toUpperCase() },
  { field: 'roleLoadLabel', header: t('features.projects.structure.roleLoad').toUpperCase() },
  { field: 'amountWorkersRole', header: t('features.projects.structure.workersAmount').toUpperCase() }
])

const canAddRole = computed(() => selectedRoleId.value && selectedRoleLoadId.value && workersAmount.value >= 1)
const hasBoss = computed(() => projectRoles.value.some(pr => roleOptions.value.find(r => r.value === pr.roleId)?.isBoss))

// ESTADO: COMPETENCIAS
const projectCompetences = ref([])
const competenceOptions = ref([])
const levelOptions = ref([])
const importanceOptions = ref([])

const selectedCompRoleId = ref('')
const selectedCompId = ref('')
const selectedCompLevelId = ref('')
const selectedCompImportanceId = ref('')
const selectedCompsToDelete = ref([])

const editingCompId = ref(null)
const isEditingComp = computed(() => editingCompId.value !== null)

const compTableColumns = computed(() => [
  { field: 'roleName', header: t('features.projects.structure.role').toUpperCase() },
  { field: 'competenceName', header: t('features.projects.structure.competence').toUpperCase() },
  { field: 'levelName', header: t('features.projects.structure.level').toUpperCase() },
  { field: 'importanceName', header: t('features.projects.structure.importance').toUpperCase() }
])

const availableRolesForCompetences = computed(() => {
  return projectRoles.value.map(pr => ({ label: pr.roleName, value: pr.roleId }))
})

const canAddComp = computed(() => selectedCompRoleId.value && selectedCompId.value && selectedCompLevelId.value && selectedCompImportanceId.value)

// CARGA DE DATOS AL MONTAR
onMounted(async () => {
  try {
    const [roles, roleLoads, competencesRes, levelsRes, importancesRes] = await Promise.all([
      fetchGetRoles(),
      fetchGetRoleLoads(),
      api.get('competence').json(),
      api.get('levels').json(),
      api.get('competenceImportance').json()
    ])

    roleOptions.value = roles.map(r => ({ label: r.roleName, value: r.id, isBoss: r.isBoss }))
    roleLoadOptions.value = roleLoads.map(rl => ({ label: `${rl.value} -> ${rl.significance}`, value: rl.id }))
    competenceOptions.value = competencesRes.map(c => ({ label: c.competitionName, value: c.id }))
    levelOptions.value = levelsRes.map(l => ({ label: l.significance, value: l.id }))
    importanceOptions.value = importancesRes.map(i => ({ label: i.significance, value: i.id }))

    if (isEditMode.value && route.params.id) {
      const res = await api.get(`project-structure/${route.params.id}`).json()
      const data = res?.data ?? res

      structureName.value = data.name ?? ''

      if (data.projectRoles?.length) {
        // Cargar Roles
        projectRoles.value = data.projectRoles.map(pr => ({
          roleId: pr.role?.id ?? pr.role,
          roleName: roleOptions.value.find(r => r.value === (pr.role?.id ?? pr.role))?.label || '',
          roleLoadId: pr.roleLoad?.id ?? pr.roleLoad,
          roleLoadLabel: roleLoadOptions.value.find(rl => rl.value === (pr.roleLoad?.id ?? pr.roleLoad))?.label || '',
          amountWorkersRole: pr.amountWorkersRole
        }))

        // Extraer Competencias anidadas y aplanarlas para la vista de tabla
        const loadedComps = []
        data.projectRoles.forEach(pr => {
          const rId = pr.role?.id ?? pr.role
          const rName = roleOptions.value.find(r => r.value === rId)?.label || ''

          if (pr.techCompetences?.length) {
            pr.techCompetences.forEach(c => {
              const compId = c.competenceId ?? c.competence?.id ?? c.competence
              const lvlId = c.levelId ?? c.level?.id ?? c.levels?.id ?? c.level
              const impId = c.competenceImportanceId ?? c.compImportance?.id ?? c.compImportance

              loadedComps.push({
                roleId: rId,
                roleName: rName,
                competenceId: compId,
                competenceName: competenceOptions.value.find(comp => comp.value === compId)?.label || '',
                levelId: lvlId,
                levelName: levelOptions.value.find(l => l.value === lvlId)?.label || '',
                importanceId: impId,
                importanceName: importanceOptions.value.find(i => i.value === impId)?.label || ''
              })
            })
          }
        })
        projectCompetences.value = loadedComps
      }
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('features.projects.structure.dataLoadError'), life: 3000 })
  }
})

// === MÉTODOS PARA ROLES ===
function addOrUpdateRole() {
  if (!canAddRole.value) return

  const roleName = roleOptions.value.find(r => r.value === selectedRoleId.value)?.label
  const roleLoadLabel = roleLoadOptions.value.find(rl => rl.value === selectedRoleLoadId.value)?.label

  if (isEditingRole.value) {
    if (selectedRoleId.value !== editingRoleId.value && projectRoles.value.some(pr => pr.roleId === selectedRoleId.value)) {
      toast.add({ severity: 'warn', summary: t('features.projects.structure.aviso'), detail: t('features.projects.structure.roleExists'), life: 3000 })
      return
    }

    const index = projectRoles.value.findIndex(pr => pr.roleId === editingRoleId.value)
    if (index !== -1) {
      projectRoles.value[index] = {
        roleId: selectedRoleId.value, roleName, roleLoadId: selectedRoleLoadId.value, roleLoadLabel, amountWorkersRole: workersAmount.value
      }

      projectCompetences.value.forEach(comp => {
        if (comp.roleId === editingRoleId.value) {
          comp.roleId = selectedRoleId.value
          comp.roleName = roleName
        }
      })

      toast.add({ severity: 'success', summary: t('features.projects.structure.updatedSummary'), detail: t('features.projects.structure.roleUpdated'), life: 2000 })
    }
  } else {
    if (projectRoles.value.some(pr => pr.roleId === selectedRoleId.value)) {
      toast.add({ severity: 'info', summary: t('features.projects.structure.aviso'), detail: t('features.projects.structure.roleAlreadyAdded'), life: 3000 })
      return
    }

    projectRoles.value.push({ roleId: selectedRoleId.value, roleName, roleLoadId: selectedRoleLoadId.value, roleLoadLabel, amountWorkersRole: workersAmount.value })
  }
  resetRoleForm()
}

function handleRoleRowClick(row) {
  selectedRoleId.value = row.roleId
  selectedRoleLoadId.value = row.roleLoadId
  workersAmount.value = row.amountWorkersRole
  editingRoleId.value = row.roleId
}

function resetRoleForm() {
  selectedRoleId.value = ''
  selectedRoleLoadId.value = ''
  workersAmount.value = 1
  editingRoleId.value = null
}

function removeSelectedRoles() {
  const removedRoleIds = selectedRolesToDelete.value.map(r => r.roleId)
  projectRoles.value = projectRoles.value.filter(pr => !selectedRolesToDelete.value.includes(pr))
  selectedRolesToDelete.value = []

  projectCompetences.value = projectCompetences.value.filter(pc => !removedRoleIds.includes(pc.roleId))

  if (editingRoleId.value && removedRoleIds.includes(editingRoleId.value)) {
    resetRoleForm()
  }
}

// === MÉTODOS PARA COMPETENCIAS ===
function addOrUpdateCompetence() {
  if (!canAddComp.value) return

  const roleName = availableRolesForCompetences.value.find(r => r.value === selectedCompRoleId.value)?.label
  const compName = competenceOptions.value.find(c => c.value === selectedCompId.value)?.label
  const levelName = levelOptions.value.find(l => l.value === selectedCompLevelId.value)?.label
  const impName = importanceOptions.value.find(i => i.value === selectedCompImportanceId.value)?.label
  const uniqueKey = `${selectedCompRoleId.value}-${selectedCompId.value}`

  if (isEditingComp.value) {
    if (uniqueKey !== editingCompId.value && projectCompetences.value.some(c => `${c.roleId}-${c.competenceId}` === uniqueKey)) {
      toast.add({ severity: 'warn', summary: t('features.projects.structure.aviso'), detail: t('features.projects.structure.competenceAlreadyAdded'), life: 3000 })
      return
    }

    const index = projectCompetences.value.findIndex(c => `${c.roleId}-${c.competenceId}` === editingCompId.value)
    if (index !== -1) {
      projectCompetences.value[index] = {
        roleId: selectedCompRoleId.value, roleName,
        competenceId: selectedCompId.value, competenceName: compName,
        levelId: selectedCompLevelId.value, levelName,
        importanceId: selectedCompImportanceId.value, importanceName: impName
      }
      toast.add({ severity: 'success', summary: t('features.projects.structure.updatedSummary'), detail: t('features.projects.structure.competenceUpdated'), life: 2000 })
    }
  } else {
    if (projectCompetences.value.some(c => `${c.roleId}-${c.competenceId}` === uniqueKey)) {
      toast.add({ severity: 'info', summary: t('features.projects.structure.aviso'), detail: t('features.projects.structure.competenceAlreadyAdded'), life: 3000 })
      return
    }

    projectCompetences.value.push({
      roleId: selectedCompRoleId.value, roleName,
      competenceId: selectedCompId.value, competenceName: compName,
      levelId: selectedCompLevelId.value, levelName,
      importanceId: selectedCompImportanceId.value, importanceName: impName
    })
  }
  resetCompForm()
}

function handleCompRowClick(row) {
  selectedCompRoleId.value = row.roleId
  selectedCompId.value = row.competenceId
  selectedCompLevelId.value = row.levelId
  selectedCompImportanceId.value = row.importanceId
  editingCompId.value = `${row.roleId}-${row.competenceId}`
}

function resetCompForm() {
  selectedCompRoleId.value = ''
  selectedCompId.value = ''
  selectedCompLevelId.value = ''
  selectedCompImportanceId.value = ''
  editingCompId.value = null
}

function removeSelectedComps() {
  projectCompetences.value = projectCompetences.value.filter(c => !selectedCompsToDelete.value.includes(c))
  selectedCompsToDelete.value = []

  if (editingCompId.value && !projectCompetences.value.some(c => `${c.roleId}-${c.competenceId}` === editingCompId.value)) {
    resetCompForm()
  }
}

// === GUARDAR TODO ===
async function handleSave() {
  if (!structureName.value.trim() || !hasBoss.value || projectRoles.value.length === 0) {
    toast.add({ severity: 'warn', summary: t('features.projects.structure.validationSummary'), detail: t('features.projects.structure.nameAndBossRequired'), life: 4000 })
    return
  }

  saving.value = true

  // Transformar el payload a la estructura anidada requerida por la API
  const payload = {
    name: structureName.value,
    projectRoles: projectRoles.value.map(pr => {
      // Filtramos las competencias que pertenecen únicamente a este rol
      const roleCompetences = projectCompetences.value
        .filter(pc => pc.roleId === pr.roleId)
        .map(pc => ({
          competenceId: pc.competenceId,
          competenceImportanceId: pc.importanceId,
          levelId: pc.levelId
        }))

      return {
        role: pr.roleId,
        roleLoad: pr.roleLoadId,
        amountWorkersRole: pr.amountWorkersRole,
        techCompetences: roleCompetences // Anidamos las competencias aquí
      }
    })
  }

  try {
    if (isEditMode.value) {
      await fetchUpdateProjectStructure(route.params.id, payload)
      toast.add({ severity: 'success', summary: t('common.success'), detail: t('features.projects.structure.structureUpdated'), life: 3000 })
    } else {
      await fetchCreateProjectStructure(payload)
      toast.add({ severity: 'success', summary: t('common.success'), detail: t('features.projects.structure.structureCreated'), life: 3000 })
    }
    router.back()
  } catch (e) {
    const detail = await parseApiError(e, t('common.saveError'))
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail,
      life: 3000,
    })
  } finally {
    saving.value = false
  }
}
</script>
