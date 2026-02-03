<!-- Religion.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import religionService from '@/api/religionService.js'
import GenericListView from '@/components/GenericListView.vue'

const toast = useToast()
const items = ref([])
const loading = ref(false)
const selectedItem = ref(null)

// Columnas CORREGIDAS - usa religionName en lugar de name
const columns = ref([
  { field: 'id', header: 'ID', width: '80px', sortable: true },
  { field: 'religionName', header: 'Nombre', width: '250px', sortable: true, filterable: true }
])

// Cargar datos
const loadData = async () => {
  loading.value = true
  try {
    const data = await religionService.getAll()

    // IMPORTANTE: Verifica lo que devuelve realmente la API
    console.log('Datos recibidos de la API:', data)
    console.log('Es array?', Array.isArray(data))
    console.log('Primer elemento:', data[0])

    // Asigna directamente si es un array
    items.value = data

  } catch (error) {
    console.error('Error cargando religiones:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las religiones',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

// Métodos CRUD
const handleCreate = () => {
  console.log('Crear nueva religión')
  // Implementa la lógica para crear
}

const handleEdit = (item) => {
  console.log('Editar religión:', item)
  // Implementa la lógica para editar
}

const handleDelete = async (item) => {
  try {
    console.log('Eliminar religión:', item.id)
    await religionService.delete(item.id)
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Religión eliminada correctamente',
      life: 3000
    })
    // Recargar datos después de eliminar
    await loadData()
  } catch (error) {
    console.error('Error eliminando:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar la religión',
      life: 3000
    })
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Religiones</h1>

    <GenericListView
        :items="items"
        :columns="columns"
        :selected-item="selectedItem"
        title="Lista de Religiones"
        :loading="loading"
        :on-create-click="handleCreate"
        :on-edit-click="handleEdit"
        :on-delete-confirm="handleDelete"
        @update:selectedItem="selectedItem = $event"
    />
  </div>
</template>