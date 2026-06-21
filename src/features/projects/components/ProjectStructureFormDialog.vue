<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useToast } from 'primevue/usetoast'
import { Plus, Trash2, AlertCircle } from 'lucide-vue-next'
import AppSelect from '@/components/ui/AppSelect.vue'
import { parseApiError } from '@/lib/apiError'

import roleService from '@/features/roles/services/roleService.js'
import roleLoadService from '@/features/nomenclatives/services/roleLoadService.js'

const props = defineProps({
  visible: Boolean,
  mode: String,
  initialData: Object
})

const emit = defineEmits(['update:visible', 'save', 'cancel'])
const toast = useToast()
const { t } = useI18n()

const structureName = ref('')
const selectedRoleId = ref(null)
const selectedRoleLoadId = ref(null)
const workersAmount = ref(1)

const projectRoles = ref([])
const roleOptions = ref([])
const roleLoadOptions = ref([])
const selectedRolesToDelete = ref([])

const dialogTitle = computed(() => {
  return props.mode === 'create'
    ? t('features.projects.structure.dialogCreateTitle')
    : t('features.projects.structure.dialogEditTitle')
})

const canAddRole = computed(() => {
  return selectedRoleId.value !== null &&
         selectedRoleLoadId.value !== null &&
         workersAmount.value >= 1
})

const hasBoss = computed(() => {
  return projectRoles.value.some(pr => {
    const role = roleOptions.value.find(r => r.value === pr.roleId)
    return role?.isBoss
  })
})

const loadOptions = async () => {
  try {
    const [roles, roleLoads] = await Promise.all([
      roleService.getAll(),
      roleLoadService.getAll()
    ])

    roleOptions.value = roles.map(r => ({
      label: r.roleName,
      value: r.id,
      isBoss: r.isBoss,
      description: r.roleDesc
    }))

    roleLoadOptions.value = roleLoads.map(rl => ({
      label: `${rl.value} -> ${rl.significance}`,
      value: rl.id
    }))
  } catch (e) {
    console.error('Error loading options:', e)
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: await parseApiError(e, t('features.projects.structure.optionsLoadError')),
      life: 3000
    })
  }
}

const getRoleName = (roleId) => roleOptions.value.find(r => r.value === roleId)?.label || ''
const getRoleLoadLabel = (roleLoadId) => roleLoadOptions.value.find(rl => rl.value === roleLoadId)?.label || ''

const initializeForm = () => {
  if (props.mode === 'edit' && props.initialData) {
    structureName.value = props.initialData.name || ''

    if (roleOptions.value.length > 0 && roleLoadOptions.value.length > 0) {
      projectRoles.value = props.initialData.projectRoles?.map(pr => ({
        roleId: pr.role?.id || pr.role,
        roleName: getRoleName(pr.role?.id || pr.role),
        roleLoadId: pr.roleLoad?.id || pr.roleLoad,
        roleLoadLabel: getRoleLoadLabel(pr.roleLoad?.id || pr.roleLoad),
        amountWorkersRole: pr.amountWorkersRole
      })) || []
    }
  } else {
    structureName.value = ''
    projectRoles.value = []
  }

  selectedRoleId.value = null
  selectedRoleLoadId.value = null
  workersAmount.value = 1
  selectedRolesToDelete.value = []
}

const addRole = () => {
  if (!canAddRole.value) return

  const exists = projectRoles.value.some(pr => pr.roleId === selectedRoleId.value)

  if (!exists) {
    projectRoles.value.push({
      roleId: selectedRoleId.value,
      roleName: getRoleName(selectedRoleId.value),
      roleLoadId: selectedRoleLoadId.value,
      roleLoadLabel: getRoleLoadLabel(selectedRoleLoadId.value),
      amountWorkersRole: workersAmount.value
    })
  } else {
    toast.add({
      severity: 'info',
      summary: t('features.projects.structure.aviso'),
      detail: t('features.projects.structure.roleAlreadyAdded'),
      life: 3000
    })
  }

  selectedRoleId.value = null
  selectedRoleLoadId.value = null
  workersAmount.value = 1
}

const deleteSelectedRoles = () => {
  projectRoles.value = projectRoles.value.filter(
    pr => !selectedRolesToDelete.value.includes(pr)
  )
  selectedRolesToDelete.value = []
}

const validate = () => {
  if (!structureName.value.trim()) {
    toast.add({ severity: 'warn', summary: t('features.projects.structure.validationSummary'), detail: t('features.projects.structure.nameRequired'), life: 3000 })
    return false
  }
  if (projectRoles.value.length === 0) {
    toast.add({ severity: 'warn', summary: t('features.projects.structure.validationSummary'), detail: t('features.projects.structure.minOneRole'), life: 3000 })
    return false
  }
  if (!hasBoss.value) {
    toast.add({ severity: 'warn', summary: t('features.projects.structure.validationSummary'), detail: t('features.projects.structure.bossRoleRequired'), life: 4000 })
    return false
  }
  return true
}

