<script setup>
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import GenericListView from '@/shared/components/GenericListView.vue'
import { projectConfig } from '@/features/projects/config/project.config.js'
import { useProjects } from '@/services/projects/queries'

const toast = useToast()
const selectedItem = ref(null)

const { data: items, isLoading: loading, refetch: loadData } = useProjects()
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
