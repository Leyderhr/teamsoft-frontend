<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Panel from 'primevue/panel'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import Tag from 'primevue/tag'
import Divider from 'primevue/divider'
import ProgressSpinner from 'primevue/progressspinner'
import experimentService from '@/features/experiments/services/experimentService.js'
import projectService from '@/features/projects/services/projectService.js'
import competenceService from '@/features/competences/services/competenceService.js'
import levelsService from '@/features/nomenclatives/services/levelsService.js'
import roleEvaluationService from '@/features/nomenclatives/services/roleEvaluationService.js'
import conflictIndexService from '@/features/nomenclatives/services/conflictIndexService.js'

const toast = useToast()

// =====================
// Wizard step
// =====================
const currentStep = ref(1)

// =====================
// STEP 1: Select project
// =====================
const projects = ref([])
const loadingProjects = ref(false)
const selectedProject = ref(null)

// =====================
// STEP 2: Select member
// =====================
const members = ref([])
const loadingMembers = ref(false)
const selectedMember = ref(null)

// =====================
// STEP 3: Evaluate member
// =====================
const activeEvalTab = ref('0')
const loadingEval = ref(false)

// Competences
const competenceOptions = ref([])
const levelOptions = ref([])
const selectedGenCompetence = ref(null)
const selectedGenLevel = ref(null)
const genCompetences = ref([])    // Selected generic competences

const selectedTechCompetence = ref(null)
const selectedTechLevel = ref(null)
const techCompetences = ref([])   // Selected technical competences

// Role evaluation
const roleEvalOptions = ref([])
const memberRoles = ref([])   // [{ roleName, roleEvalId }]

// Compatibility
const conflictIndexOptions = ref([])
const otherMembers = ref([])  // [{ personName, surName, conflictIndexId }]

const saving = ref(false)

// =====================
// Computed
// =====================
const stepTitle = computed(() => {
    if (currentStep.value === 1) return 'Seleccionar Proyecto'
    if (currentStep.value === 2) return 'Seleccionar Miembro'
    return `Evaluando: ${selectedMember.value?.personName || ''} ${selectedMember.value?.surName || ''}`
})

// =====================
// Load data
// =====================
const loadProjects = async () => {
    loadingProjects.value = true
    try {
        const data = await projectService.getAll()
        projects.value = data.filter(p => p.finalize && !p.close)
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los proyectos', life: 3000 })
    } finally {
        loadingProjects.value = false
    }
}

const loadMembers = async () => {
    loadingMembers.value = true
    try {
        members.value = await experimentService.getMembersToEvaluate(selectedProject.value.id)
    } catch {
        members.value = []
        toast.add({ severity: 'warn', summary: 'Aviso', detail: 'No se pudieron cargar los miembros', life: 3000 })
    } finally {
        loadingMembers.value = false
    }
}

const loadEvaluationData = async () => {
    loadingEval.value = true
    try {
        const [competences, levels, roleEvals, conflictIndexes] = await Promise.allSettled([
            competenceService.getAll(),
            levelsService.getAll(),
            roleEvaluationService.getAll(),
            conflictIndexService.getAll()
        ])
        if (competences.status === 'fulfilled') competenceOptions.value = competences.value
        if (levels.status === 'fulfilled') levelOptions.value = levels.value
        if (roleEvals.status === 'fulfilled') roleEvalOptions.value = roleEvals.value
        if (conflictIndexes.status === 'fulfilled') conflictIndexOptions.value = conflictIndexes.value

        // Init roles for member (from their assigned roles)
        memberRoles.value = selectedMember.value?.assignedRoles?.map(r => ({
            roleName: r.rolesFk?.roleName || r.roleName,
            roleId: r.id,
            roleEvalId: null
        })) || []

        // Other members (excluding current)
        otherMembers.value = members.value
            .filter(m => m.id !== selectedMember.value.id)
            .map(m => ({ memberId: m.id, personName: m.personName, surName: m.surName, conflictIndexId: null }))
    } catch (err) {
        console.error('Error loading evaluation data:', err)
    } finally {
        loadingEval.value = false
    }
}

