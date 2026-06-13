<script setup>
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import GenericListView from '@/shared/components/GenericListView.vue'
import { roleConfig } from '@/features/roles/config/role.config.js'
import { useRoles } from '@/services/roles/queries'
import ImportModal from '@/shared/components/ImportModal.vue'
import roleService from '@/features/roles/services/roleService.js'

const toast = useToast()
const selectedItem = ref(null)
const showImportModal = ref(false)
const isExporting = ref(false)

const { data: items, isLoading: loading, refetch: loadData } = useRoles()

const handleImportClick = () => { showImportModal.value = true }

const handleExport = async () => {
  if (isExporting.value) return
  isExporting.value = true
  try {
    const blob = await roleService.exportFile()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'roles.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Roles exportados correctamente', life: 3000 })
  } catch (err) {
    console.error('[handleExport]', err)
    toast.add({ severity: 'error', summary: 'Error', detail: err?.message || 'No se pudo exportar los roles', life: 3000 })
  } finally {
    isExporting.value = false
  }
}

const roleImportFn = (file, updateIfExist) => roleService.importFile(file, updateIfExist)
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
      :on-import-click="handleImportClick"
      :on-export-click="handleExport"
      @update:selectedItem="selectedItem = $event"
    />
    <ImportModal
      v-model:visible="showImportModal"
      title="Importar Roles"
      :import-fn="roleImportFn"
      @success="loadData"
    />
  </div>
</template>
