<script setup>
import { ref, watch, computed } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import { useToast } from 'primevue/usetoast'
import countyService from '@/api/countyService'
import raceService from '@/api/raceService'
import personGroupService from '@/api/personGroupService'
import nacionalityService from '@/api/nacionalityService'
import religionService from '@/api/religionService'
import competenceService from '@/api/competenceService'
import levelsService from '@/api/levelsService'
import roleService from '@/api/roleService'
import projectService from '@/api/projectService'
import conflictIndexService from '@/api/conflictIndexService'

const props = defineProps({
  visible: Boolean,
  mode: String,
  initialData: Object
})

const emit = defineEmits(['update:visible', 'save', 'cancel'])
const toast = useToast()

// Datos básicos
const personName = ref('')
const card = ref('')
const surName = ref('')
const address = ref('')
const phone = ref('')
const sex = ref(null)
const email = ref('')
const inDate = ref(null)
const workload = ref(0)
const experience = ref(0)
const status = ref('')
const birthDate = ref(null)

// Referencias
const selectedCounty = ref(null)
const selectedRace = ref(null)
const selectedGroup = ref(null)
const selectedNacionality = ref(null)
const selectedReligion = ref(null)

// Opciones
const countyOptions = ref([])
const raceOptions = ref([])
const groupOptions = ref([])
const nacionalityOptions = ref([])
const religionOptions = ref([])
const sexOptions = [
  { label: 'Masculino', value: 'M' },
  { label: 'Femenino', value: 'F' }
]
const statusOptions = [
  { label: 'Activo', value: 'Activo' },
  { label: 'Inactivo', value: 'Inactivo' }
]

// Competencias
const competenceOptions = ref([])
const levelOptions = ref([])
const selectedCompetence = ref(null)
const selectedLevel = ref(null)
const competenceValues = ref([])

// Intereses en roles
const roleOptions = ref([])
const selectedRole = ref(null)
const rolePreference = ref(true)
const personalInterests = ref([])

// Intereses en proyectos
const projectOptions = ref([])
const selectedProject = ref(null)
const projectPreference = ref(true)
const personalProjectInterests = ref([])

// Test psicológico
const personTest = ref({
  tipoMB: '',
  e_S: '',
  i_D: '',
  c_O: '',
  i_S: '',
  c_E: '',
  i_R: '',
  m_E: '',
  c_H: '',
  i_F: ''
})

// Conflictos
const conflictIndexOptions = ref([])
const selectedConflictIndex = ref(null)
const selectedConflictPerson = ref(null)
const personOptions = ref([])
const personConflicts = ref([])

const dialogTitle = computed(() => {
  return props.mode === 'create' ? 'Crear Persona' : 'Editar Persona'
})

