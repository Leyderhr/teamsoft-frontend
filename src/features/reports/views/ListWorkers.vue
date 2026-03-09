<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Panel from 'primevue/panel'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import InputNumber from 'primevue/inputnumber'
import Tag from 'primevue/tag'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import { FilterMatchMode } from '@primevue/core/api'
import reportService from '@/features/reports/services/reportService.js'
import roleService from '@/features/roles/services/roleService.js'
import projectService from '@/features/projects/services/projectService.js'
import competenceService from '@/features/competences/services/competenceService.js'
import levelsService from '@/features/nomenclatives/services/levelsService.js'

const toast = useToast()
const loading = ref(false)
const loadingFilters = ref(false)
const activeFilterTab = ref('0')

// Datos de filtros disponibles
const roleOptions = ref([])
const projectOptions = ref([])
const competenceOptions = ref([])
const levelOptions = ref([])

// Selecciones de filtro
const selectedRoles = ref([])
const selectedProjects = ref([])
const selectedCompetence = ref(null)
const selectedLevel = ref(null)
const selectedMbtiTypes = ref([])
const minAge = ref(null)
const maxAge = ref(null)

// Belbin selections (Favorito / Evitado / Indiferente)
const belbinOptions = [
    { label: 'Favorito', value: 'F' },
    { label: 'Evitado', value: 'E' },
    { label: 'Indiferente', value: 'I' }
]
const belbin = ref({ ES: null, ID: null, CO: null, IS: null, CE: null, IR: null, ME: null, CH: null, IF: null })

// Competencias seleccionadas para el filtro
const filterCompetences = ref([])

// MBTI options
const mbtiOptions = [
    { label: 'ESTJ', value: 'ESTJ' }, { label: 'ENTJ', value: 'ENTJ' },
    { label: 'ESFJ', value: 'ESFJ' }, { label: 'ENFJ', value: 'ENFJ' },
    { label: 'ESTP', value: 'ESTP' }, { label: 'ENTP', value: 'ENTP' },
    { label: 'ESFP', value: 'ESFP' }, { label: 'ENFP', value: 'ENFP' },
    { label: 'ISTJ', value: 'ISTJ' }, { label: 'INTJ', value: 'INTJ' },
    { label: 'ISFJ', value: 'ISFJ' }, { label: 'INFJ', value: 'INFJ' },
    { label: 'ISTP', value: 'ISTP' }, { label: 'INTP', value: 'INTP' },
    { label: 'ISFP', value: 'ISFP' }, { label: 'INFP', value: 'INFP' }
]

// Resultados
const workers = ref([])
const searched = ref(false)

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const belbinRoleLabels = [
    { key: 'ES', label: 'Especialista (ES)' },
    { key: 'ID', label: 'Implementador (ID)' },
    { key: 'CO', label: 'Coordinador (CO)' },
    { key: 'IS', label: 'Cohesionador (IS)' },
    { key: 'CE', label: 'Cerebro (CE)' },
    { key: 'IR', label: 'Investigador Rec. (IR)' },
    { key: 'ME', label: 'Monitor Evaluador (ME)' },
    { key: 'CH', label: 'Impulsor (CH)' },
    { key: 'IF', label: 'Finalizador (IF)' }
]

const loadFilterOptions = async () => {
    loadingFilters.value = true
    try {
        const [roles, projects, competences, levels] = await Promise.allSettled([
            roleService.getAll(),
            projectService.getAll(),
            competenceService.getAll(),
            levelsService.getAll()
        ])
        if (roles.status === 'fulfilled') roleOptions.value = roles.value
        if (projects.status === 'fulfilled') projectOptions.value = projects.value
        if (competences.status === 'fulfilled') competenceOptions.value = competences.value
        if (levels.status === 'fulfilled') levelOptions.value = levels.value
    } catch (error) {
        console.error('Error cargando opciones de filtro:', error)
    } finally {
        loadingFilters.value = false
    }
}

const addCompetenceFilter = () => {
    if (!selectedCompetence.value) return
    const comp = competenceOptions.value.find(c => c.id === selectedCompetence.value)
    const level = levelOptions.value.find(l => l.id === selectedLevel.value)
    if (!comp) return
    filterCompetences.value.push({ competenceId: selectedCompetence.value, levelId: selectedLevel.value, label: `${comp.competitionName}${level ? ' - ' + level.significance : ''}` })
    selectedCompetence.value = null
    selectedLevel.value = null
}

