<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Panel from 'primevue/panel'
import Tag from 'primevue/tag'
import reportService from '@/features/reports/services/reportService.js'

const toast = useToast()
const loading = ref(false)
const loadingTeam = ref(false)

// Step 1: lista de proyectos finalizados
const finishedProjects = ref([])
const selectedProject = ref(null)
const showReport = ref(false)

// Step 2: reporte del equipo
const teamMembers = ref([])

const loadFinishedProjects = async () => {
    loading.value = true
    try {
        finishedProjects.value = await reportService.getFinishedProjects()
    } catch (error) {
        console.error('Error cargando proyectos finalizados:', error)
        // Fallback: load all projects and filter by status
        try {
            const { default: projectService } = await import('@/features/projects/services/projectService.js')
            const all = await projectService.getAll()
            finishedProjects.value = all.filter(p => p.finalize === true || p.status === 'Finalizado' || p.status === 'Cerrado')
        } catch (e) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los proyectos finalizados', life: 3000 })
        }
    } finally {
        loading.value = false
    }
}

const handleProjectSelect = async (event) => {
    selectedProject.value = event.data
}

const handleSeeReport = async () => {
    if (!selectedProject.value) {
        toast.add({ severity: 'warn', summary: 'Aviso', detail: 'Seleccione un proyecto para ver el reporte', life: 3000 })
        return
    }
    showReport.value = true
    loadingTeam.value = true
    try {
        teamMembers.value = await reportService.getFinishedTeamByProject(selectedProject.value.id)
    } catch (error) {
        console.error('Error cargando equipo:', error)
        teamMembers.value = []
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el equipo del proyecto', life: 3000 })
    } finally {
        loadingTeam.value = false
    }
}

const goBack = () => {
    showReport.value = false
    teamMembers.value = []
}

onMounted(loadFinishedProjects)
</script>

<template>
  <div class="p-4 pl-15">
    <div class="flex items-center gap-3 mb-4">
      <Button v-if="showReport" icon="pi pi-arrow-left" text @click="goBack" />
      <h1 class="titulo text-black font-bold my-0">
        {{ showReport ? 'Equipo del Proyecto' : 'Equipos Finalizados' }}
      </h1>
    </div>

    <!-- Step 1: selección de proyecto finalizado -->
    <div v-if="!showReport">
      <DataTable
        :value="finishedProjects"
        v-model:selection="selectedProject"
        selectionMode="single"
        :loading="loading"
        paginator
        :rows="10"
        :rowsPerPageOptions="[10, 20, 30, 50]"
        class="p-datatable-sm"
        emptyMessage="No hay proyectos finalizados"
        currentPageReportTemplate="{first} a {last} de {totalRecords}"
        paginatorTemplate="CurrentPageReport FirstPageLink PreviousPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        @rowSelect="handleProjectSelect"
      >
        <Column selectionMode="single" headerStyle="width: 3rem" />
        <Column field="projectName" header="Nombre del Proyecto" sortable />
        <Column field="beginDate" header="Fecha Inicio" sortable :style="{ minWidth: '130px' }" />
        <Column field="endDate" header="Fecha Fin" sortable :style="{ minWidth: '130px' }" />
        <Column field="status" header="Estado" :style="{ minWidth: '110px' }">
          <template #body="{ data }">
            <Tag :value="data.status || 'Finalizado'" severity="secondary" />
          </template>
        </Column>
      </DataTable>

      <div class="flex justify-end mt-4">
        <Button
          label="Ver Reporte"
          icon="pi pi-chart-bar"
          :disabled="!selectedProject"
          @click="handleSeeReport"
        />
      </div>
    </div>

    <!-- Step 2: reporte del equipo -->
    <div v-else>
      <!-- Cabecera del proyecto -->
      <Panel class="mb-4">
        <template #header>
          <div class="flex items-center gap-3">
            <span class="font-semibold text-[var(--ts-primary)]">{{ selectedProject.projectName }}</span>
            <Tag value="Finalizado" severity="secondary" />
          </div>
        </template>
        <div class="grid grid-cols-3 gap-3 text-sm">
          <div><span class="font-semibold">Fecha inicio:</span> {{ selectedProject.beginDate }}</div>
          <div><span class="font-semibold">Fecha fin:</span> {{ selectedProject.endDate }}</div>
          <div v-if="selectedProject.clientFk">
            <span class="font-semibold">Cliente:</span> {{ selectedProject.clientFk?.entityName }}
          </div>
        </div>
      </Panel>

      <!-- Tabla de miembros del equipo -->
      <DataTable
        :value="teamMembers"
        :loading="loadingTeam"
        paginator
        :rows="10"
        :rowsPerPageOptions="[10, 20, 30, 50]"
        class="p-datatable-sm"
        emptyMessage="No hay miembros del equipo registrados"
        currentPageReportTemplate="{first} a {last} de {totalRecords}"
        paginatorTemplate="CurrentPageReport FirstPageLink PreviousPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      >
        <Column field="workersFk.personName" header="Nombre" sortable :style="{ minWidth: '150px' }">
          <template #body="{ data }">
            {{ data.workersFk?.personName }} {{ data.workersFk?.surName }}
          </template>
        </Column>
        <Column field="rolesFk.roleName" header="Rol" sortable :style="{ minWidth: '150px' }" />
        <Column field="rolEvalFk.significance" header="Evaluación del Rol" :style="{ minWidth: '180px' }" />
        <Column field="status" header="Estado" :style="{ minWidth: '100px' }">
          <template #body="{ data }">
            <Tag v-if="data.status" :value="data.status" severity="info" />
          </template>
        </Column>
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
