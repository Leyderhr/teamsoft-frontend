<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import GenericListView from '@/components/GenericListView.vue'
import { roleConfig } from '@/config/role.config'

const toast = useToast()
const items = ref([])
const loading = ref(false)
const selectedItem = ref(null)

const loadData = async () => {
  loading.value = true
  try {
    const data = await roleConfig.service.getAll()
    console.log('Datos de roles:', data)
    items.value = data
  } catch (error) {
    console.error('Error cargando roles:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los roles',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  console.log('Crear nuevo rol')
  // TODO: Implementar lógica para crear
}

const handleEdit = (item) => {
  console.log('Editar rol:', item)
  // TODO: Implementar lógica para editar
}

const handleDelete = async (item) => {
  try {
    await roleConfig.service.delete(item.id)
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Rol eliminado correctamente',
      life: 3000
    })
    await loadData()
  } catch (error) {
    console.error('Error eliminando:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar el rol',
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
    <h1 class="titulo text-black text-left">{{ roleConfig.title }}</h1>

    <GenericListView
        :items="items"
        :columns="roleConfig.columns"
        :selected-item="selectedItem"
        :title="roleConfig.listTitle"
        :loading="loading"
        :show-import-button="roleConfig.showImportButton"
        :on-create-click="handleCreate"
        :on-edit-click="handleEdit"
        :on-delete-confirm="handleDelete"
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
