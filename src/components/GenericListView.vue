<script setup>
import {ref, computed, watch} from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Panel from 'primevue/panel'
import ConfirmDialog from 'primevue/confirmdialog'
import {useConfirm} from 'primevue/useconfirm'
import {useToast} from 'primevue/usetoast'
import InputText from 'primevue/inputtext';
import {FilterMatchMode} from '@primevue/core/api'

const confirm = useConfirm()
const toast = useToast()

const props = defineProps({
  // Datos principales
  items: {
    type: Array,
    required: true,
    default: () => []
  },
  selectedItem: {
    type: Object,
    default: null
  },

  // Configuración de columnas
  columns: {
    type: Array,
    required: true,
    // Estructura esperada: [{ field: 'name', header: 'Nombre', width: '150px', filterable: true }]
  },

  // Configuración de tabla
  title: {
    type: String,
    required: true
  },
  rowsPerPageOptions: {
    type: Array,
    default: () => [10, 20, 30, 40, 50]
  },
  defaultRows: {
    type: Number,
    default: 10
  },

  // Estados
  loading: {
    type: Boolean,
    default: false
  },

  // Handlers de eventos
  onRowSelect: {
    type: Function,
    default: null
  },
  onRowUnselect: {
    type: Function,
    default: null
  },
  onCreateClick: {
    type: Function,
    required: true
  },
  onEditClick: {
    type: Function,
    required: true
  },
  onDeleteConfirm: {
    type: Function,
    required: true
  }
})

// Estado para filtros dinámicos
const filters = ref({})

// Inicializar filtros basado en las columnas
const initializeFilters = () => {
  const newFilters = {
    global: {value: null, matchMode: FilterMatchMode.CONTAINS}
  }

  props.columns.forEach(col => {
    if (col.filterable !== false) {
      newFilters[col.field] = {value: null, matchMode: FilterMatchMode.STARTS_WITH}
    }
  })

  filters.value = newFilters
}

const globalFilterFields = computed(() => {
  return props.columns
      .filter(col => col.filterable !== false)
      .map(col => col.field)
})

// Llamar inicialización cuando cambien las columnas
watch(() => props.columns, initializeFilters, {immediate: true})


const emit = defineEmits(['update:selectedItem'])

// Estado local para la selección
const localSelected = ref(props.selectedItem)

// Watchers para sincronizar cambios
const handleRowSelect = (event) => {
  localSelected.value = event.data
  emit('update:selectedItem', event.data)
  if (props.onRowSelect) {
    props.onRowSelect(event.data)
  }
}

const handleRowUnselect = () => {
  localSelected.value = null
  emit('update:selectedItem', null)
  if (props.onRowUnselect) {
    props.onRowUnselect()
  }
}

// Manejo de crear
const handleCreate = () => {
  try {
    if (typeof props.onCreateClick === 'function') {
      props.onCreateClick()
    } else {
      console.warn('onCreateClick no es una función')
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Error al crear',
      life: 3000
    })
  }
}

// Manejo de editar
const handleEdit = () => {
  if (!localSelected.value) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Selecciona un elemento para editar',
      life: 3000
    })
    return
  }
  try {
    if (typeof props.onEditClick === 'function') {
      props.onEditClick(localSelected.value)
    } else {
      console.warn('onEditClick no es una función')
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Error al editar',
      life: 3000
    })
  }
}

// Manejo de eliminar con confirmación
const handleDelete = () => {
  if (!localSelected.value) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Selecciona un elemento para eliminar',
      life: 3000
    })
    return
  }

  confirm.require({
    message: '¿Está seguro de que desea eliminar este elemento?',
    header: 'Confirmación',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        if (typeof props.onDeleteConfirm === 'function') {
          await props.onDeleteConfirm(localSelected.value)
        } else {
          console.warn('onDeleteConfirm no es una función')
          return
        }
        localSelected.value = null
        emit('update:selectedItem', null)
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Elemento eliminado correctamente',
          life: 3000
        })
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Error al eliminar',
          life: 3000
        })
      }
    },
    reject: () => {
      // Usuario canceló la eliminación
    }
  })
}

// Computed para validar si hay item seleccionado
const hasSelection = computed(() => !!localSelected.value)

// Función helper para obtener valor anidado (para campos como countyFk.countyName)
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, prop) => current?.[prop], obj)
}

const tableMinWidth = computed(() => {
  const totalWidth = props.columns.reduce((acc, col) => {
    // Extraer el valor numérico del width (ej: "150px" → 150)
    const widthValue = parseInt(col.width) || 150
    return acc + widthValue
  }, 0)

  // Añadir un margen para filtros/botones (aprox 50px por columna filtrable)
  const filterMargin = props.columns.filter(col => col.filterable !== false).length * 50

  return `${totalWidth + filterMargin}px`
})
</script>

<template>
  <div class="generic-list-view">
    <ConfirmDialog/>

    <Panel :header="title" class="mb-4 panel-with-horizontal-scroll">
      <!-- DataTable -->
      <DataTable
          resizableColumns
          responsiveLayout="scroll"
          scrollable
          scrollHeight="calc(100vh - 370px)"
          :value="items"
          :selection="localSelected"
          selectionMode="single"
          @rowSelect="handleRowSelect"
          @rowUnselect="handleRowUnselect"
          :paginator="false"
          :rows="defaultRows"
          v-model:filters="filters"
          filterDisplay="row"
          :globalFilterFields="globalFilterFields"
          :loading="loading"
          stripedRows
          class="datatable-scroll-x"
      >
        <!-- Columnas dinámicas -->
        <Column
            v-for="col in columns"
            :key="col.field"
            :field="col.field"
            :header="col.header"
            :style="{ minWidth: col.width || '150px', width: col.width || '150px' }"
            :sortable="col.sortable !== false"
            :filter="col.filterable !== false"
            :filterPlaceholder="`Buscar por ${col.header}...`"
        >
          <template #body="slotProps">
            <!-- Soporte para campos anidados (ej: countyFk.countyName) -->
            <span>{{ getNestedValue(slotProps.data, col.field) }}</span>
          </template>

          <template #filter="{ filterModel, filterCallback }" v-if="col.filterable !== false">
            <InputText
                v-model="filterModel.value"
                type="text"
                @input="filterCallback()"
                :placeholder="`Buscar por ${col.header}...`"
            />
          </template>
        </Column>

        <!-- Footer con botones CRUD -->
        <template #footer>
          <div class="flex gap-2">
            <!-- Botón Crear -->
            <Button
                icon="pi pi-plus"
                label="Crear"
                @click="handleCreate"
                class="p-button-success"
            />

            <!-- Botón Editar -->
            <Button
                icon="pi pi-pencil"
                label="Editar"
                @click="handleEdit"
                class="p-button-warning"
                :disabled="!hasSelection"
            />

            <!-- Botón Eliminar -->
            <Button
                icon="pi pi-trash"
                label="Eliminar"
                @click="handleDelete"
                class="p-button-danger"
                :disabled="!hasSelection"
            />
          </div>
        </template>
      </DataTable>
    </Panel>
  </div>
</template>

<style scoped>
.panel-with-horizontal-scroll :deep(.p-panel-content-wrapper) {
  overflow-x: auto !important;
  overflow-y: hidden;
}

.datatable-scroll-x :deep(.p-datatable-table){
  min-width: max-content;
}
.generic-list-view {
  width: 100%;
  max-width: calc(100vw - 350px);
}

.flex {
  display: flex;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
