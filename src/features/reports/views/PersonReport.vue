<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Panel from 'primevue/panel'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import { FilterMatchMode } from '@primevue/core/api'
import reportService from '@/features/reports/services/reportService.js'

const toast = useToast()
const loading = ref(false)
const loadingDetail = ref(false)
const workers = ref([])
const selectedWorker = ref(null)
const workerProjects = ref([])
const selectedProject = ref(null)
const rolesInProject = ref([])
const showDetail = ref(false)

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const loadWorkers = async () => {
    loading.value = true
    try {
        const data = await reportService.getPersonReport()
        workers.value = data
    } catch (error) {
        console.error('Error cargando reporte de personas:', error)
        // Fallback: use person API
        try {
            const { default: personService } = await import('@/features/persons/services/personService.js')
            workers.value = await personService.getAll()
        } catch (e) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el reporte de personas', life: 3000 })
        }
    } finally {
        loading.value = false
    }
}

const handleWorkerSelect = async (event) => {
    selectedWorker.value = event.data
    selectedProject.value = null
    rolesInProject.value = []
    showDetail.value = true
    loadingDetail.value = true
    try {
        workerProjects.value = await reportService.getPersonProjects(event.data.id)
    } catch (error) {
        workerProjects.value = []
    } finally {
        loadingDetail.value = false
    }
}

const handleProjectSelect = async (event) => {
    selectedProject.value = event.data
    loadingDetail.value = true
    try {
        rolesInProject.value = await reportService.getPersonRolesInProject(selectedWorker.value.id, event.data.id)
    } catch (error) {
        rolesInProject.value = []
    } finally {
        loadingDetail.value = false
    }
}

const goBack = () => {
    showDetail.value = false
    selectedWorker.value = null
    workerProjects.value = []
    rolesInProject.value = []
    selectedProject.value = null
}

onMounted(loadWorkers)
</script>

<template>
  <div class="p-4 pl-15">
    <div class="flex items-center gap-3 mb-4">
      <Button v-if="showDetail" icon="pi pi-arrow-left" text @click="goBack" />
      <h1 class="titulo text-black font-bold my-0">Reporte de Personas</h1>
    </div>

    <!-- Vista principal: lista de trabajadores -->
    <div v-if="!showDetail">
      <div class="flex justify-end mb-3">
        <InputText v-model="filters['global'].value" placeholder="Buscar trabajador..." class="w-72" />
      </div>
      <DataTable
        :value="workers"
        v-model:selection="selectedWorker"
        selectionMode="single"
        :loading="loading"
        v-model:filters="filters"
        :globalFilterFields="['personName', 'surName', 'card', 'email', 'status']"
        paginator
        :rows="10"
        :rowsPerPageOptions="[10, 20, 30, 50]"
        scrollable
        scrollHeight="500px"
        class="p-datatable-sm"
        emptyMessage="No hay datos disponibles"
        currentPageReportTemplate="{first} a {last} de {totalRecords}"
        paginatorTemplate="CurrentPageReport FirstPageLink PreviousPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        @rowSelect="handleWorkerSelect"
      >
        <Column field="personName" header="Nombre" sortable :style="{ minWidth: '150px' }" />
        <Column field="surName" header="Apellidos" sortable :style="{ minWidth: '150px' }" />
        <Column field="card" header="Carné" :style="{ minWidth: '130px' }" />
        <Column field="address" header="Dirección" :style="{ minWidth: '160px' }" />
        <Column field="phone" header="Teléfono" :style="{ minWidth: '120px' }" />
        <Column field="email" header="Correo" :style="{ minWidth: '180px' }" />
        <Column field="sex" header="Sexo" :style="{ minWidth: '80px' }" />
        <Column field="inDate" header="Fecha Entrada" :style="{ minWidth: '130px' }" />
        <Column field="workload" header="Carga" :style="{ minWidth: '90px' }" />
        <Column field="experience" header="Experiencia" :style="{ minWidth: '110px' }" />
        <Column field="status" header="Estado" :style="{ minWidth: '100px' }">
          <template #body="{ data }">
            <Tag :value="data.status" :severity="data.status === 'Activo' ? 'success' : 'secondary'" />
          </template>
        </Column>
        <Column field="countyFk.countyName" header="Provincia" :style="{ minWidth: '130px' }" />
        <Column field="groupFk.name" header="Grupo" :style="{ minWidth: '130px' }" />
        <Column field="raceFk.raceName" header="Raza" :style="{ minWidth: '120px' }" />
        <Column field="nacionalityFk.gentilicioNac" header="Nacionalidad" :style="{ minWidth: '130px' }" />
      </DataTable>
    </div>

    <!-- Vista detalle: proyectos y roles del trabajador seleccionado -->
    <div v-else>
      <!-- Info del trabajador -->
      <Panel class="mb-4">
        <template #header>
          <span class="font-semibold text-[var(--ts-primary)]">
            {{ selectedWorker.personName }} {{ selectedWorker.surName }}
          </span>
        </template>
        <div class="grid grid-cols-3 gap-3 text-sm">
          <div><span class="font-semibold">Carné:</span> {{ selectedWorker.card }}</div>
          <div><span class="font-semibold">Correo:</span> {{ selectedWorker.email }}</div>
          <div><span class="font-semibold">Estado:</span> {{ selectedWorker.status }}</div>
        </div>
      </Panel>

      <div class="grid grid-cols-2 gap-4">
        <!-- Proyectos del trabajador -->
        <div>
          <h3 class="font-semibold text-lg mb-2 text-[var(--ts-text-primary)]">Proyectos</h3>
          <DataTable
            :value="workerProjects"
            v-model:selection="selectedProject"
            selectionMode="single"
            :loading="loadingDetail"
            class="p-datatable-sm"
            emptyMessage="Sin proyectos asignados"
            @rowSelect="handleProjectSelect"
          >
            <Column field="projectName" header="Nombre del Proyecto" />
            <Column field="evaluation" header="Evaluación del Proyecto" />
          </DataTable>
        </div>

        <!-- Roles en el proyecto seleccionado -->
        <div>
          <h3 class="font-semibold text-lg mb-2 text-[var(--ts-text-primary)]">
            Roles en {{ selectedProject?.projectName || 'proyecto seleccionado' }}
          </h3>
          <DataTable
            :value="rolesInProject"
            :loading="loadingDetail"
            class="p-datatable-sm"
            emptyMessage="Seleccione un proyecto"
          >
            <Column field="workerName" header="Trabajador" />
            <Column field="roleName" header="Rol" />
            <Column field="roleEvaluation" header="Evaluación del Rol" />
          </DataTable>
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
