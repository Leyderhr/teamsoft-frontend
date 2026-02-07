<script setup>
import { ref, onMounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import GenericListView from '@/components/GenericListView.vue'

const props = defineProps({
  config: {
    type: Object,
    required: true,
    validator: (value) => {
      return value.service &&
          value.columns &&
          value.title &&
          value.entityName
    }
  }
})

const toast = useToast()
const items = ref([])
const loading = ref(false)
const selectedItem = ref(null)

const loadData = async () => {
  loading.value = true
  try {
    const data = await props.config.service.getAll()
    items.value = data
  } catch (error) {
    console.error(`Error cargando ${props.config.entityName.plural}:`, error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudieron cargar ${props.config.entityName.plural}`,
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  console.log(`Crear nuevo/a ${props.config.entityName.singular}`)
  // TODO: Implementar lógica para crear
}

const handleEdit = (item) => {
  console.log(`Editar ${props.config.entityName.singular}:`, item)
  // TODO: Implementar lógica para editar
}

const handleDelete = async (item) => {
  try {
    console.log(`Eliminar ${props.config.entityName.singular}:`, item.id)
    await props.config.service.delete(item.id)
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `${props.config.entityName.singular.charAt(0).toUpperCase() + props.config.entityName.singular.slice(1)} eliminado/a correctamente`,
      life: 3000
    })
    await loadData()
  } catch (error) {
    console.error('Error eliminando:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudo eliminar ${props.config.entityName.singular}`,
      life: 3000
    })
  }
}

watch(() => props.config, (newConfig, oldConfig) => {
  // Limpiar selección al cambiar de nomenclador
  selectedItem.value = null
  // Recargar datos
  loadData()
}, { immediate: false })

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="p-4 pl-15">
    <h1 class="titulo text-left font-bold mb-4 text-black">{{ config.title }}</h1>

    <GenericListView
        :items="items"
        :columns="config.columns"
        :selected-item="selectedItem"
        :title="config.listTitle"
        :loading="loading"
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