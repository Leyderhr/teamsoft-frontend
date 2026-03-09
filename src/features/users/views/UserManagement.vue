<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import GenericListView from '@/shared/components/GenericListView.vue'
import { userConfig } from '@/features/users/config/user.config.js'

const toast = useToast()
const items = ref([])
const loading = ref(false)
const selectedItem = ref(null)

const loadData = async () => {
  loading.value = true
  try {
    const data = await userConfig.service.getAll()
    items.value = data
  } catch (error) {
    console.error('Error cargando usuarios:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los usuarios',
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
    <h1 class="text-black titulo text-left font-bold py-0 my-0">{{ userConfig.title }}</h1>

    <GenericListView
        :items="items"
        :columns="userConfig.columns"
        :fields="userConfig.fields"
        :service="userConfig.service"
        :config="userConfig"
        :selected-item="selectedItem"
        :title="userConfig.listTitle"
        :loading="loading"
        :show-import-button="userConfig.showImportButton"
        :on-create-click="loadData"
        @update:selectedItem="selectedItem = $event"
    />
  </div>
</template>

<style scoped>
.titulo {
  font-size: 2.5rem;
  margin: 20px 0;
  font-family: Arial, "Arial CE", "Lucida Grande CE", lucida, "Helvetica CE", sans-serif;
}
</style>
