<script setup>
import { ref, onMounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import GenericListView from '@/shared/components/GenericListView.vue'

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
  <div>
    <GenericListView
      :items="items"
      :columns="config.columns"
      :fields="config.fields"
      :service="config.service"
      :config="config"
      :selected-item="selectedItem"
      :title="config.listTitle"
      :loading="loading"
      :on-create-click="loadData"
      @update:selectedItem="selectedItem = $event"
    />
  </div>
</template>