const removeCompetence = (index) => {
    filterCompetences.value.splice(index, 1)
}

const handleSearch = async () => {
    loading.value = true
    searched.value = true
    try {
        const filters_payload = {
            roleIds: selectedRoles.value.map(r => r.id || r),
            projectIds: selectedProjects.value.map(p => p.id || p),
            competences: filterCompetences.value.map(c => ({ competenceId: c.competenceId, levelId: c.levelId })),
            mbtiTypes: selectedMbtiTypes.value,
            belbin: Object.fromEntries(Object.entries(belbin.value).filter(([, v]) => v !== null)),
            minAge: minAge.value,
            maxAge: maxAge.value
        }
        workers.value = await reportService.getFilteredWorkers(filters_payload)
    } catch (error) {
        console.error('Error filtrando trabajadores:', error)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo realizar la búsqueda', life: 3000 })
        workers.value = []
    } finally {
        loading.value = false
    }
}

const handleReset = () => {
    selectedRoles.value = []
    selectedProjects.value = []
    filterCompetences.value = []
    selectedMbtiTypes.value = []
    belbin.value = { ES: null, ID: null, CO: null, IS: null, CE: null, IR: null, ME: null, CH: null, IF: null }
    minAge.value = null
    maxAge.value = null
    workers.value = []
    searched.value = false
}

onMounted(loadFilterOptions)
</script>

