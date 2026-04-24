<script setup>
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import GenericListView from '@/shared/components/GenericListView.vue'
import { competenceConfig } from '@/features/competences/config/competence.config.js'
import { useCompetences } from '@/services/competences/queries'
import ImportModal from '@/shared/components/ImportModal.vue'
import competenceService from '@/features/competences/services/competenceService.js'

const toast = useToast()
const selectedItem = ref(null)
const showImportModal = ref(false)
const isExporting = ref(false)

const { data: items, isLoading: loading, refetch: loadData } = useCompetences()

const handleImportClick = () => { showImportModal.value = true }

const competenceImportFn = (file, updateIfExist) => competenceService.importFile(file, updateIfExist)

const handleExport = async () => {
  if (isExporting.value) return
  isExporting.value = true
  try {
    const blob = await competenceService.exportFile()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'competencias.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Competencias exportadas correctamente', life: 3000 })
  } catch (err) {
    console.error('[handleExport]', err)
    toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'No se pudo exportar las competencias', life: 3000 })
  } finally {
    isExporting.value = false
  }
}
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
      :on-import-click="handleImportClick"
      :on-export-click="handleExport"
      @update:selectedItem="selectedItem = $event"
    />
    <ImportModal
      v-model:visible="showImportModal"
      title="Importar Competencias"
      :import-fn="competenceImportFn"
      @success="loadData"
    />
  </div>
</template>
