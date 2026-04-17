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

// Extraer endpoint del config
const endpoint = computed(() => props.config.endpoint || props.config.entityName.singular)

const { data: items, isLoading: loading, refetch: loadData } = useNomenclative(endpoint.value)

watch(() => props.config, () => {
  selectedItem.value = null
  loadData()
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