const handleSave = () => {
  if (!validate()) return
  const data = {
    name: structureName.value,
    projectRoles: projectRoles.value.map(pr => ({
      role: pr.roleId,
      roleLoad: pr.roleLoadId,
      amountWorkersRole: pr.amountWorkersRole
    }))
  }
  emit('save', data)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

watch(() => props.visible, async (newVal) => {
  if (newVal) {
    await loadOptions()
    initializeForm()
  }
})
</script>

<template>
  <Dialog
    :visible="visible"
    :modal="true"
    :closable="true"
    :style="{ width: '900px', maxHeight: '90vh' }"
    @update:visible="$emit('update:visible', $event)"
    @hide="handleCancel"
  >
    <template #header>
      <h3 class="text-xl font-bold text-gray-800">{{ dialogTitle }}</h3>
    </template>

    <div class="py-4 space-y-6 overflow-y-auto custom-scrollbar" style="max-height: calc(90vh - 200px)">
      <!-- Nombre de la estructura -->
      <div class="space-y-1.5">
        <label for="structureName" class="block text-sm font-medium text-gray-700">
          {{ t('features.projects.structure.nameLabel') }} <span class="text-error-500">*</span>
        </label>
        <input
          id="structureName"
          v-model="structureName"
          type="text"
          :placeholder="t('features.projects.structure.nameLabel')"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
        />
      </div>

      <!-- Agregar Roles -->
      <div class="bg-blue-light-50 border border-blue-light-100 p-5 rounded-xl space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">{{ t('features.projects.structure.role') }}</label>
            <AppSelect
              v-model="selectedRoleId"
              :options="roleOptions"
              :placeholder="t('common.select')"
              searchable
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">{{ t('features.projects.structure.roleLoad') }}</label>
            <AppSelect
              v-model="selectedRoleLoadId"
              :options="roleLoadOptions"
              :placeholder="t('common.select')"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">{{ t('features.projects.structure.workersAmount') }}</label>
            <input
              type="number"
              v-model.number="workersAmount"
              min="1"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>
        </div>

        <div class="flex pt-2">
          <button
            type="button"
            @click="addRole"
            :disabled="!canAddRole"
            class="inline-flex items-center gap-2 px-4 py-2 w-full justify-center rounded-lg bg-blue-light-300 text-white text-sm font-medium hover:bg-blue-light-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus class="w-4 h-4" />
            {{ t('features.projects.structure.addRole') }}
          </button>
        </div>
      </div>

      <!-- DataTable -->
      <div class="space-y-3">
        <div v-if="!hasBoss && projectRoles.length > 0" class="flex items-center gap-2 text-warning-700 bg-warning-50 p-3 rounded-lg border border-warning-200">
          <AlertCircle class="w-4 h-4 flex-shrink-0" />
          <p class="text-xs font-medium">{{ t('features.projects.structure.bossReminder') }}</p>
        </div>

        <div class="border border-gray-200 rounded-xl overflow-hidden">
          <DataTable
            v-model:selection="selectedRolesToDelete"
            :value="projectRoles"
            dataKey="roleId"
            class="p-datatable-sm"
          >
            <template #header>
              <div class="flex justify-between items-center bg-brand-500 text-white -m-3 p-3">
                <span class="font-semibold text-sm">{{ t('features.projects.structure.teamStructure') }}</span>
                <button
                  v-if="selectedRolesToDelete.length > 0"
                  @click="deleteSelectedRoles"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error-500 text-white text-xs font-medium hover:bg-error-600 transition-colors"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                  {{ t('features.projects.structure.removeSelected') }}
                </button>
              </div>
            </template>

            <Column selectionMode="multiple" style="width: 3rem"></Column>
            <Column field="roleName" :header="t('features.projects.structure.role')"></Column>
            <Column field="amountWorkersRole" :header="t('features.projects.structure.workersAmount')"></Column>
            <Column field="roleLoadLabel" :header="t('features.projects.structure.roleLoad')"></Column>

            <template #empty>
              <div class="text-center py-6 text-gray-500 text-sm">
                {{ t('common.noData') }}
              </div>
            </template>
          </DataTable>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-2">
        <button
          type="button"
          @click="handleCancel"
          class="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="button"
          @click="handleSave"
          :disabled="!hasBoss"
          class="px-4 py-2 rounded-lg bg-blue-light-400 text-white text-sm font-medium hover:bg-blue-light-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ t('common.save') }}
        </button>
      </div>
    </template>
  </Dialog>
</template>
