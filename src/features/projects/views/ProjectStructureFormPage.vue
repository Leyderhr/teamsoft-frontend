<template>
  <div>
    <PageBreadcrumb 
      :page-title="pageTitle" 
      :items="[{ label: 'Estructuras de Proyecto', path: '/nomenclatives/project-structure' }]" 
    />
    
    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-base font-semibold text-gray-800">{{ pageTitle }}</h2>
      </div>

      <div class="p-6">
        <div class="space-y-1 mb-6">
          <label class="block text-sm font-medium text-gray-700">
            Nombre de la Estructura <span class="text-error-500">*</span>
          </label>
          <input
            v-model="structureName"
            type="text"
            placeholder="Ingrese el nombre"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
          />
        </div>

        <div class="border-t border-gray-100 my-6"></div>

        <div class="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-6 transition-colors">
          <h3 class="text-sm font-semibold mb-4 text-gray-700">
            {{ isEditingRole ? 'Editando Rol Seleccionado' : 'Asignar Rol a la Plantilla' }}
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">Rol</label>
              <AppSelect
                v-model="selectedRoleId"
                :options="roleOptions"
                placeholder="Seleccione..."
                searchable
              />
            </div>

            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">Carga del Rol</label>
              <AppSelect
                v-model="selectedRoleLoadId"
                :options="roleLoadOptions"
                placeholder="Seleccione..."
              />
            </div>

            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">Cantidad Trabajadores</label>
              <input
                v-model.number="workersAmount"
                type="number"
                min="1"
                placeholder="Mínimo 1"
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
              {{ isEditingRole ? 'Actualizar Rol' : 'Agregar Rol' }}
            </button>

            <button
              v-if="isEditingRole"
              type="button"
              @click="resetRoleForm"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar edición
            </button>
          </div>
        </div>

        <div v-if="!hasBoss && projectRoles.length > 0" class="flex items-center gap-2 text-warning-700 bg-warning-50 p-3 rounded-lg border border-warning-200 mb-4">
          <AlertCircle class="w-4 h-4 flex-shrink-0" />
          <p class="text-xs font-medium">Debe agregar al menos un rol de tipo <strong>Jefe</strong> a la estructura.</p>
        </div>

        <div v-if="projectRoles.length > 0" class="mt-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Estructura del Equipo ({{ projectRoles.length }})</h3>
          
          <MiniTable
            :rows="projectRoles"
            :columns="tableColumns"
            selection-mode="single"
            v-model:selected="selectedRolesToDelete"
            @remove="removeSelectedRoles"
            @row-click="handleRowClick"
          />
          <p class="text-xs text-gray-400 mt-2">* Haga clic en cualquier fila para editar sus valores.</p>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <button
          type="button"
          @click="router.back()"
          class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          @click="handleSave"
          :disabled="saving || !hasBoss || !structureName"
          class="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
          <Save v-else class="w-4 h-4" />
          {{ saving ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { Save, Loader2, Plus, AlertCircle, RefreshCw } from 'lucide-vue-next'

import PageBreadcrumb from '@/shared/components/PageBreadcrumb.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import MiniTable from '@/components/common/MiniTable.vue'

import { api } from '@/lib/api'
import { fetchGetRoles } from '@/services/roles/index.js'
import { 
  fetchGetRoleLoads, 
  fetchCreateProjectStructure, 
  fetchUpdateProjectStructure 
} from '@/services/nomenclatives/index.js'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const isEditMode = computed(() => !!route.params.id)
const pageTitle = computed(() => isEditMode.value ? 'Editar Estructura de Proyecto' : 'Crear Estructura de Proyecto')

// Estado principal
const structureName = ref('')
const selectedRoleId = ref('')
const selectedRoleLoadId = ref('')
const workersAmount = ref(1)

// Estado de la tabla y opciones
const projectRoles = ref([])
const roleOptions = ref([])
const roleLoadOptions = ref([])
const selectedRolesToDelete = ref([])
const saving = ref(false)

// Estado para la edición
const editingRoleId = ref(null)
const isEditingRole = computed(() => editingRoleId.value !== null)

// Columnas definidas explícitamente en el orden solicitado
const tableColumns = [
  { field: 'roleName', header: 'ROLES' },
  { field: 'roleLoadLabel', header: 'CARGA DEL ROL' },
  { field: 'amountWorkersRole', header: 'CANTIDAD DE TRABAJADORES' }
]

const canAddRole = computed(() => {
  return selectedRoleId.value && selectedRoleLoadId.value && workersAmount.value >= 1
})

const hasBoss = computed(() => {
  return projectRoles.value.some(pr => {
    const role = roleOptions.value.find(r => r.value === pr.roleId)
    return role?.isBoss
  })
})

onMounted(async () => {
  try {
    const [roles, roleLoads] = await Promise.all([
      fetchGetRoles(),
      fetchGetRoleLoads()
    ])
    
    roleOptions.value = roles.map(r => ({ label: r.roleName, value: r.id, isBoss: r.isBoss }))
    roleLoadOptions.value = roleLoads.map(rl => ({ label: `${rl.value} -> ${rl.significance}`, value: rl.id }))

    if (isEditMode.value && route.params.id) {
      const res = await api.get(`project-structure/${route.params.id}`).json()
      const data = res?.data ?? res
      
      structureName.value = data.name ?? ''
      
      if (data.projectRoles?.length) {
        projectRoles.value = data.projectRoles.map(pr => ({
          roleId: pr.role?.id ?? pr.role,
          roleName: roleOptions.value.find(r => r.value === (pr.role?.id ?? pr.role))?.label || '',
          roleLoadId: pr.roleLoad?.id ?? pr.roleLoad,
          roleLoadLabel: roleLoadOptions.value.find(rl => rl.value === (pr.roleLoad?.id ?? pr.roleLoad))?.label || '',
          amountWorkersRole: pr.amountWorkersRole
        }))
      }
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos', life: 3000 })
  }
})

// Manejar agregar nuevo o actualizar
function addOrUpdateRole() {
  if (!canAddRole.value) return

  const roleName = roleOptions.value.find(r => r.value === selectedRoleId.value)?.label
  const roleLoadLabel = roleLoadOptions.value.find(rl => rl.value === selectedRoleLoadId.value)?.label

  if (isEditingRole.value) {
    if (selectedRoleId.value !== editingRoleId.value && projectRoles.value.some(pr => pr.roleId === selectedRoleId.value)) {
      toast.add({ severity: 'warn', summary: 'Aviso', detail: 'El rol seleccionado ya existe en la estructura', life: 3000 })
      return
    }

    const index = projectRoles.value.findIndex(pr => pr.roleId === editingRoleId.value)
    if (index !== -1) {
      projectRoles.value[index] = {
        roleId: selectedRoleId.value,
        roleName,
        roleLoadId: selectedRoleLoadId.value,
        roleLoadLabel,
        amountWorkersRole: workersAmount.value
      }
      toast.add({ severity: 'success', summary: 'Actualizado', detail: 'Rol actualizado correctamente', life: 2000 })
    }
  } else {
    if (projectRoles.value.some(pr => pr.roleId === selectedRoleId.value)) {
      toast.add({ severity: 'info', summary: 'Aviso', detail: 'Este rol ya ha sido agregado', life: 3000 })
      return
    }

    projectRoles.value.push({
      roleId: selectedRoleId.value,
      roleName,
      roleLoadId: selectedRoleLoadId.value,
      roleLoadLabel,
      amountWorkersRole: workersAmount.value
    })
  }
  resetRoleForm()
}

// Cargar la fila en los inputs cuando se toca
function handleRowClick(row) {
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
  projectRoles.value = projectRoles.value.filter(pr => !selectedRolesToDelete.value.includes(pr))
  selectedRolesToDelete.value = []
  
  // Si eliminamos el rol que se estaba editando, reiniciamos el form
  if (editingRoleId.value && !projectRoles.value.some(pr => pr.roleId === editingRoleId.value)) {
    resetRoleForm()
  }
}

async function handleSave() {
  if (!structureName.value.trim() || !hasBoss.value || projectRoles.value.length === 0) {
    toast.add({ severity: 'warn', summary: 'Validación', detail: 'Debe ingresar un nombre y al menos un rol de tipo Jefe', life: 4000 })
    return
  }

  saving.value = true
  const payload = {
    name: structureName.value,
    projectRoles: projectRoles.value.map(pr => ({
      role: pr.roleId,
      roleLoad: pr.roleLoadId,
      amountWorkersRole: pr.amountWorkersRole
    }))
  }

  try {
    if (isEditMode.value) {
      await fetchUpdateProjectStructure(route.params.id, payload)
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Estructura actualizada correctamente', life: 3000 })
    } else {
      await fetchCreateProjectStructure(payload)
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Estructura creada correctamente', life: 3000 })
    }
    router.back()
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: e?.response?.data?.message ?? e?.message ?? 'Error al guardar la estructura',
      life: 3000,
    })
  } finally {
    saving.value = false
  }
}
</script>