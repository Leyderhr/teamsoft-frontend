<script setup>
import { ref, watch, computed } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useToast } from 'primevue/usetoast'
import roleService from '@/features/roles/services/roleService.js'
import roleLoadService from '@/features/nomenclatives/services/roleLoadService.js'

const props = defineProps({
  visible: Boolean,
  mode: String,
  initialData: Object
})

const emit = defineEmits(['update:visible', 'save', 'cancel'])
const toast = useToast()

const structureName = ref('')
const selectedRoles = ref([])
const selectedRoleLoad = ref(null)
const workersAmount = ref(0)
const projectRoles = ref([])

const roleOptions = ref([])
const roleLoadOptions = ref([])

const dialogTitle = computed(() => {
  return props.mode === 'create' ? 'Crear Estructura de Proyecto' : 'Editar Estructura de Proyecto'
})

const canAddRole = computed(() => {
  return selectedRoles.value.length > 0 && 
         selectedRoleLoad.value !== null && 
         workersAmount.value > 0
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
      description: r.roleDesc
    }))
    
    roleLoadOptions.value = roleLoads.map(rl => ({
      label: `${rl.value} -> ${rl.significance}`,
      value: rl.id
    }))
  } catch (error) {
    console.error('Error loading options:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las opciones',
      life: 3000
    })
  }
}

const initializeForm = () => {
  if (props.mode === 'edit' && props.initialData) {
    structureName.value = props.initialData.name || ''
    
    // Esperar a que las opciones estén cargadas
    if (roleOptions.value.length > 0 && roleLoadOptions.value.length > 0) {
      projectRoles.value = props.initialData.projectRoles?.map(pr => ({
        roleId: pr.role?.id || pr.role,
        roleName: getRoleName(pr.role?.id || pr.role),
        roleLoadId: pr.roleLoad?.id || pr.roleLoad,
        roleLoadLabel: getRoleLoadLabel(pr.roleLoad?.id || pr.roleLoad),
        amountWorkersRole: pr.amountWorkersRole
      })) || []
    } else {
      // Guardar temporalmente si las opciones no están cargadas
      projectRoles.value = props.initialData.projectRoles?.map(pr => ({
        roleId: pr.role?.id || pr.role,
        roleName: `Rol ${pr.role?.id || pr.role}`,
        roleLoadId: pr.roleLoad?.id || pr.roleLoad,
        roleLoadLabel: `Carga ${pr.roleLoad?.id || pr.roleLoad}`,
        amountWorkersRole: pr.amountWorkersRole
      })) || []
    }
  } else {
    structureName.value = ''
    projectRoles.value = []
  }
  
  selectedRoles.value = []
  selectedRoleLoad.value = null
  workersAmount.value = 0
}

const getRoleName = (roleId) => {
  return roleOptions.value.find(r => r.value === roleId)?.label || ''
}

const getRoleLoadLabel = (roleLoadId) => {
  return roleLoadOptions.value.find(rl => rl.value === roleLoadId)?.label || ''
}

const addRoles = () => {
  if (!canAddRole.value) return
  
  selectedRoles.value.forEach(roleId => {
    const exists = projectRoles.value.some(pr => pr.roleId === roleId)
    if (!exists) {
      projectRoles.value.push({
        roleId: roleId,
        roleName: getRoleName(roleId),
        roleLoadId: selectedRoleLoad.value,
        roleLoadLabel: getRoleLoadLabel(selectedRoleLoad.value),
        amountWorkersRole: workersAmount.value
      })
    }
  })
  
  selectedRoles.value = []
  selectedRoleLoad.value = null
  workersAmount.value = 0
}

const selectedRolesToDelete = ref([])
const deleteSelectedRoles = () => {
  projectRoles.value = projectRoles.value.filter(
    pr => !selectedRolesToDelete.value.includes(pr)
  )
  selectedRolesToDelete.value = []
}

const validate = () => {
  if (!structureName.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Validación',
      detail: 'El nombre de la estructura es requerido',
      life: 3000
    })
    return false
  }
  
  if (projectRoles.value.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'Validación',
      detail: 'Debe agregar al menos un rol',
      life: 3000
    })
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

watch([roleOptions, roleLoadOptions], () => {
  // Actualizar nombres de roles y cargas si ya hay roles en projectRoles
  if (projectRoles.value.length > 0 && roleOptions.value.length > 0 && roleLoadOptions.value.length > 0) {
    projectRoles.value = projectRoles.value.map(pr => ({
      ...pr,
      roleName: getRoleName(pr.roleId),
      roleLoadLabel: getRoleLoadLabel(pr.roleLoadId)
    }))
  }
})

watch(() => props.visible, async (newVal) => {
  if (newVal) {
    await loadOptions()
    // Pequeña espera para asegurar que las opciones estén cargadas
    await new Promise(resolve => setTimeout(resolve, 100))
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
  >
    <template #header>
      <h3 class="text-xl font-bold">{{ dialogTitle }}</h3>
    </template>

    <div class="form-container overflow-y-auto" style="max-height: calc(90vh - 200px)">
      <div class="field mb-4">
        <label for="structureName" class="block mb-2 font-semibold">
          Nombre de la Estructura <span class="text-red-500">*</span>
        </label>
        <InputText
          id="structureName"
          v-model="structureName"
          class="w-full"
          placeholder="Ingrese el nombre de la estructura"
        />
      </div>

      <div class="bg-gray-50 p-4 rounded mb-4">
        <h4 class="font-semibold mb-3">Agregar Roles</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div class="field">
            <label for="roles" class="block mb-2 text-sm">Roles</label>
            <MultiSelect
              id="roles"
              v-model="selectedRoles"
              :options="roleOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione roles"
              class="w-full"
              :filter="true"
            />
          </div>

          <div class="field">
            <label for="roleLoad" class="block mb-2 text-sm">Carga del Rol</label>
            <Dropdown
              id="roleLoad"
              v-model="selectedRoleLoad"
              :options="roleLoadOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione carga"
              class="w-full"
              :disabled="selectedRoles.length === 0"
            />
          </div>

          <div class="field">
            <label for="workers" class="block mb-2 text-sm">Cantidad</label>
            <InputNumber
              id="workers"
              v-model="workersAmount"
              :min="0"
              class="w-full"
              :disabled="selectedRoles.length === 0"
            />
          </div>

          <div class="field flex items-end">
            <Button
              label="Agregar"
              icon="pi pi-plus"
              @click="addRoles"
              :disabled="!canAddRole"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <div class="field">
        <DataTable
          v-model:selection="selectedRolesToDelete"
          :value="projectRoles"
          dataKey="roleId"
          selectionMode="multiple"
          class="p-datatable-sm"
        >
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-semibold">Roles de la Estructura</span>
              <Button
                label="Eliminar Seleccionados"
                icon="pi pi-trash"
                severity="danger"
                size="small"
                @click="deleteSelectedRoles"
                :disabled="selectedRolesToDelete.length === 0"
              />
            </div>
          </template>

          <Column field="roleName" header="Rol" />
          <Column field="amountWorkersRole" header="Cantidad" style="width: 100px" />
          <Column field="roleLoadLabel" header="Carga del Rol" />

          <template #empty>
            <div class="text-center py-4 text-gray-500">
              No hay roles agregados
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" @click="handleCancel" class="p-button-text" />
      <Button label="Guardar" icon="pi pi-check" @click="handleSave" />
    </template>
  </Dialog>
</template>

<style scoped>
.form-container {
  padding: 1rem 0;
}

.field {
  margin-bottom: 0.5rem;
}
</style>
