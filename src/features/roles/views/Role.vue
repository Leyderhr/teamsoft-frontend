<script setup>
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import GenericListView from '@/shared/components/GenericListView.vue'
import { roleConfig } from '@/features/roles/config/role.config.js'
import { useRoles } from '@/services/roles/queries'

const toast = useToast()
const selectedItem = ref(null)

const { data: items, isLoading: loading, refetch: loadData } = useRoles()
</script>

<template>
  <div>
    <GenericListView
      :items="items"
      :columns="roleConfig.columns"
      :fields="roleConfig.fields"
      :service="roleConfig.service"
      :config="roleConfig"
      :selected-item="selectedItem"
      :title="roleConfig.listTitle"
      :loading="loading"
      :show-import-button="roleConfig.showImportButton"
      :on-create-click="loadData"
      @update:selectedItem="selectedItem = $event"
    />
  </div>
</template>
