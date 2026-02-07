<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import GenericListView from '@/components/GenericListView.vue'
import { competenceConfig } from '@/config/competence.config'

const toast = useToast()
const items = ref([])
const loading = ref(false)
const selectedItem = ref(null)

const loadData = async () => {
  loading.value = true
  try {
    const data = await competenceConfig.service.getAll()
    console.log('Datos de competencias:', data)
    items.value = data
  } catch (error) {
    console.error('Error cargando competencias:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las competencias',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  console.log('Crear nueva competencia')
  // TODO: Implementar lógica para crear
}

const handleEdit = (item) => {
  console.log('Editar competencia:', item)
  // TODO: Implementar lógica para editar
}

const handleDelete = async (item) => {
  try {
    await competenceConfig.service.delete(item.id)
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Competencia eliminada correctamente',
      life: 3000
    })
    await loadData()
  } catch (error) {
    console.error('Error eliminando:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar la competencia',
      life: 3000
    })
  }
}

const handleImport = () => {
  if (competenceConfig.onImport) {
    competenceConfig.onImport()
  } else {
    toast.add({
      severity: 'info',
      summary: 'Importar',
      detail: 'Funcionalidad de importación en desarrollo',
      life: 3000
    })
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="p-4 pl-15">
    <h1 class="text-black titulo text-left font-bold py-0 my-0">{{ competenceConfig.title }}</h1>

    <GenericListView
        :items="items"
        :columns="competenceConfig.columns"
        :selected-item="selectedItem"
        :title="competenceConfig.listTitle"
        :loading="loading"
        :show-import-button="competenceConfig.showImportButton"
        :on-create-click="handleCreate"
        :on-edit-click="handleEdit"
        :on-delete-confirm="handleDelete"
        :on-import-click="handleImport"
        @update:selectedItem="selectedItem = $event"
    />
  </div>
</template>

<style scoped>
.titulo{
  font-size: 2.5rem;
  margin: 20px 0;
  font-family: Arial, "Arial CE", "Lucida Grande CE", lucida, "Helvetica CE", sans-serif;
}

</style>