<template>
  <div class="p-4 pl-15">
    <h1 class="titulo text-black font-bold">Listar Personas</h1>

    <!-- Panel de Filtros -->
    <Panel class="mb-4" toggleable>
      <template #header>
        <span class="font-semibold">Filtros de búsqueda</span>
      </template>

      <Tabs v-model:value="activeFilterTab">
        <TabList>
          <Tab value="0">Roles</Tab>
          <Tab value="1">Proyectos</Tab>
          <Tab value="2">Competencias</Tab>
          <Tab value="3">MBTI</Tab>
          <Tab value="4">Belbin</Tab>
        </TabList>

        <TabPanels>
          <!-- Tab Roles -->
          <TabPanel value="0">
            <div class="flex flex-col gap-3 pt-3">
              <label class="text-sm font-semibold">Intereses en Roles</label>
              <MultiSelect
                v-model="selectedRoles"
                :options="roleOptions"
                optionLabel="roleName"
                placeholder="Seleccione roles de interés"
                filter
                class="w-full max-w-lg"
              />
              <div v-if="selectedRoles.length" class="flex flex-wrap gap-2">
                <Tag v-for="r in selectedRoles" :key="r.id" :value="r.roleName" severity="info" />
              </div>
            </div>
          </TabPanel>

          <!-- Tab Proyectos -->
          <TabPanel value="1">
            <div class="flex flex-col gap-3 pt-3">
              <label class="text-sm font-semibold">Intereses en Proyectos</label>
              <MultiSelect
                v-model="selectedProjects"
                :options="projectOptions"
                optionLabel="projectName"
                placeholder="Seleccione proyectos de interés"
                filter
                class="w-full max-w-lg"
              />
              <div v-if="selectedProjects.length" class="flex flex-wrap gap-2">
                <Tag v-for="p in selectedProjects" :key="p.id" :value="p.projectName" severity="info" />
              </div>
            </div>
          </TabPanel>

          <!-- Tab Competencias -->
          <TabPanel value="2">
            <div class="flex flex-col gap-3 pt-3">
              <label class="text-sm font-semibold">Competencias Generales</label>
              <div class="flex gap-2 flex-wrap">
                <Select
                  v-model="selectedCompetence"
                  :options="competenceOptions"
                  optionLabel="competitionName"
                  optionValue="id"
                  placeholder="Competencia"
                  class="w-56"
                />
                <Select
                  v-model="selectedLevel"
                  :options="levelOptions"
                  optionLabel="significance"
                  optionValue="id"
                  placeholder="Nivel (opcional)"
                  class="w-48"
                />
                <Button label="Agregar" icon="pi pi-plus" size="small" @click="addCompetenceFilter" />
              </div>
              <DataTable v-if="filterCompetences.length" :value="filterCompetences" class="p-datatable-sm">
                <Column field="label" header="Competencia - Nivel" />
                <Column header="" style="width:60px">
                  <template #body="{ index }">
                    <Button icon="pi pi-trash" text severity="danger" size="small" @click="removeCompetence(index)" />
                  </template>
                </Column>
              </DataTable>
            </div>
          </TabPanel>

          <!-- Tab MBTI -->
          <TabPanel value="3">
            <div class="flex flex-col gap-3 pt-3">
              <label class="text-sm font-semibold">Tipos MBTI</label>
              <MultiSelect
                v-model="selectedMbtiTypes"
                :options="mbtiOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccione tipos MBTI"
                class="w-full max-w-lg"
              />
              <div v-if="selectedMbtiTypes.length" class="flex flex-wrap gap-2">
                <Tag v-for="m in selectedMbtiTypes" :key="m" :value="m" severity="secondary" />
              </div>
            </div>
          </TabPanel>

          <!-- Tab Belbin -->
          <TabPanel value="4">
            <div class="grid grid-cols-3 gap-4 pt-3">
              <div v-for="role in belbinRoleLabels" :key="role.key" class="flex flex-col gap-1">
                <label class="text-sm font-semibold">{{ role.label }}</label>
                <Select
                  v-model="belbin[role.key]"
                  :options="belbinOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Indiferente"
                  class="w-full"
                />
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <!-- Filtro de edad -->
      <div class="flex gap-4 items-center mt-4 pt-4 border-t border-[var(--ts-border)]">
        <label class="text-sm font-semibold">Rango de edad:</label>
        <InputNumber v-model="minAge" placeholder="Edad mínima" :min="0" :max="100" class="w-36" />
        <span class="text-[var(--ts-text-muted)]">—</span>
        <InputNumber v-model="maxAge" placeholder="Edad máxima" :min="0" :max="100" class="w-36" />
      </div>

      <!-- Botones de acción -->
      <div class="flex justify-end gap-2 mt-4">
        <Button label="Limpiar" icon="pi pi-refresh" severity="secondary" outlined @click="handleReset" />
        <Button label="Buscar" icon="pi pi-search" :loading="loading" @click="handleSearch" />
      </div>
    </Panel>

    <!-- Resultados -->
    <div v-if="searched">
      <h3 class="font-semibold text-lg mb-3 text-[var(--ts-text-primary)]">
        Resultados: {{ workers.length }} persona(s) encontrada(s)
      </h3>
      <DataTable
        :value="workers"
        v-model:filters="filters"
        :globalFilterFields="['personName', 'surName', 'card']"
        :loading="loading"
        paginator
        :rows="10"
        :rowsPerPageOptions="[10, 20, 30, 50]"
        scrollable
        scrollHeight="500px"
        class="p-datatable-sm"
        emptyMessage="No se encontraron personas con los filtros especificados"
        currentPageReportTemplate="{first} a {last} de {totalRecords}"
        paginatorTemplate="CurrentPageReport FirstPageLink PreviousPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      >
        <Column field="card" header="Carné" :style="{ minWidth: '120px' }" />
        <Column field="personName" header="Nombre" sortable :style="{ minWidth: '140px' }" />
        <Column field="surName" header="Apellidos" sortable :style="{ minWidth: '140px' }" />
        <Column field="sex" header="Sexo" :style="{ minWidth: '80px' }" />
        <Column field="age" header="Edad" :style="{ minWidth: '80px' }" />
        <Column field="ageGroupFk.ageGroupName" header="Grupo de Edad" :style="{ minWidth: '130px' }" />
        <Column field="nacionalityFk.gentilicioNac" header="Nacionalidad" :style="{ minWidth: '130px' }" />
        <Column field="religionfk.religionName" header="Religión" :style="{ minWidth: '120px' }" />
        <Column field="racefk.raceName" header="Raza" :style="{ minWidth: '110px' }" />
        <Column field="groupFk.name" header="Grupo" :style="{ minWidth: '120px' }" />
        <Column field="workerTest.tipoMB" header="MBTI" :style="{ minWidth: '90px' }" />
      </DataTable>
    </div>
  </div>
</template>

<style scoped>
.titulo {
  font-size: 2.5rem;
  margin: 20px 0;
  font-family: Arial, "Arial CE", "Lucida Grande CE", lucida, "Helvetica CE", sans-serif;
}
</style>
