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
  { field: 'personName', header: 'features.persons.fields.name', sortable: true },
  { field: 'surName', header: 'features.persons.fields.surname', sortable: true },
  { field: 'card', header: 'features.persons.fields.card', sortable: true },
  { field: 'email', header: 'features.persons.fields.email', sortable: true },
  { field: 'phone', header: 'features.persons.fields.phone' },
  { field: 'sex', header: 'features.persons.fields.sex' },
  { field: 'group.name', header:'features.persons.fields.group', sortable: true},
  { field: 'status', header: 'common.fields.status', type: 'badge', sortable: true },
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
      title="features.persons.title"
      :loading="loading"
      :on-create-click="loadData"
      @update:selectedItem="selectedItem = $event"
      @refresh="loadData"
    />
  </div>
</template>
