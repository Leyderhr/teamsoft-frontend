<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import GenericListView from '@/components/GenericListView.vue'
import { projectConfig } from '@/config/project.config'

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
  <div class="p-4 pl-15">
    <h1 class="text-black titulo text-left font-bold py-0 my-0">{{ projectConfig.title }}</h1>

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

<style scoped>
.titulo{
  font-size: 2.5rem;
  margin: 20px 0;
  font-family: Arial, "Arial CE", "Lucida Grande CE", lucida, "Helvetica CE", sans-serif;
}
</style>
