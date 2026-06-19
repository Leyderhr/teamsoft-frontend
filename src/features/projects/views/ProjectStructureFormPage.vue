<template>
  <div>
    <PageBreadcrumb 
      :page-title="pageTitle" 
      :items="[{ label: 'Estructuras de Proyecto', path: '/nomenclatives/project-structure' }]" 
    />
    
    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
        <h2 class="text-base font-semibold text-gray-800">{{ pageTitle }}</h2>
      </div>

      <div class="px-6 pt-6 pb-2">
        <div class="space-y-1 w-full max-w-xl">
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
              {{ isEditingRole ? 'Editando Rol Seleccionado' : 'Asignar Rol a la Plantilla' }}
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Rol <span class="text-error-500">*</span></label>
                <AppSelect
                  v-model="selectedRoleId"
                  :options="roleOptions"
                  placeholder="Seleccione..."
                  searchable
                />
              </div>

              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Carga del Rol <span class="text-error-500">*</span></label>
                <AppSelect
                  v-model="selectedRoleLoadId"
                  :options="roleLoadOptions"
                  placeholder="Seleccione..."
                />
              </div>

              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Cantidad Trabajadores <span class="text-error-500">*</span></label>
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
              :columns="roleTableColumns"
              selection-mode="single"
              v-model:selected="selectedRolesToDelete"
              @remove="removeSelectedRoles"
              @row-click="handleRoleRowClick"
            />
            <p class="text-xs text-gray-400 mt-2">* Haga clic en cualquier fila para editar sus valores.</p>
          </div>
        </div>

        <div v-show="activeTab === 'competences'">
          
          <div v-if="projectRoles.length === 0" class="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <AlertCircle class="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p class="text-sm text-gray-500 font-medium">Aún no has agregado roles a la estructura.</p>
            <p class="text-xs text-gray-400">Regresa a la pestaña anterior y agrega los roles primero.</p>
          </div>

          <div v-else>
            <div class="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-6 transition-colors">
              <h3 class="text-sm font-semibold mb-4 text-gray-700">
                {{ isEditingComp ? 'Editando Competencia' : 'Asignar Competencia Técnica a un Rol' }}
              </h3>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div class="space-y-1">
                  <label class="block text-sm font-medium text-gray-700">Rol del Equipo <span class="text-error-500">*</span></label>
                  <AppSelect
                    v-model="selectedCompRoleId"
                    :options="availableRolesForCompetences"
                    placeholder="Seleccione..."
                  />
                </div>

                <div class="space-y-1">
                  <label class="block text-sm font-medium text-gray-700">Competencia Técnica <span class="text-error-500">*</span></label>
                  <AppSelect
                    v-model="selectedCompId"
                    :options="competenceOptions"
                    placeholder="Seleccione..."
                    searchable
                  />
                </div>

                <div class="space-y-1">
                  <label class="block text-sm font-medium text-gray-700">Nivel Exigido <span class="text-error-500">*</span></label>
                  <AppSelect
                    v-model="selectedCompLevelId"
                    :options="levelOptions"
                    placeholder="Seleccione..."
                  />
                </div>

                <div class="space-y-1">
                  <label class="block text-sm font-medium text-gray-700">Importancia <span class="text-error-500">*</span></label>
                  <AppSelect
                    v-model="selectedCompImportanceId"
                    :options="importanceOptions"
                    placeholder="Seleccione..."
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
                  {{ isEditingComp ? 'Actualizar Competencia' : 'Agregar Competencia' }}
                </button>

                <button
                  v-if="isEditingComp"
                  type="button"
                  @click="resetCompForm"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar edición
                </button>
              </div>
            </div>

            <div v-if="projectCompetences.length > 0" class="mt-4">
              <h3 class="text-sm font-semibold text-gray-700 mb-3">Competencias Requeridas ({{ projectCompetences.length }})</h3>
              
              <MiniTable
                :rows="projectCompetences"
                :columns="compTableColumns"
                selection-mode="single"
                v-model:selected="selectedCompsToDelete"
                @remove="removeSelectedComps"
                @row-click="handleCompRowClick"
              />
              <p class="text-xs text-gray-400 mt-2">* Haga clic en cualquier fila para editar sus valores.</p>
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
          Cancelar
        </button>
        
        <button
          v-if="activeTab === 'roles'"
          type="button"
          @click="activeTab = 'competences'"
          :disabled="!hasBoss || !structureName"
          class="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          Siguiente
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
          {{ saving ? 'Guardando...' : 'Guardar Estructura' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { Save, Loader2, Plus, AlertCircle, RefreshCw, ChevronRight } from 'lucide-vue-next'

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

// Tabs Configuration
const activeTab = ref('roles')
const tabs = [
  { key: 'roles', label: 'Estructura del Equipo' },
  { key: 'competences', label: 'Competencias Técnicas' },
]

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

const roleTableColumns = [
  { field: 'roleName', header: 'ROLES' },
  { field: 'roleLoadLabel', header: 'CARGA DEL ROL' },
  { field: 'amountWorkersRole', header: 'CANTIDAD DE TRABAJADORES' }
]

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

const compTableColumns = [
  { field: 'roleName', header: 'ROL' },
  { field: 'competenceName', header: 'COMPETENCIA' },
  { field: 'levelName', header: 'NIVEL' },
  { field: 'importanceName', header: 'IMPORTANCIA' }
]

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
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos', life: 3000 })
  }
})

// === MÉTODOS PARA ROLES ===
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
        roleId: selectedRoleId.value, roleName, roleLoadId: selectedRoleLoadId.value, roleLoadLabel, amountWorkersRole: workersAmount.value
      }
      
      projectCompetences.value.forEach(comp => {
        if (comp.roleId === editingRoleId.value) {
          comp.roleId = selectedRoleId.value
          comp.roleName = roleName
        }
      })

      toast.add({ severity: 'success', summary: 'Actualizado', detail: 'Rol actualizado correctamente', life: 2000 })
    }
  } else {
    if (projectRoles.value.some(pr => pr.roleId === selectedRoleId.value)) {
      toast.add({ severity: 'info', summary: 'Aviso', detail: 'Este rol ya ha sido agregado', life: 3000 })
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
      toast.add({ severity: 'warn', summary: 'Aviso', detail: 'Esta competencia ya fue asignada al rol', life: 3000 })
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
      toast.add({ severity: 'success', summary: 'Actualizado', detail: 'Competencia actualizada correctamente', life: 2000 })
    }
  } else {
    if (projectCompetences.value.some(c => `${c.roleId}-${c.competenceId}` === uniqueKey)) {
      toast.add({ severity: 'info', summary: 'Aviso', detail: 'Esta competencia ya fue asignada a este rol', life: 3000 })
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
    toast.add({ severity: 'warn', summary: 'Validación', detail: 'Debe ingresar un nombre y al menos un rol de tipo Jefe', life: 4000 })
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