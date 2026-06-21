<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import GenericListView from '@/shared/components/GenericListView.vue'
import { usePersons } from '@/composables/usePersons'
import { fetchDeletePerson } from '@/services/persons'

const router = useRouter()
const selectedItem = ref(null)

const { persons: items, isLoading: loading, error, refetch: loadData } = usePersons()

// Debug logs
onMounted(() => {
  console.log('Person.vue mounted')
  console.log('Items:', items.value)
  console.log('Loading:', loading.value)
  console.log('Error:', error.value)
})

watch([items, loading, error], ([newItems, newLoading, newError]) => {
  console.log('Watch triggered:')
  console.log('  Items:', newItems)
  console.log('  Loading:', newLoading)
  console.log('  Error:', newError)
})

const columns = ref([
  { field: 'personName', header: 'Nombre', sortable: true },
  { field: 'surName', header: 'Apellidos', sortable: true },
  { field: 'card', header: 'CI', sortable: true },
  { field: 'email', header: 'Email', sortable: true },
  { field: 'phone', header: 'Teléfono' },
  { field: 'sex', header: 'Sexo' },
  { field: 'status', header: 'Estado', type: 'badge', sortable: true },
])

const personService = {
  delete: fetchDeletePerson
}

const personConfig = {
  createRoute: '/person/create',
  editRoute: (id) => `/person/edit/${id}`
}


</script>

<template>
  <div>
    <GenericListView
      :items="items || []"
      :columns="columns"
      :selected-item="selectedItem"
      :service="personService"
      :config="personConfig"
      title="Personas"
      :loading="loading"
      :on-create-click="loadData"
      @update:selectedItem="selectedItem = $event"
      @refresh="loadData"
    />
  </div>
</template>
