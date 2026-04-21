<script setup>
import { ref, watch, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import GenericListView from '@/shared/components/GenericListView.vue'
import { useNomenclative } from '@/services/nomenclatives/queries'

const props = defineProps({
  config: {
    type: Object,
    required: true,
    validator: (value) => {
      return value.service &&
          value.columns &&
          value.title &&
          value.entityName
    }
  }
})

const toast = useToast()
const selectedItem = ref(null)

// Extraer endpoint del config — debe ser camelCase o kebab-case sin espacios
const endpoint = computed(() => props.config.endpoint)

const { data: items, isLoading: loading, refetch: loadData } = useNomenclative(endpoint)

watch(() => props.config, () => {
  selectedItem.value = null
}, { immediate: false })
</script>

<template>
  <div>
    <GenericListView
      :items="items"
      :columns="config.columns"
      :fields="config.fields"
      :service="config.service"
      :config="config"
      :selected-item="selectedItem"
      :title="config.listTitle"
      :loading="loading"
      :on-create-click="loadData"
      @update:selectedItem="selectedItem = $event"
    />
  </div>
</template>