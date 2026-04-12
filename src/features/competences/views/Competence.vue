<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import GenericListView from '@/shared/components/GenericListView.vue'
import { competenceConfig } from '@/features/competences/config/competence.config.js'

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
  <div>
    <GenericListView
      :items="items"
      :columns="competenceConfig.columns"
      :fields="competenceConfig.fields"
      :service="competenceConfig.service"
      :config="competenceConfig"
      :selected-item="selectedItem"
      :title="competenceConfig.listTitle"
      :loading="loading"
      :show-import-button="competenceConfig.showImportButton"
      :on-create-click="loadData"
      :on-import-click="handleImport"
      @update:selectedItem="selectedItem = $event"
    />
  </div>
</template>