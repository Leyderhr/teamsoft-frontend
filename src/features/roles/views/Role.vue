<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import GenericListView from '@/shared/components/GenericListView.vue'
import { roleConfig } from '@/features/roles/config/role.config.js'

const toast = useToast()
const items = ref([])
const loading = ref(false)
const selectedItem = ref(null)

const loadData = async () => {
  loading.value = true
  try {
    const data = await roleConfig.service.getAll()
    console.log('Datos de roles:', data)
    items.value = data
  } catch (error) {
    console.error('Error cargando roles:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los roles',
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
