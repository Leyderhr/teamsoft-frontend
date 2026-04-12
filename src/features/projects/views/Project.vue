<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import GenericListView from '@/shared/components/GenericListView.vue'
import { projectConfig } from '@/features/projects/config/project.config.js'

const toast = useToast()
const items = ref([])
const loading = ref(false)
const selectedItem = ref(null)

const loadData = async () => {
  loading.value = true
  try {
    const data = await projectConfig.service.getAll()
    items.value = data
  } catch (error) {
    console.error('Error cargando proyectos:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los proyectos',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div>
    <GenericListView
      :items="items"
      :columns="projectConfig.columns"
      :selected-item="selectedItem"
      :title="projectConfig.listTitle"
      :loading="loading"
      :service="projectConfig.service"
      :config="projectConfig"
      :show-import-button="projectConfig.showImportButton"
      :on-create-click="loadData"
      @update:selectedItem="selectedItem = $event"
    />
  </div>
</template>
