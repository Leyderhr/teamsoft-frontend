<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import Panel from 'primevue/panel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'
import InputText from 'primevue/inputtext'
import { FilterMatchMode } from '@primevue/core/api'

import projectService from '@/features/projects/services/projectService.js'

const toast   = useToast()
const confirm = useConfirm()

const projects      = ref([])
const loading       = ref(false)
const selectedProject = ref(null)
const filters       = ref({
  global:      { value: null, matchMode: FilterMatchMode.CONTAINS },
  projectName: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
})

// ===========================
// Carga de datos
// ===========================
const loadProjects = async () => {
  loading.value = true
  try {
    const data = await projectService.getAll()
    projects.value = data
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los proyectos', life: 3000 })
  } finally {
    loading.value = false
  }
}

// ===========================
// Estado / helpers
// ===========================
const canClose = computed(() =>
  selectedProject.value \!== null && \!selectedProject.value.close
)

const projectStatusSeverity = (project) => {
  if (project.close)    return 'danger'
  if (project.finalize) return 'warning'
  return 'success'
}

const projectStatusLabel = (project) => {
  if (project.close)    return 'Cerrado'
  if (project.finalize) return 'Finalizado'
  return 'Activo'
}

// ===========================
// Cerrar proyecto
// ===========================
const confirmClose = () => {
  if (\!selectedProject.value) return

  confirm.require({
    message:  `¿Está seguro de que desea cerrar el proyecto "${selectedProject.value.projectName}"? Esta acción cambiará su estado a Cerrado.`,
    header:   'Confirmar cierre de proyecto',
    icon:     'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, cerrar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await projectService.close(selectedProject.value.id)
        toast.add({
          severity: 'success',
          summary:  'Proyecto cerrado',
          detail:   `"${selectedProject.value.projectName}" ha sido cerrado correctamente`,
          life:     4000
        })
        selectedProject.value = null
        await loadProjects()
      } catch (e) {
        toast.add({
          severity: 'error',
          summary:  'Error al cerrar',
          detail:   e?.message || 'No se pudo cerrar el proyecto',
          life:     4000
        })
      }
    }
  })
}

onMounted(() => {
  loadProjects()
})
</script>

<template>
  <div class="p-4 pl-15">
    <h1 class="titulo text-black text-left">Cerrar Proyecto</h1>

    <ConfirmDialog/>

    <Panel>
      <template #header>
        <div class="flex align-items-center gap-2 w-full">
          <i class="pi pi-list text-blue-600"/>
          <span class="font-semibold text-lg">Lista de Proyectos</span>
          <div class="ml-auto">
            <InputText
                v-model="filters['global'].value"
                placeholder="Buscar proyecto..."
                class="search-input"
            />
          </div>
        </div>
      </template>

      <DataTable
          :value="projects"
          v-model:selection="selectedProject"
          selectionMode="single"
          :loading="loading"
          v-model:filters="filters"
          filterDisplay="row"
          :globalFilterFields="['projectName', 'client.entityName', 'county.countyName']"
          dataKey="id"
          paginator
          :rows="10"
          :rowsPerPageOptions="[10, 20, 30, 50]"
          stripedRows
          rowHover
          scrollable
          scrollHeight="calc(100vh - 420px)"
          class="projects-table"
      >
        <Column field="id" header="ID" :style="{ width: '70px' }" sortable/>

        <Column field="projectName" header="Nombre del Proyecto" sortable filter filterPlaceholder="Buscar...">
          <template #body="{ data }">
            <span class="font-semibold">{{ data.projectName }}</span>
          </template>
        </Column>

        <Column field="client.entityName" header="Cliente" sortable>
          <template #body="{ data }">
            {{ data.client?.entityName || '—' }}
          </template>
        </Column>

        <Column field="county.countyName" header="Provincia" sortable>
          <template #body="{ data }">
            {{ data.county?.countyName || '—' }}
          </template>
        </Column>

        <Column field="initialDate" header="Fecha Inicio" sortable>
          <template #body="{ data }">
            {{ data.initialDate ? new Date(data.initialDate).toLocaleDateString('es-ES') : '—' }}
          </template>
        </Column>

        <Column field="close" header="Estado" :style="{ width: '120px' }" sortable>
          <template #body="{ data }">
            <Tag
                :value="projectStatusLabel(data)"
                :severity="projectStatusSeverity(data)"
            />
          </template>
        </Column>

        <!-- Footer con acciones -->
        <template #footer>
          <div class="flex align-items-center gap-3">
            <Button
                label="Cerrar Proyecto"
                icon="pi pi-lock"
                severity="danger"
                :disabled="!canClose"
                @click="confirmClose"
            />
            <Button
                label="Actualizar"
                icon="pi pi-refresh"
                class="p-button-secondary"
                @click="loadProjects"
                :loading="loading"
            />
            <span v-if="selectedProject" class="selected-info">
              <i class="pi pi-info-circle mr-1"/>
              Proyecto seleccionado:
              <strong>{{ selectedProject.projectName }}</strong>
              <span v-if="selectedProject.close" class="text-red-500 ml-2">(ya está cerrado)</span>
            </span>
          </div>
        </template>
      </DataTable>
    </Panel>
  </div>
</template>

<style scoped>
.titulo {
  font-size: 2.5rem;
  margin: 20px 0;
  font-family: Arial, "Arial CE", "Lucida Grande CE", lucida, "Helvetica CE", sans-serif;
}

.search-input {
  width: 260px;
}

.projects-table {
  width: 100%;
}

.selected-info {
  font-size: 0.9rem;
  color: #555;
}

/* Helpers */
.flex              { display: flex; }
.align-items-center { align-items: center; }
.gap-2             { gap: 0.5rem; }
.gap-3             { gap: 0.75rem; }
.w-full            { width: 100%; }
.ml-auto           { margin-left: auto; }
.mr-1              { margin-right: 0.25rem; }
.ml-2              { margin-left: 0.5rem; }
.font-semibold     { font-weight: 600; }
.text-lg           { font-size: 1.125rem; }
.text-red-500      { color: #ef4444; }
.text-blue-600     { color: #2563eb; }
</style>