// =====================
// Competence handlers
// =====================
const addGenCompetence = () => {
    if (!selectedGenCompetence.value) return
    const comp = competenceOptions.value.find(c => c.id === selectedGenCompetence.value && !c.technical)
    const level = levelOptions.value.find(l => l.id === selectedGenLevel.value)
    if (!comp) return
    if (genCompetences.value.some(g => g.competenceId === selectedGenCompetence.value)) {
        toast.add({ severity: 'warn', summary: 'Aviso', detail: 'Esta competencia ya fue agregada', life: 2000 })
        return
    }
    genCompetences.value.push({
        competenceId: comp.id,
        competenceName: comp.competitionName,
        levelId: selectedGenLevel.value,
        levelName: level?.significance || '-'
    })
    selectedGenCompetence.value = null
    selectedGenLevel.value = null
}

const addTechCompetence = () => {
    if (!selectedTechCompetence.value) return
    const comp = competenceOptions.value.find(c => c.id === selectedTechCompetence.value && c.technical)
    const level = levelOptions.value.find(l => l.id === selectedTechLevel.value)
    if (!comp) return
    if (techCompetences.value.some(g => g.competenceId === selectedTechCompetence.value)) {
        toast.add({ severity: 'warn', summary: 'Aviso', detail: 'Esta competencia ya fue agregada', life: 2000 })
        return
    }
    techCompetences.value.push({
        competenceId: comp.id,
        competenceName: comp.competitionName,
        levelId: selectedTechLevel.value,
        levelName: level?.significance || '-'
    })
    selectedTechCompetence.value = null
    selectedTechLevel.value = null
}

// =====================
// Navigation
// =====================
const goToStep2 = async () => {
    if (!selectedProject.value) return
    await loadMembers()
    currentStep.value = 2
}

const goToStep3 = async () => {
    if (!selectedMember.value) return
    await loadEvaluationData()
    currentStep.value = 3
}

const handleSaveEvaluation = async () => {
    saving.value = true
    try {
        await experimentService.saveMemberEvaluation(
            selectedProject.value.id,
            selectedMember.value.id,
            {
                genCompetences: genCompetences.value,
                techCompetences: techCompetences.value,
                roleEvaluations: memberRoles.value,
                compatibilityLevels: otherMembers.value
            }
        )
        toast.add({ severity: 'success', summary: 'Guardado', detail: 'Evaluación guardada correctamente', life: 3000 })
        // Mark member as evaluated
        const member = members.value.find(m => m.id === selectedMember.value.id)
        if (member) member.evaluated = true
        // Go back to member list
        currentStep.value = 2
        selectedMember.value = null
        genCompetences.value = []
        techCompetences.value = []
    } catch (error) {
        console.error('Error saving evaluation:', error)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la evaluación', life: 3000 })
    } finally {
        saving.value = false
    }
}

const handleFinalizeProject = async () => {
    try {
        await experimentService.finalizeProjectEvaluation(selectedProject.value.id)
        toast.add({ severity: 'success', summary: 'Proyecto finalizado', detail: 'El proyecto ha sido cerrado correctamente', life: 4000 })
        currentStep.value = 1
        selectedProject.value = null
        members.value = []
        await loadProjects()
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo finalizar el proyecto', life: 3000 })
    }
}

const allEvaluated = computed(() => members.value.length > 0 && members.value.every(m => m.evaluated))

onMounted(loadProjects)
</script>