const loadOptions = async () => {
  try {
    const [counties, races, groups, nacionalities, religions, competences, levels, roles, projects, conflicts] = await Promise.all([
      countyService.getAll(),
      raceService.getAll(),
      personGroupService.getAll(),
      nacionalityService.getAll(),
      religionService.getAll(),
      competenceService.getAll(),
      levelsService.getAll(),
      roleService.getAll(),
      projectService.getAll(),
      conflictIndexService.getAll()
    ])

    countyOptions.value = counties.map(c => ({ label: c.countyName, value: c.id }))
    raceOptions.value = races.map(r => ({ label: r.raceName, value: r.id }))
    groupOptions.value = groups.map(g => ({ label: g.name, value: g.id }))
    nacionalityOptions.value = nacionalities.map(n => ({ label: n.paisNac, value: n.id }))
    religionOptions.value = religions.map(r => ({ label: r.religionName, value: r.id }))
    competenceOptions.value = competences.map(c => ({ label: c.competitionName, value: c.id }))
    levelOptions.value = levels.map(l => ({ label: l.significance, value: l.id }))
    roleOptions.value = roles.map(r => ({ label: r.roleName, value: r.id }))
    projectOptions.value = projects.map(p => ({ label: p.projectName, value: p.id }))
    conflictIndexOptions.value = conflicts.map(c => ({ label: c.description, value: c.id }))
    personOptions.value = [] // Se cargará con las personas existentes
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

const addCompetence = () => {
  if (!selectedCompetence.value || !selectedLevel.value) return
  
  const competenceName = competenceOptions.value.find(c => c.value === selectedCompetence.value)?.label
  const levelName = levelOptions.value.find(l => l.value === selectedLevel.value)?.label
  
  competenceValues.value.push({
    competenceId: selectedCompetence.value,
    competenceName,
    levelsId: selectedLevel.value,
    levelName
  })
  
  selectedCompetence.value = null
  selectedLevel.value = null
}

const removeCompetences = (selected) => {
  competenceValues.value = competenceValues.value.filter(c => !selected.includes(c))
}

const addRoleInterest = () => {
  if (!selectedRole.value) return
  
  const roleName = roleOptions.value.find(r => r.value === selectedRole.value)?.label
  
  personalInterests.value.push({
    roleId: selectedRole.value,
    roleName,
    preference: rolePreference.value
  })
  
  selectedRole.value = null
  rolePreference.value = true
}

const removeRoleInterests = (selected) => {
  personalInterests.value = personalInterests.value.filter(r => !selected.includes(r))
}

const addProjectInterest = () => {
  if (!selectedProject.value) return
  
  const projectName = projectOptions.value.find(p => p.value === selectedProject.value)?.label
  
  personalProjectInterests.value.push({
    projectId: selectedProject.value,
    projectName,
    preference: projectPreference.value
  })
  
  selectedProject.value = null
  projectPreference.value = true
}

const removeProjectInterests = (selected) => {
  personalProjectInterests.value = personalProjectInterests.value.filter(p => !selected.includes(p))
}

const addConflict = () => {
  if (!selectedConflictIndex.value || !selectedConflictPerson.value) return
  
  const conflictName = conflictIndexOptions.value.find(c => c.value === selectedConflictIndex.value)?.label
  const personName = personOptions.value.find(p => p.value === selectedConflictPerson.value)?.label
  
  personConflicts.value.push({
    conflictIndexId: selectedConflictIndex.value,
    conflictName,
    personConflictId: selectedConflictPerson.value,
    personConflictName: personName
  })
  
  selectedConflictIndex.value = null
  selectedConflictPerson.value = null
}

const removeConflicts = (selected) => {
  personConflicts.value = personConflicts.value.filter(c => !selected.includes(c))
}

const initializeForm = () => {
  if (props.mode === 'edit' && props.initialData) {
    personName.value = props.initialData.personName || ''
    card.value = props.initialData.card || ''
    surName.value = props.initialData.surName || ''
    address.value = props.initialData.address || ''
    phone.value = props.initialData.phone || ''
    sex.value = props.initialData.sex || null
    email.value = props.initialData.email || ''
    inDate.value = props.initialData.inDate ? new Date(props.initialData.inDate) : null
    workload.value = props.initialData.workload || 0
    experience.value = props.initialData.experience || 0
    status.value = props.initialData.status || ''
    birthDate.value = props.initialData.birthDate ? new Date(props.initialData.birthDate) : null
    
    selectedCounty.value = props.initialData.county?.id || props.initialData.county || null
    selectedRace.value = props.initialData.race?.id || props.initialData.race || null
    selectedGroup.value = props.initialData.group?.id || props.initialData.group || null
    selectedNacionality.value = props.initialData.nacionality?.id || props.initialData.nacionality || null
    selectedReligion.value = props.initialData.religion?.id || props.initialData.religion || null
    
    competenceValues.value = props.initialData.competenceValues?.map(cv => ({
      competenceId: cv.competenceId || cv.competence?.id,
      competenceName: competenceOptions.value.find(c => c.value === (cv.competenceId || cv.competence?.id))?.label,
      levelsId: cv.levelsId || cv.levels?.id,
      levelName: levelOptions.value.find(l => l.value === (cv.levelsId || cv.levels?.id))?.label
    })) || []
    
    personalInterests.value = props.initialData.personalInterests?.map(pi => ({
      roleId: pi.roleId || pi.role?.id,
      roleName: roleOptions.value.find(r => r.value === (pi.roleId || pi.role?.id))?.label,
      preference: pi.preference
    })) || []
    
    personalProjectInterests.value = props.initialData.personalProjectInterests?.map(ppi => ({
      projectId: ppi.projectId || ppi.project?.id,
      projectName: projectOptions.value.find(p => p.value === (ppi.projectId || ppi.project?.id))?.label,
      preference: ppi.preference
    })) || []
    
    personTest.value = props.initialData.personTest || {
      tipoMB: '', e_S: '', i_D: '', c_O: '', i_S: '', c_E: '', i_R: '', m_E: '', c_H: '', i_F: ''
    }
    
    personConflicts.value = props.initialData.personConflicts?.map(pc => ({
      conflictIndexId: pc.conflictIndexId || pc.conflictIndex?.id,
      conflictName: conflictIndexOptions.value.find(c => c.value === (pc.conflictIndexId || pc.conflictIndex?.id))?.label,
      personConflictId: pc.personConflictId,
      personConflictName: personOptions.value.find(p => p.value === pc.personConflictId)?.label
    })) || []
  } else {
    // Limpiar formulario
    personName.value = ''
    card.value = ''
    surName.value = ''
    address.value = ''
    phone.value = ''
    sex.value = null
    email.value = ''
    inDate.value = null
    workload.value = 0
    experience.value = 0
    status.value = ''
    birthDate.value = null
    selectedCounty.value = null
    selectedRace.value = null
    selectedGroup.value = null
    selectedNacionality.value = null
    selectedReligion.value = null
    competenceValues.value = []
    personalInterests.value = []
    personalProjectInterests.value = []
    personTest.value = { tipoMB: '', e_S: '', i_D: '', c_O: '', i_S: '', c_E: '', i_R: '', m_E: '', c_H: '', i_F: '' }
    personConflicts.value = []
  }
}

const validate = () => {
  if (!personName.value.trim() || !card.value.trim() || !surName.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Validación',
      detail: 'Complete los campos obligatorios: Nombre, CI y Apellidos',
      life: 3000
    })
    return false
  }
  return true
}

