<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import { FilterMatchMode } from '@primevue/core/api'
import auditService from '@/features/audit/services/auditService.js'

const toast = useToast()
const loading = ref(false)
const activeTab = ref('0')

// Datos por categoría
const generalActions = ref([])
const closeActions = ref([])
const cancelActions = ref([])
const ioActions = ref([])

// Filtros para tabla general
const filtersGeneral = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    user: { value: null, matchMode: FilterMatchMode.CONTAINS },
    action: { value: null, matchMode: FilterMatchMode.CONTAINS },
    ip: { value: null, matchMode: FilterMatchMode.CONTAINS },
    affectedTable: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const filtersIO = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    user: { value: null, matchMode: FilterMatchMode.CONTAINS },
    action: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const globalFilterGeneral = ref('')
const globalFilterIO = ref('')

// Mapeo de colores para acciones
const actionSeverity = (action) => {
    const map = {
        'CREATE': 'success',
        'UPDATE': 'info',
        'DELETE': 'danger',
        'CREATE/UPDATE': 'info',
        'CERRAR': 'warn',
        'DETENER': 'warn',
        'REANUDAR': 'success',
        'CANCELAR': 'danger',
        'IMPORTAR': 'secondary',
        'EXPORTAR': 'secondary'
    }
    return map[action] || 'secondary'
}

const loadAllData = async () => {
    loading.value = true
    try {
        const [general, close, cancel, io] = await Promise.allSettled([
            auditService.getGeneralActions(),
            auditService.getCloseActions(),
            auditService.getCancelActions(),
            auditService.getIOActions()
        ])
        if (general.status === 'fulfilled') generalActions.value = general.value || []
        if (close.status === 'fulfilled') closeActions.value = close.value || []
        if (cancel.status === 'fulfilled') cancelActions.value = cancel.value || []
        if (io.status === 'fulfilled') ioActions.value = io.value || []
    } catch (error) {
        console.error('Error cargando trazas:', error)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las trazas del sistema', life: 3000 })
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    loadAllData()
})
</script>

