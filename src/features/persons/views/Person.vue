<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import reportService from '@/features/reports/services/reportService.js'
import personService from '@/features/persons/services/personService.js'
import GenericListView from '@/shared/components/GenericListView.vue'

const toast = useToast()
const items = ref([])
const loading = ref(false)
const selectedItem = ref(null)

// Columnas con los field names correctos del endpoint /person/report
const columns = ref([
  { field: 'personName', header: 'Nombre', sortable: true },
  { field: 'surName', header: 'Apellidos', sortable: true },
  { field: 'card', header: 'CI', sortable: true },
  { field: 'email', header: 'Email', sortable: true },
  { field: 'phone', header: 'Teléfono' },
  { field: 'sex', header: 'Sexo' },
  { field: 'status', header: 'Estado', type: 'badge', sortable: true },
  { field: 'countyFk.countyName', header: 'Provincia', sortable: true },
  { field: 'raceFk.raceName', header: 'Raza', sortable: true },
  { field: 'groupFk.name', header: 'Grupo', sortable: true },
])

const loadData = async () => {
  loading.value = true
  try {
    // Usar el endpoint enriquecido que devuelve relaciones (countyFk, raceFk, groupFk, etc.)
    items.value = await reportService.getPersonReport()
  } catch (error) {
    console.error('Error cargando personas (report):', error)
    // Fallback al endpoint básico
    try {
      items.value = await personService.getAll()
    } catch (e) {
      console.error('Error en fallback personService.getAll():', e)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar las personas',
        life: 3000
      })
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div>
    <GenericListView
      :items="items"
      :columns="columns"
      :selected-item="selectedItem"
      :service="personService"
      title="Personas"
      :loading="loading"
      @update:selectedItem="selectedItem = $event"
      @refresh="loadData"
    />
  </div>
</template>
