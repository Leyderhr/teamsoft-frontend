<script setup>
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import GenericListView from '@/shared/components/GenericListView.vue'
import { competenceConfig } from '@/features/competences/config/competence.config.js'
import { useCompetences } from '@/services/competences/queries'

const toast = useToast()
const selectedItem = ref(null)

const { data: items, isLoading: loading, refetch: loadData } = useCompetences()

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