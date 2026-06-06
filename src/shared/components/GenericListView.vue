<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import DataTable from './DataTable.vue'
import PageBreadcrumb from './PageBreadcrumb.vue'

const toast = useToast()
const router = useRouter()
const route = useRoute()

const props = defineProps({
  items: { type: Array, required: true, default: () => [] },
  selectedItem: { type: Object, default: null },
  columns: { type: Array, required: true },
  fields: { type: Array, default: () => [] },
  service: { type: Object, required: true },
  config: { type: Object, default: null },
  title: { type: String, required: true },
  rowsPerPageOptions: { type: Array, default: () => [10, 20, 30, 40, 50] },
  defaultRows: { type: Number, default: 10 },
  loading: { type: Boolean, default: false },
  showImportButton: { type: Boolean, default: false },
  onRowSelect: { type: Function, default: null },
  onRowUnselect: { type: Function, default: null },
  onCreateClick: { type: Function, required: true },
  onEditClick: { type: Function, default: null },
  onImportClick: { type: Function, default: null },
  onExportClick: { type: Function, default: null },
})

const emit = defineEmits(['update:selectedItem'])

const localSelected = ref(props.selectedItem)

// Row selection from DataTable
const handleRowSelect = (item) => {
  localSelected.value = item
  emit('update:selectedItem', item)
  if (props.onRowSelect) props.onRowSelect(item)
}

// Create — navigate to create page
const handleCreate = () => {
  const createPath = props.config?.createRoute ?? `${route.path}/create`
  router.push(createPath)
}

// Edit — navigate to edit page
const handleEdit = (item) => {
  const target = item || localSelected.value
  if (!target) {
    toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Selecciona un elemento para editar', life: 3000 })
    return
  }
  if (typeof props.config?.editRoute === 'function') {
    router.push(props.config.editRoute(target.id))
  } else {
    router.push(`${route.path}/edit/${target.id}`)
  }
}

// Delete — called after DataTable confirms internally
const handleDelete = async (item) => {
  const target = item || localSelected.value
  if (!target) return
  try {
    await props.service.delete(target.id)
    localSelected.value = null
    emit('update:selectedItem', null)
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Elemento eliminado correctamente', life: 3000 })
    if (typeof props.onCreateClick === 'function') props.onCreateClick()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'Error al eliminar', life: 3000 })
  }
}

// Import
const handleImport = () => {
  if (typeof props.onImportClick === 'function') {
    props.onImportClick()
  }
}

// Export
const handleExport = () => {
  if (typeof props.onExportClick === 'function') {
    props.onExportClick()
  }
}
</script>

<template>
  <div>
    <PageBreadcrumb :page-title="title" />

    <DataTable
      :columns="columns"
      :items="items"
      :loading="loading"
      :rows-per-page-options="rowsPerPageOptions"
      :default-rows="defaultRows"
      :show-import-button="showImportButton"
      @create="handleCreate"
      @edit="handleEdit"
      @delete="handleDelete"
      @import="handleImport"
      @export="handleExport"
      @row-select="handleRowSelect"
    >
      <template #extraButtons>
        <slot name="extraButtons"></slot>
      </template>
    </DataTable>

    <slot name="extra" />
  </div>
</template>
