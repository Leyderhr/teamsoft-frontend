<script setup>
import { ref, watch, computed } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import { useToast } from 'primevue/usetoast'
import countyService from '@/features/nomenclatives/services/countyService.js'
import raceService from '@/features/nomenclatives/services/raceService.js'
import personGroupService from '@/features/nomenclatives/services/personGroupService.js'
import nacionalityService from '@/features/nomenclatives/services/nacionalityService.js'
import religionService from '@/features/nomenclatives/services/religionService.js'
import competenceService from '@/features/competences/services/competenceService.js'
import levelsService from '@/features/nomenclatives/services/levelsService.js'
import roleService from '@/features/roles/services/roleService.js'
import projectService from '@/features/projects/services/projectService.js'
import conflictIndexService from '@/features/nomenclatives/services/conflictIndexService.js'
import personService from '@/features/persons/services/personService.js'

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
const selectedCompetences = ref([])

// Intereses en roles
const roleOptions = ref([])
const selectedRole = ref(null)
const rolePreference = ref(true)
const personalInterests = ref([])
const selectedRoleInterests = ref([])

// Intereses en proyectos
const projectOptions = ref([])
const selectedProject = ref(null)
const projectPreference = ref(true)
const personalProjectInterests = ref([])
const selectedProjectInterests = ref([])

// Test psicológico
const mbtiType = ref('')
const mbtiOptions = [
  { label: 'ESTJ', value: 'ESTJ' },
  { label: 'ENTJ', value: 'ENTJ' },
  { label: 'ESFJ', value: 'ESFJ' },
  { label: 'ENFJ', value: 'ENFJ' },
  { label: 'ESTP', value: 'ESTP' },
  { label: 'ENTP', value: 'ENTP' },
  { label: 'ESFP', value: 'ESFP' },
  { label: 'ENFP', value: 'ENFP' },
  { label: 'ISTJ', value: 'ISTJ' },
  { label: 'INTJ', value: 'INTJ' },
  { label: 'ISFJ', value: 'ISFJ' },
  { label: 'INFJ', value: 'INFJ' },
  { label: 'ISTP', value: 'ISTP' },
  { label: 'INTP', value: 'INTP' },
  { label: 'ISFP', value: 'ISFP' },
  { label: 'INFP', value: 'INFP' }
]

const belbinRoles = ref({
  implementador: 'Indiferente',
  coordinador: 'Indiferente',
  cerebro: 'Indiferente',
  investigador: 'Indiferente',
  monitor: 'Indiferente',
  cohesionador: 'Indiferente',
  impulsor: 'Indiferente',
  finalizador: 'Indiferente',
  especialista: 'Indiferente'
})

const belbinOptions = [
  { label: 'Preferido', value: 'Preferido' },
  { label: 'Evitado', value: 'Evitado' },
  { label: 'Indiferente', value: 'Indiferente' }
]

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
const selectedConflicts = ref([])

const dialogTitle = computed(() => {
  return props.mode === 'create' ? 'Crear Persona' : 'Editar Persona'
})