<template>
  <div class="p-4 pl-15">
    <div class="flex items-center justify-between mb-4">
      <h1 class="titulo text-black font-bold">Auditar Sistema</h1>
      <Button
        label="Actualizar"
        icon="pi pi-refresh"
        severity="secondary"
        outlined
        :loading="loading"
        @click="loadAllData"
      />
    </div>

    <Tabs v-model:value="activeTab">
      <TabList>
        <Tab value="0">Acciones Generales</Tab>
        <Tab value="1">Cierres / Pauses</Tab>
        <Tab value="2">Cancelaciones</Tab>
        <Tab value="3">Importación / Exportación</Tab>
      </TabList>

      <TabPanels>
        <!-- TAB 1: Acciones Generales -->
        <TabPanel value="0">
          <div class="flex justify-end mb-3">
            <InputText
              v-model="filtersGeneral['global'].value"
              placeholder="Buscar..."
              class="w-64"
            />
          </div>
          <DataTable
            :value="generalActions"
            :loading="loading"
            v-model:filters="filtersGeneral"
            filterDisplay="menu"
            :globalFilterFields="['user', 'action', 'ip', 'affectedTable']"
            paginator
            :rows="10"
            :rowsPerPageOptions="[10, 20, 30, 50]"
            sortField="date"
            :sortOrder="-1"
            removableSort
            class="p-datatable-sm"
            emptyMessage="No hay registros de auditoría"
            currentPageReportTemplate="{first} a {last} de {totalRecords}"
            paginatorTemplate="CurrentPageReport FirstPageLink PreviousPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          >
            <Column field="user" header="Usuario" sortable :style="{ minWidth: '130px' }" />
            <Column field="action" header="Acción Realizada" sortable :style="{ minWidth: '160px' }">
              <template #body="{ data }">
                <Tag :value="data.action" :severity="actionSeverity(data.action)" />
              </template>
            </Column>
            <Column field="date" header="Fecha" sortable :style="{ minWidth: '180px' }" />
            <Column field="ip" header="IP (v4)" :style="{ minWidth: '130px' }" />
            <Column field="affectedTable" header="Tabla Afectada" sortable :style="{ minWidth: '160px' }" />
          </DataTable>
        </TabPanel>

        <!-- TAB 2: Cierres / Detenidos / Reanudados -->
        <TabPanel value="1">
          <DataTable
            :value="closeActions"
            :loading="loading"
            paginator
            :rows="10"
            :rowsPerPageOptions="[10, 20, 30, 50]"
            sortField="date"
            :sortOrder="-1"
            removableSort
            class="p-datatable-sm"
            emptyMessage="No hay registros"
            currentPageReportTemplate="{first} a {last} de {totalRecords}"
            paginatorTemplate="CurrentPageReport FirstPageLink PreviousPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          >
            <Column field="user" header="Usuario" sortable :style="{ minWidth: '130px' }" />
            <Column field="action" header="Acción Realizada" sortable :style="{ minWidth: '150px' }">
              <template #body="{ data }">
                <Tag :value="data.action" :severity="actionSeverity(data.action)" />
              </template>
            </Column>
            <Column field="date" header="Fecha" sortable :style="{ minWidth: '180px' }" />
            <Column field="ip" header="IP (v4)" :style="{ minWidth: '130px' }" />
            <Column field="affectedRowId" header="ID Fila Afectada" :style="{ minWidth: '150px' }" />
          </DataTable>
        </TabPanel>

        <!-- TAB 3: Cancelaciones -->
        <TabPanel value="2">
          <DataTable
            :value="cancelActions"
            :loading="loading"
            paginator
            :rows="10"
            :rowsPerPageOptions="[10, 20, 30, 50]"
            sortField="date"
            :sortOrder="-1"
            removableSort
            class="p-datatable-sm"
            emptyMessage="No hay registros"
            currentPageReportTemplate="{first} a {last} de {totalRecords}"
            paginatorTemplate="CurrentPageReport FirstPageLink PreviousPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          >
            <Column field="user" header="Usuario" sortable :style="{ minWidth: '130px' }" />
            <Column field="action" header="Acción Realizada" sortable :style="{ minWidth: '150px' }">
              <template #body="{ data }">
                <Tag :value="data.action" :severity="actionSeverity(data.action)" />
              </template>
            </Column>
            <Column field="date" header="Fecha" sortable :style="{ minWidth: '180px' }" />
            <Column field="ip" header="IP (v4)" :style="{ minWidth: '130px' }" />
            <Column field="affectedTable" header="Tabla Afectada" :style="{ minWidth: '160px' }" />
            <Column field="affectedRowId" header="ID Fila Afectada" :style="{ minWidth: '150px' }" />
          </DataTable>
        </TabPanel>

        <!-- TAB 4: Importación / Exportación -->
        <TabPanel value="3">
          <div class="flex justify-end mb-3">
            <InputText
              v-model="filtersIO['global'].value"
              placeholder="Buscar..."
              class="w-64"
            />
          </div>
          <DataTable
            :value="ioActions"
            :loading="loading"
            v-model:filters="filtersIO"
            filterDisplay="menu"
            :globalFilterFields="['user', 'action', 'comment']"
            paginator
            :rows="10"
            :rowsPerPageOptions="[10, 20, 30, 50]"
            sortField="date"
            :sortOrder="-1"
            removableSort
            class="p-datatable-sm"
            emptyMessage="No hay registros"
            currentPageReportTemplate="{first} a {last} de {totalRecords}"
            paginatorTemplate="CurrentPageReport FirstPageLink PreviousPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          >
            <Column field="user" header="Usuario" sortable :style="{ minWidth: '130px' }" />
            <Column field="action" header="Acción" sortable :style="{ minWidth: '130px' }">
              <template #body="{ data }">
                <Tag :value="data.action" :severity="actionSeverity(data.action)" />
              </template>
            </Column>
            <Column field="date" header="Fecha" sortable :style="{ minWidth: '180px' }" />
            <Column field="hasErrors" header="Errores" :style="{ minWidth: '100px' }">
              <template #body="{ data }">
                <Tag :value="data.hasErrors ? 'SÍ' : 'NO'" :severity="data.hasErrors ? 'danger' : 'success'" />
              </template>
            </Column>
            <Column field="ip" header="IP (v4)" :style="{ minWidth: '130px' }" />
            <Column field="comment" header="Comentario" :style="{ minWidth: '200px' }" />
          </DataTable>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<style scoped>
.titulo {
  font-size: 2.5rem;
  margin: 20px 0;
  font-family: Arial, "Arial CE", "Lucida Grande CE", lucida, "Helvetica CE", sans-serif;
}
</style>