const handleSave = () => {
  if (!validate()) return
  
  const data = {
    personName: personName.value,
    card: card.value,
    surName: surName.value,
    address: address.value,
    phone: phone.value,
    sex: sex.value,
    email: email.value,
    inDate: inDate.value?.toISOString(),
    workload: workload.value,
    experience: experience.value,
    status: status.value,
    birthDate: birthDate.value?.toISOString(),
    county: selectedCounty.value,
    race: selectedRace.value,
    group: selectedGroup.value,
    nacionality: selectedNacionality.value,
    religion: selectedReligion.value,
    competenceValues: competenceValues.value.map(cv => ({
      competenceId: cv.competenceId,
      levelsId: cv.levelsId
    })),
    personalInterests: personalInterests.value.map(pi => ({
      roleId: pi.roleId,
      preference: pi.preference
    })),
    personalProjectInterests: personalProjectInterests.value.map(ppi => ({
      projectId: ppi.projectId,
      preference: ppi.preference
    })),
    personTest: personTest.value,
    personConflicts: personConflicts.value.map(pc => ({
      conflictIndexId: pc.conflictIndexId,
      personConflictId: pc.personConflictId
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
      :style="{ width: '95vw', height: '95vh' }"
      @update:visible="$emit('update:visible', $event)"
  >
    <template #header>
      <h3 class="text-xl font-bold">{{ dialogTitle }}</h3>
    </template>

    <div class="form-container">
      <TabView>
        <!-- Tab 1: Datos Básicos -->
        <TabPanel header="Datos Básicos">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Nombre <span class="text-red-500">*</span></label>
              <InputText v-model="personName" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Apellidos <span class="text-red-500">*</span></label>
              <InputText v-model="surName" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">CI <span class="text-red-500">*</span></label>
              <InputText v-model="card" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Dirección</label>
              <InputText v-model="address" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Teléfono</label>
              <InputText v-model="phone" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Email</label>
              <InputText v-model="email" type="email" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Sexo</label>
              <Dropdown v-model="sex" :options="sexOptions" optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Fecha de Nacimiento</label>
              <Calendar v-model="birthDate" dateFormat="dd/mm/yy" showIcon class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Fecha de Ingreso</label>
              <Calendar v-model="inDate" dateFormat="dd/mm/yy" showIcon class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Carga de Trabajo</label>
              <InputNumber v-model="workload" :min="0" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Experiencia (años)</label>
              <InputNumber v-model="experience" :min="0" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Estado</label>
              <Dropdown v-model="status" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Provincia</label>
              <Dropdown v-model="selectedCounty" :options="countyOptions" optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" :filter="true" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Raza</label>
              <Dropdown v-model="selectedRace" :options="raceOptions" optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" :filter="true" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Grupo</label>
              <Dropdown v-model="selectedGroup" :options="groupOptions" optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" :filter="true" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Nacionalidad</label>
              <Dropdown v-model="selectedNacionality" :options="nacionalityOptions" optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" :filter="true" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Religión</label>
              <Dropdown v-model="selectedReligion" :options="religionOptions" optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" :filter="true" />
            </div>
          </div>
        </TabPanel>

        <!-- Tab 2: Competencias -->
        <TabPanel header="Competencias">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Competencia</label>
              <Dropdown v-model="selectedCompetence" :options="competenceOptions" optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" :filter="true" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Nivel</label>
              <Dropdown v-model="selectedLevel" :options="levelOptions" optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" />
            </div>
            <div class="field flex items-end">
              <Button label="Agregar" icon="pi pi-plus" @click="addCompetence" :disabled="!selectedCompetence || !selectedLevel" class="w-full" />
            </div>
          </div>
          <DataTable :value="competenceValues" selectionMode="multiple" dataKey="competenceId" class="p-datatable-sm">
            <template #header>
              <div class="flex justify-between items-center">
                <span class="font-semibold">Competencias Asignadas</span>
                <Button label="Eliminar Seleccionados" icon="pi pi-trash" severity="danger" size="small" @click="removeCompetences($event)" />
              </div>
            </template>
            <Column selectionMode="multiple" style="width: 3rem" />
            <Column field="competenceName" header="Competencia" />
            <Column field="levelName" header="Nivel" />
          </DataTable>
        </TabPanel>

        <!-- Tab 3: Intereses -->
        <TabPanel header="Intereses">
          <h4 class="text-sm font-semibold mb-2">Intereses en Roles</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Rol</label>
              <Dropdown v-model="selectedRole" :options="roleOptions" optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" :filter="true" />
            </div>
            <div class="field flex items-center">
              <Checkbox v-model="rolePreference" :binary="true" inputId="rolePreference" />
              <label for="rolePreference" class="ml-2">Preferencia</label>
            </div>
            <div class="field flex items-end">
              <Button label="Agregar" icon="pi pi-plus" @click="addRoleInterest" :disabled="!selectedRole" class="w-full" />
            </div>
          </div>
          <DataTable :value="personalInterests" selectionMode="multiple" dataKey="roleId" class="p-datatable-sm mb-4">
            <Column selectionMode="multiple" style="width: 3rem" />
            <Column field="roleName" header="Rol" />
            <Column field="preference" header="Preferencia">
              <template #body="slotProps">
                <Checkbox :modelValue="slotProps.data.preference" :binary="true" disabled />
              </template>
            </Column>
          </DataTable>

          <h4 class="text-sm font-semibold mb-2">Intereses en Proyectos</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Proyecto</label>
              <Dropdown v-model="selectedProject" :options="projectOptions" optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" :filter="true" />
            </div>
            <div class="field flex items-center">
              <Checkbox v-model="projectPreference" :binary="true" inputId="projectPreference" />
              <label for="projectPreference" class="ml-2">Preferencia</label>
            </div>
            <div class="field flex items-end">
              <Button label="Agregar" icon="pi pi-plus" @click="addProjectInterest" :disabled="!selectedProject" class="w-full" />
            </div>
          </div>
          <DataTable :value="personalProjectInterests" selectionMode="multiple" dataKey="projectId" class="p-datatable-sm">
            <Column selectionMode="multiple" style="width: 3rem" />
            <Column field="projectName" header="Proyecto" />
            <Column field="preference" header="Preferencia">
              <template #body="slotProps">
                <Checkbox :modelValue="slotProps.data.preference" :binary="true" disabled />
              </template>
            </Column>
          </DataTable>
        </TabPanel>

        <!-- Tab 4: Test Psicológico -->
        <TabPanel header="Test Psicológico">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Tipo MB</label>
              <InputText v-model="personTest.tipoMB" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">E_S</label>
              <InputText v-model="personTest.e_S" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">I_D</label>
              <InputText v-model="personTest.i_D" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">C_O</label>
              <InputText v-model="personTest.c_O" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">I_S</label>
              <InputText v-model="personTest.i_S" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">C_E</label>
              <InputText v-model="personTest.c_E" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">I_R</label>
              <InputText v-model="personTest.i_R" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">M_E</label>
              <InputText v-model="personTest.m_E" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">C_H</label>
              <InputText v-model="personTest.c_H" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">I_F</label>
              <InputText v-model="personTest.i_F" class="w-full" />
            </div>
          </div>
        </TabPanel>

        <!-- Tab 5: Conflictos -->
        <TabPanel header="Conflictos">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Índice de Conflicto</label>
              <Dropdown v-model="selectedConflictIndex" :options="conflictIndexOptions" optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" :filter="true" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Persona en Conflicto</label>
              <Dropdown v-model="selectedConflictPerson" :options="personOptions" optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" :filter="true" />
            </div>
            <div class="field flex items-end">
              <Button label="Agregar" icon="pi pi-plus" @click="addConflict" :disabled="!selectedConflictIndex || !selectedConflictPerson" class="w-full" />
            </div>
          </div>
          <DataTable :value="personConflicts" selectionMode="multiple" dataKey="conflictIndexId" class="p-datatable-sm">
            <Column selectionMode="multiple" style="width: 3rem" />
            <Column field="conflictName" header="Índice de Conflicto" />
            <Column field="personConflictName" header="Persona" />
          </DataTable>
        </TabPanel>
      </TabView>
    </div>

    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" @click="handleCancel" class="p-button-text" />
      <Button label="Guardar" icon="pi pi-check" @click="handleSave" />
    </template>
  </Dialog>
</template>

<style scoped>
.form-container {
  padding: 0.5rem 0;
  max-height: calc(95vh - 180px);
  overflow-y: auto;
}

.field {
  margin-bottom: 0.25rem;
}

:deep(.p-tabview) {
  display: flex;
  flex-direction: column;
}

:deep(.p-tabview-panels) {
  flex: 1;
  overflow: visible;
  padding: 0.75rem;
}

:deep(.p-tabview-panel) {
  overflow: visible;
}

:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-calendar),
:deep(.p-inputnumber-input) {
  padding: 0.4rem 0.5rem;
  font-size: 0.875rem;
}

:deep(.p-button) {
  padding: 0.4rem 0.75rem;
  font-size: 0.875rem;
}

:deep(.p-datatable-sm .p-datatable-tbody > tr > td) {
  padding: 0.4rem 0.5rem;
}

:deep(.p-datatable-sm .p-datatable-thead > tr > th) {
  padding: 0.4rem 0.5rem;
  font-size: 0.875rem;
}
</style>