const loadOptions = async () => {
  try {
    const [counties, races, groups, nacionalities, religions, competences, levels, roles, projects, conflicts, persons] = await Promise.all([
      countyService.getAll(),
      raceService.getAll(),
      personGroupService.getAll(),
      nacionalityService.getAll(),
      religionService.getAll(),
      competenceService.getAll(),
      levelsService.getAll(),
      roleService.getAll(),
      projectService.getAll(),
      conflictIndexService.getAll(),
      personService.getAll()
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
    personOptions.value = persons.map(p => ({ label: `${p.personName} ${p.surName}`, value: p.id }))
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
  
  // Validar si la competencia ya existe
  const exists = competenceValues.value.some(cv => cv.competenceId === selectedCompetence.value)
  if (exists) {
    toast.add({
      severity: 'warn',
      summary: 'Competencia duplicada',
      detail: 'Esta competencia ya ha sido agregada',
      life: 3000
    })
    return
  }
  
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

const removeCompetences = () => {
  competenceValues.value = competenceValues.value.filter(c => !selectedCompetences.value.includes(c))
  selectedCompetences.value = []
}

const addRoleInterest = () => {
  if (!selectedRole.value) return
  
  // Validar si el rol ya existe
  const exists = personalInterests.value.some(pi => pi.roleId === selectedRole.value)
  if (exists) {
    toast.add({
      severity: 'warn',
      summary: 'Interés duplicado',
      detail: 'Este rol ya ha sido agregado',
      life: 3000
    })
    return
  }
  
  const roleName = roleOptions.value.find(r => r.value === selectedRole.value)?.label
  
  personalInterests.value.push({
    roleId: selectedRole.value,
    roleName,
    preference: rolePreference.value
  })
  
  selectedRole.value = null
  rolePreference.value = true
}

const removeRoleInterests = () => {
  personalInterests.value = personalInterests.value.filter(r => !selectedRoleInterests.value.includes(r))
  selectedRoleInterests.value = []
}

const addProjectInterest = () => {
  if (!selectedProject.value) return
  
  // Validar si el proyecto ya existe
  const exists = personalProjectInterests.value.some(ppi => ppi.projectId === selectedProject.value)
  if (exists) {
    toast.add({
      severity: 'warn',
      summary: 'Interés duplicado',
      detail: 'Este proyecto ya ha sido agregado',
      life: 3000
    })
    return
  }
  
  const projectName = projectOptions.value.find(p => p.value === selectedProject.value)?.label
  
  personalProjectInterests.value.push({
    projectId: selectedProject.value,
    projectName,
    preference: projectPreference.value
  })
  
  selectedProject.value = null
  projectPreference.value = true
}

const removeProjectInterests = () => {
  personalProjectInterests.value = personalProjectInterests.value.filter(p => !selectedProjectInterests.value.includes(p))
  selectedProjectInterests.value = []
}

const addConflict = () => {
  if (!selectedConflictIndex.value || !selectedConflictPerson.value) return
  
  // Validar si la persona ya existe (sin importar el índice de conflicto)
  const exists = personConflicts.value.some(pc => pc.personConflictId === selectedConflictPerson.value)
  if (exists) {
    toast.add({
      severity: 'warn',
      summary: 'Persona duplicada',
      detail: 'Esta persona ya ha sido agregada a las incompatibilidades',
      life: 3000
    })
    return
  }
  
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

const removeConflicts = () => {
  personConflicts.value = personConflicts.value.filter(c => !selectedConflicts.value.includes(c))
  selectedConflicts.value = []
}

const generateTest = () => {
  toast.add({
    severity: 'info',
    summary: 'Plataforma no disponible',
    detail: 'La plataforma TestSoft no está disponible por el momento',
    life: 4000
  })
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
    
    mbtiType.value = props.initialData.mbtiType || ''
    belbinRoles.value = props.initialData.belbinRoles || {
      implementador: 'Indiferente',
      coordinador: 'Indiferente',
      cerebro: 'Indiferente',
      investigador: 'Indiferente',
      monitor: 'Indiferente',
      cohesionador: 'Indiferente',
      impulsor: 'Indiferente',
      finalizador: 'Indiferente',
      especialista: 'Indiferente'
    }
    
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
    mbtiType.value = ''
    belbinRoles.value = {
      implementador: 'Indiferente',
      coordinador: 'Indiferente',
      cerebro: 'Indiferente',
      investigador: 'Indiferente',
      monitor: 'Indiferente',
      cohesionador: 'Indiferente',
      impulsor: 'Indiferente',
      finalizador: 'Indiferente',
      especialista: 'Indiferente'
    }
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
    inDate: inDate.value ? inDate.value.toISOString().split('T')[0] : null,
    workload: workload.value,
    experience: experience.value,
    status: status.value,
    birthDate: birthDate.value ? birthDate.value.toISOString().split('T')[0] : null,
    county: selectedCounty.value,
    race: selectedRace.value,
    group: selectedGroup.value,
    nacionality: selectedNacionality.value,
    religion: selectedReligion.value,
    personTest: {
      tipoMB: mbtiType.value || '',
      e_S: belbinRoles.value.implementador.charAt(0),
      i_D: belbinRoles.value.coordinador.charAt(0),
      c_O: belbinRoles.value.cerebro.charAt(0),
      i_S: belbinRoles.value.investigador.charAt(0),
      c_E: belbinRoles.value.monitor.charAt(0),
      i_R: belbinRoles.value.cohesionador.charAt(0),
      m_E: belbinRoles.value.impulsor.charAt(0),
      c_H: belbinRoles.value.finalizador.charAt(0),
      i_F: belbinRoles.value.especialista.charAt(0)
    }
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
      :style="{ width: '90vw', height: '90vh'}"
      @update:visible="$emit('update:visible', $event)"
  >
    <template #header>
      <h3 class="text-xs font-bold">{{ dialogTitle }}</h3>
    </template>

    <div class="form-container">
      <Tabs value="0">
        <TabList>
          <Tab value="0">Datos Básicos</Tab>
          <Tab value="1">Competencias</Tab>
          <Tab value="2">Intereses</Tab>
          <Tab value="3">Test Psicológico</Tab>
          <Tab value="4">Incompatibilidades</Tab>
        </TabList>
        <TabPanels>
        <!-- Tab 1: Datos Básicos -->
        <TabPanel value="0">
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
              <Select v-model="sex" :options="sexOptions" filter optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Fecha de Nacimiento</label>
              <DatePicker v-model="birthDate" dateFormat="dd/mm/yy" showIcon class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Fecha de Ingreso</label>
              <DatePicker v-model="inDate" dateFormat="dd/mm/yy" showIcon class="w-full" />
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
              <Select v-model="status" :options="statusOptions" filter optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Provincia</label>
              <Select v-model="selectedCounty" :options="countyOptions" filter optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Raza</label>
              <Select v-model="selectedRace" :options="raceOptions" filter optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Grupo</label>
              <Select v-model="selectedGroup" :options="groupOptions" filter optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Nacionalidad</label>
              <Select v-model="selectedNacionality" :options="nacionalityOptions" filter optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Religión</label>
              <Select v-model="selectedReligion" :options="religionOptions" filter optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" />
            </div>
          </div>
        </TabPanel>

        <!-- Tab 2: Competencias -->
        <TabPanel value="1">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Competencia</label>
              <Select v-model="selectedCompetence" :options="competenceOptions" filter optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Nivel</label>
              <Select v-model="selectedLevel" :options="levelOptions" filter optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" />
            </div>
          </div>
          <DataTable v-model:selection="selectedCompetences" :value="competenceValues" selectionMode="multiple" dataKey="competenceId" class="p-datatable-sm">
            <template #header>
              <div class="flex justify-between items-center gap-2">
                <span class="font-semibold">Competencias Asignadas</span>
                <div class="flex gap-2">
                  <Button label="Agregar" icon="pi pi-plus" severity="success" size="small" @click="addCompetence" :disabled="!selectedCompetence || !selectedLevel" />
                  <Button label="Eliminar Seleccionados" icon="pi pi-trash" severity="danger" size="small" @click="removeCompetences" :disabled="selectedCompetences.length === 0" />
                </div>
              </div>
            </template>
            <Column selectionMode="multiple" headerStyle="width: 3rem" style="width: 3rem" />
            <Column field="competenceName" header="Competencia" />
            <Column field="levelName" header="Nivel" />
          </DataTable>
        </TabPanel>

        <!-- Tab 3: Intereses -->
        <TabPanel value="2">
          <h4 class="text-sm font-semibold mb-2">Intereses en Roles</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Rol</label>
              <Select v-model="selectedRole" :options="roleOptions" filter optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" />
            </div>
            <div class="field flex items-center">
              <label for="rolePreference" class="cursor-pointer flex items-center">
                <Checkbox v-model="rolePreference" :binary="true" inputId="rolePreference" />
                <span class="ml-2">Preferencia</span>
              </label>
            </div>
          </div>
          <DataTable v-model:selection="selectedRoleInterests" :value="personalInterests" selectionMode="multiple" dataKey="roleId" class="p-datatable-sm mb-4">
            <template #header>
              <div class="flex justify-between items-center gap-2">
                <span class="font-semibold">Intereses en Roles Asignados</span>
                <div class="flex gap-2">
                  <Button label="Agregar" icon="pi pi-plus" severity="success" size="small" @click="addRoleInterest" :disabled="!selectedRole" />
                  <Button label="Eliminar Seleccionados" icon="pi pi-trash" severity="danger" size="small" @click="removeRoleInterests" :disabled="selectedRoleInterests.length === 0" />
                </div>
              </div>
            </template>
            <Column selectionMode="multiple" headerStyle="width: 3rem" style="width: 3rem" />
            <Column field="roleName" header="Rol" />
            <Column field="preference" header="Preferencia">
              <template #body="slotProps">
                <Checkbox :modelValue="slotProps.data.preference" :binary="true" disabled />
              </template>
            </Column>
          </DataTable>

          <h4 class="text-sm font-semibold mb-2">Intereses en Proyectos</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Proyecto</label>
              <Select v-model="selectedProject" :options="projectOptions" filter optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" />
            </div>
            <div class="field flex items-center">
              <label for="projectPreference" class="cursor-pointer flex items-center">
                <Checkbox v-model="projectPreference" :binary="true" inputId="projectPreference" />
                <span class="ml-2">Preferencia</span>
              </label>
            </div>
          </div>
          <DataTable v-model:selection="selectedProjectInterests" :value="personalProjectInterests" selectionMode="multiple" dataKey="projectId" class="p-datatable-sm">
            <template #header>
              <div class="flex justify-between items-center gap-2">
                <span class="font-semibold">Intereses en Proyectos Asignados</span>
                <div class="flex gap-2">
                  <Button label="Agregar" icon="pi pi-plus" severity="success" size="small" @click="addProjectInterest" :disabled="!selectedProject" />
                  <Button label="Eliminar Seleccionados" icon="pi pi-trash" severity="danger" size="small" @click="removeProjectInterests" :disabled="selectedProjectInterests.length === 0" />
                </div>
              </div>
            </template>
            <Column selectionMode="multiple" headerStyle="width: 3rem" style="width: 3rem" />
            <Column field="projectName" header="Proyecto" />
            <Column field="preference" header="Preferencia">
              <template #body="slotProps">
                <Checkbox :modelValue="slotProps.data.preference" :binary="true" disabled />
              </template>
            </Column>
          </DataTable>
        </TabPanel>

        <!-- Tab 4: Test Psicológico -->
        <TabPanel value="3">
          <div class="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-blue-900 mb-1">Tests Psicológicos</p>
                <p class="text-xs text-blue-700">Genere los tests MBTI y Belbin mediante la plataforma TestSoft</p>
              </div>
              <Button label="Generar Tests" icon="pi pi-cog" @click="generateTest" severity="info" />
            </div>
          </div>

          <h4 class="text-sm font-semibold mb-2">Tipo MBTI</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Tipo MBTI</label>
              <Select v-model="mbtiType" :options="mbtiOptions" filter optionLabel="label" optionValue="value" placeholder="Seleccione tipo MBTI" class="w-full" />
            </div>
          </div>

          <h4 class="text-sm font-semibold mb-2 mt-4">Roles de Belbin</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Implementador</label>
              <Select v-model="belbinRoles.implementador" :options="belbinOptions" filter optionLabel="label" optionValue="value" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Coordinador</label>
              <Select v-model="belbinRoles.coordinador" :options="belbinOptions" filter optionLabel="label" optionValue="value" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Cerebro</label>
              <Select v-model="belbinRoles.cerebro" :options="belbinOptions" filter optionLabel="label" optionValue="value" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Investigador</label>
              <Select v-model="belbinRoles.investigador" :options="belbinOptions" filter optionLabel="label" optionValue="value" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Monitor</label>
              <Select v-model="belbinRoles.monitor" :options="belbinOptions" filter optionLabel="label" optionValue="value" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Cohesionador</label>
              <Select v-model="belbinRoles.cohesionador" :options="belbinOptions" filter optionLabel="label" optionValue="value" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Impulsor</label>
              <Select v-model="belbinRoles.impulsor" :options="belbinOptions" filter optionLabel="label" optionValue="value" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Finalizador</label>
              <Select v-model="belbinRoles.finalizador" :options="belbinOptions" filter optionLabel="label" optionValue="value" class="w-full" />
            </div>
            <div class="field">
              <label class="block mb-1 text-xs font-semibold">Especialista</label>
              <Select v-model="belbinRoles.especialista" :options="belbinOptions" filter optionLabel="label" optionValue="value" class="w-full" />
            </div>
          </div>
        </TabPanel>

        <!-- Tab 5: Incompatibilidades -->
        <TabPanel value="4">
          <div class="incompatibilidades-container">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <div class="field">
                <label class="block mb-1 text-xs font-semibold">Índice de Conflicto</label>
                <Select v-model="selectedConflictIndex" :options="conflictIndexOptions" filter optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" />
              </div>
              <div class="field">
                <label class="block mb-1 text-xs font-semibold">Persona en Conflicto</label>
                <Select v-model="selectedConflictPerson" :options="personOptions" filter optionLabel="label" optionValue="value" placeholder="Seleccione" class="w-full" />
              </div>
            </div>
            <DataTable 
              v-model:selection="selectedConflicts" 
              :value="personConflicts" 
              selectionMode="multiple" 
              dataKey="conflictIndexId" 
              class="p-datatable-sm"
              scrollable
              scrollHeight="400px"
            >
              <template #header>
                <div class="flex justify-between items-center gap-2">
                  <span class="font-semibold">Incompatibilidades Asignadas</span>
                  <div class="flex gap-2">
                    <Button label="Agregar" icon="pi pi-plus" severity="success" size="small" @click="addConflict" :disabled="!selectedConflictIndex || !selectedConflictPerson" />
                    <Button label="Eliminar Seleccionados" icon="pi pi-trash" severity="danger" size="small" @click="removeConflicts" :disabled="selectedConflicts.length === 0" />
                  </div>
                </div>
              </template>
              <Column selectionMode="multiple" headerStyle="width: 3rem" style="width: 3rem" />
              <Column field="conflictName" header="Índice de Conflicto" />
              <Column field="personConflictName" header="Persona" />
            </DataTable>
          </div>
        </TabPanel>
        </TabPanels>
      </Tabs>
    </div>

    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" @click="handleCancel" class="p-button-text" />
      <Button label="Guardar" icon="pi pi-check" @click="handleSave" />
    </template>
  </Dialog>
</template>


<style scoped>
:deep(.p-dialog-header) {
  padding: 0.75rem 1rem !important;
}

.form-container {
  padding: 0.5rem 0;
  height: calc(90vh - 140px);
  overflow: hidden;
}

.field {
  margin-bottom: 0.25rem;
}

:deep(.p-tabs) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.p-tablist-tab-list .p-tab.p-tab-active) {
  background-color: white !important;
}

:deep(.p-tabpanels) {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
}

:deep(.p-tabpanel) {
  height: auto;
  overflow: visible;
}

:deep(.p-inputtext),
:deep(.p-select),
:deep(.p-datepicker),
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
