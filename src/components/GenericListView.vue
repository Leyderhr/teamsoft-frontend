<script setup>
import {ref, computed, onMounted} from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Panel from 'primevue/panel'
import ConfirmDialog from 'primevue/confirmdialog'
import {useConfirm} from 'primevue/useconfirm'
import {useToast} from 'primevue/usetoast'

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
</script>

<template>
  <div class="generic-list-view">
    <ConfirmDialog/>

    <Panel :header="title" class="mb-4">
      <!-- DataTable -->
      <DataTable resizableColumns columnResizeMode="fit"
                 scrollable scrollHeight="flex"
                 :value="items"
                 :selection="localSelected"
                 selectionMode="single"
                 @rowSelect="handleRowSelect"
                 @rowUnselect="handleRowUnselect"
                 :paginator="true"
                 :rows="defaultRows"

                 responsiveLayout="scroll"
                 :loading="loading"
                 stripedRows
      >
        <!-- Columnas dinámicas -->
        <Column
            v-for="col in columns"
            :key="col.field"
            :field="col.field"
            :header="col.header"
            :style="{ width: col.width || '150px' }"
            :sortable="col.sortable !== false"
            :filter="col.filterable !== false"
            :filterPlaceholder="`Buscar por ${col.header}...`"
        >
          <template #body="slotProps">
            <!-- Soporte para campos anidados (ej: countyFk.countyName) -->
            <span>{{ getNestedValue(slotProps.data, col.field) }}</span>
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
.generic-list-view {
  width: 100%;
}

.flex {
  display: flex;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