<template>
  <div class="p-4 pl-15">
    <div class="flex items-center gap-3 mb-4">
      <Button v-if="currentStep > 1" icon="pi pi-arrow-left" text @click="currentStep--" />
      <h1 class="titulo text-black font-bold my-0">Evaluación de Miembros</h1>
    </div>

    <!-- Breadcrumb steps -->
    <div class="flex items-center gap-2 mb-5 text-sm text-[var(--ts-text-muted)]">
      <span :class="{ 'text-[var(--ts-primary)] font-semibold': currentStep >= 1 }">Proyecto</span>
      <i class="pi pi-chevron-right text-xs"></i>
      <span :class="{ 'text-[var(--ts-primary)] font-semibold': currentStep >= 2 }">Miembros</span>
      <i class="pi pi-chevron-right text-xs"></i>
      <span :class="{ 'text-[var(--ts-primary)] font-semibold': currentStep >= 3 }">Evaluación</span>
    </div>

    <!-- ========= STEP 1: Select project ========= -->
    <div v-if="currentStep === 1">
      <Panel header="Seleccionar Proyecto a Evaluar">
        <DataTable
          :value="projects"
          v-model:selection="selectedProject"
          selectionMode="single"
          :loading="loadingProjects"
          paginator :rows="10"
          class="p-datatable-sm"
          emptyMessage="No hay proyectos pendientes de evaluación"
        >
          <Column selectionMode="single" headerStyle="width: 3rem" />
          <Column field="projectName" header="Proyecto" sortable />
          <Column field="clientFk.entityName" header="Cliente" />
          <Column field="beginDate" header="Fecha Inicio" sortable />
          <Column field="endDate" header="Fecha Fin" sortable />
          <Column header="Estado">
            <template #body="{ data }">
              <Tag :value="data.finalize ? 'Finalizado' : 'Activo'" :severity="data.finalize ? 'warn' : 'success'" />
            </template>
          </Column>
        </DataTable>
        <div class="flex justify-end mt-4">
          <Button label="Seleccionar" icon="pi pi-arrow-right" iconPos="right"
            :disabled="!selectedProject" @click="goToStep2" />
        </div>
      </Panel>
    </div>

    <!-- ========= STEP 2: Select member ========= -->
    <div v-else-if="currentStep === 2">
      <Panel :header="`Miembros del Proyecto: ${selectedProject.projectName}`">
        <div v-if="loadingMembers" class="flex justify-center p-4">
          <ProgressSpinner style="width:40px;height:40px" />
        </div>
        <DataTable v-else
          :value="members"
          v-model:selection="selectedMember"
          selectionMode="single"
          paginator :rows="10"
          class="p-datatable-sm"
          emptyMessage="No hay miembros asignados a este proyecto"
        >
          <Column selectionMode="single" headerStyle="width: 3rem" />
          <Column field="personName" header="Nombre" sortable />
          <Column field="surName" header="Apellidos" sortable />
          <Column header="Evaluado">
            <template #body="{ data }">
              <Tag :value="data.evaluated ? 'Sí' : 'No'" :severity="data.evaluated ? 'success' : 'secondary'" />
            </template>
          </Column>
        </DataTable>
        <div class="flex justify-between mt-4">
          <Button
            label="Finalizar Proyecto"
            icon="pi pi-flag-fill"
            severity="warn"
            :disabled="!allEvaluated"
            @click="handleFinalizeProject"
          />
          <Button
            label="Evaluar Miembro"
            icon="pi pi-star"
            :disabled="!selectedMember"
            @click="goToStep3"
          />
        </div>
      </Panel>
    </div>

    <!-- ========= STEP 3: Evaluate member ========= -->
    <div v-else-if="currentStep === 3">
      <div v-if="loadingEval" class="flex justify-center p-8">
        <ProgressSpinner />
      </div>

      <div v-else>
        <Panel class="mb-4">
          <template #header>
            <span class="font-semibold text-[var(--ts-primary)]">
              Evaluando: {{ selectedMember.personName }} {{ selectedMember.surName }}
            </span>
          </template>
        </Panel>

        <Tabs v-model:value="activeEvalTab">
          <TabList>
            <Tab value="0">Competencias Genéricas</Tab>
            <Tab value="1">Competencias Técnicas</Tab>
            <Tab value="2">Evaluación en Roles</Tab>
            <Tab value="3">Nivel de Compatibilidad</Tab>
          </TabList>

          <TabPanels>
            <!-- Tab: Competencias Genéricas -->
            <TabPanel value="0">
              <div class="flex flex-col gap-4 pt-3">
                <div class="flex gap-3 items-end flex-wrap">
                  <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold">Competencia Genérica</label>
                    <Select
                      v-model="selectedGenCompetence"
                      :options="competenceOptions.filter(c => !c.technical)"
                      optionLabel="competitionName"
                      optionValue="id"
                      placeholder="Seleccione competencia"
                      filter
                      class="w-64"
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold">Nivel</label>
                    <Select
                      v-model="selectedGenLevel"
                      :options="levelOptions"
                      optionLabel="significance"
                      optionValue="id"
                      placeholder="Nivel"
                      class="w-48"
                    />
                  </div>
                  <Button label="Agregar" icon="pi pi-plus" @click="addGenCompetence" />
                </div>
                <DataTable :value="genCompetences" class="p-datatable-sm" emptyMessage="Sin competencias agregadas">
                  <Column field="competenceName" header="Competencia" />
                  <Column field="levelName" header="Nivel" />
                  <Column header="" style="width:60px">
                    <template #body="{ index }">
                      <Button icon="pi pi-trash" text severity="danger" size="small"
                        @click="genCompetences.splice(index, 1)" />
                    </template>
                  </Column>
                </DataTable>
              </div>
            </TabPanel>

            <!-- Tab: Competencias Técnicas -->
            <TabPanel value="1">
              <div class="flex flex-col gap-4 pt-3">
                <div class="flex gap-3 items-end flex-wrap">
                  <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold">Competencia Técnica</label>
                    <Select
                      v-model="selectedTechCompetence"
                      :options="competenceOptions.filter(c => c.technical)"
                      optionLabel="competitionName"
                      optionValue="id"
                      placeholder="Seleccione competencia"
                      filter
                      class="w-64"
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold">Nivel</label>
                    <Select
                      v-model="selectedTechLevel"
                      :options="levelOptions"
                      optionLabel="significance"
                      optionValue="id"
                      placeholder="Nivel"
                      class="w-48"
                    />
                  </div>
                  <Button label="Agregar" icon="pi pi-plus" @click="addTechCompetence" />
                </div>
                <DataTable :value="techCompetences" class="p-datatable-sm" emptyMessage="Sin competencias técnicas">
                  <Column field="competenceName" header="Competencia Técnica" />
                  <Column field="levelName" header="Nivel" />
                  <Column header="" style="width:60px">
                    <template #body="{ index }">
                      <Button icon="pi pi-trash" text severity="danger" size="small"
                        @click="techCompetences.splice(index, 1)" />
                    </template>
                  </Column>
                </DataTable>
              </div>
            </TabPanel>

            <!-- Tab: Evaluación en Roles -->
            <TabPanel value="2">
              <div class="pt-3">
                <DataTable :value="memberRoles" class="p-datatable-sm"
                  emptyMessage="Sin roles asignados">
                  <Column field="roleName" header="Rol" />
                  <Column header="Evaluación del Rol">
                    <template #body="{ data }">
                      <Select
                        v-model="data.roleEvalId"
                        :options="roleEvalOptions"
                        optionLabel="significance"
                        optionValue="id"
                        placeholder="Seleccione evaluación"
                        class="w-full"
                      />
                    </template>
                  </Column>
                </DataTable>
              </div>
            </TabPanel>

            <!-- Tab: Nivel de Compatibilidad -->
            <TabPanel value="3">
              <div class="pt-3">
                <DataTable :value="otherMembers" class="p-datatable-sm"
                  emptyMessage="Sin otros miembros en el equipo">
                  <Column header="Miembro">
                    <template #body="{ data }">{{ data.personName }} {{ data.surName }}</template>
                  </Column>
                  <Column header="Índice de Compatibilidad">
                    <template #body="{ data }">
                      <Select
                        v-model="data.conflictIndexId"
                        :options="conflictIndexOptions"
                        optionLabel="description"
                        optionValue="id"
                        placeholder="Seleccione nivel"
                        class="w-full"
                      />
                    </template>
                  </Column>
                </DataTable>
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>

        <Divider />
        <div class="flex justify-end gap-2">
          <Button label="Cancelar" severity="secondary" outlined @click="currentStep = 2" />
          <Button label="Guardar Evaluación" icon="pi pi-save" :loading="saving" @click="handleSaveEvaluation" />
        </div>
      </div>
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
