<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import personService from '@/api/personService.js'
import GenericListView from '@/components/GenericListView.vue'

const toast = useToast()
const items = ref([])
const loading = ref(false)
const selectedItem = ref(null)

// Columnas para mostrar información básica de las personas
const columns = ref([
  { field: 'id', header: 'ID', width: '80px', sortable: true },
  { field: 'personName', header: 'Nombre', width: '150px', sortable: true, filterable: true },
  { field: 'surName', header: 'Apellidos', width: '150px', sortable: true, filterable: true },
  { field: 'card', header: 'CI', width: '150px', sortable: true, filterable: true },
  { field: 'email', header: 'Email', width: '200px', sortable: true, filterable: true },
  { field: 'phone', header: 'Teléfono', width: '120px', sortable: true },
  { field: 'sex', header: 'Sexo', width: '80px', sortable: true },
  { field: 'age', header: 'Edad', width: '80px', sortable: true },
  { field: 'status', header: 'Estado', width: '100px', sortable: true },
  { field: 'county.countyName', header: 'Provincia', width: '120px', sortable: true },
  { field: 'religion.religionName', header: 'Religión', width: '120px', sortable: true }
])

// Cargar datos
const loadData = async () => {
  loading.value = true
  try {
    const data = await personService.getAll()
    console.log('Datos recibidos de la API:', data)
    items.value = data
  } catch (error) {
    console.error('Error cargando personas:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las personas',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

// Métodos CRUD
const handleCreate = () => {
  console.log('Crear nueva persona')
  // TODO: Implementar lógica para crear
}

const handleEdit = (item) => {
  console.log('Editar persona:', item)
  // TODO: Implementar lógica para editar
}

const handleDelete = async (item) => {
  try {
    console.log('Eliminar persona:', item.id)
    await personService.delete(item.id)
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Persona eliminada correctamente',
      life: 3000
    })
    await loadData()
  } catch (error) {
    console.error('Error eliminando:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar la persona',
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
    <h1 class="text-2xl font-bold mb-4">Personas</h1>

    <GenericListView
        :items="items"
        :columns="columns"
        :selected-item="selectedItem"
        title="Lista de Personas"
        :loading="loading"
        :on-create-click="handleCreate"
        :on-edit-click="handleEdit"
        :on-delete-confirm="handleDelete"
        @update:selectedItem="selectedItem = $event"
    />
  </div>
</template>
