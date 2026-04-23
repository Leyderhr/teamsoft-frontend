# 📖 Ejemplos Prácticos - Todos los Módulos

## 1. Users

### Listar usuarios
```vue
<script setup>
import { useUsers } from '@/services/users/queries'

const { data: users, isLoading } = useUsers()
</script>

<template>
  <DataTable :value="users" :loading="isLoading">
    <Column field="personName" header="Nombre" />
    <Column field="mail" header="Email" />
  </DataTable>
</template>
```

### Crear usuario
```vue
<script setup>
import { useCreateUser } from '@/services/users/mutations'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const createMutation = useCreateUser()

const handleSubmit = (formData) => {
  createMutation.mutate(formData, {
    onSuccess: () => {
      toast.add({ severity: 'success', summary: 'Usuario creado' })
    }
  })
}
</script>
```

---

## 2. Persons

### Listar personas con filtro
```vue
<script setup>
import { usePersons } from '@/services/persons/queries'
import { ref } from 'vue'

const searchTerm = ref('')
const { data: persons, isLoading } = usePersons()

const filteredPersons = computed(() => {
  if (!searchTerm.value) return persons.value
  return persons.value?.filter(p => 
    p.personName.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})
</script>
```

### Actualizar persona
```vue
<script setup>
import { useUpdatePerson } from '@/services/persons/mutations'

const updateMutation = useUpdatePerson()

const handleUpdate = (id, data) => {
  updateMutation.mutate({ id, data })
}
</script>
```

---

## 3. Roles

### Importar roles desde CSV
```vue
<script setup>
import { useImportRoles } from '@/services/roles/mutations'

const importMutation = useImportRoles()

const handleFileUpload = (event) => {
  const file = event.files[0]
  const formData = new FormData()
  formData.append('file', file)
  formData.append('updateIfExist', 'false')

  importMutation.mutate(formData, {
    onSuccess: (result) => {
      console.log(`Importados: ${result.successCount}`)
    }
  })
}
</script>
```

### Exportar roles a CSV
```vue
<script setup>
import { useExportRoles } from '@/services/roles/mutations'

const exportMutation = useExportRoles()

const handleExport = () => {
  exportMutation.mutate(null, {
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'roles.csv'
      a.click()
    }
  })
}
</script>
```

---

## 4. Competences

### Listar competencias con detalles
```vue
<script setup>
import { useCompetences, useCompetence } from '@/services/competences/queries'

const { data: competences } = useCompetences()
const selectedId = ref(null)
const { data: competenceDetail } = useCompetence(selectedId)

const handleSelect = (id) => {
  selectedId.value = id
}
</script>
```

---

## 5. Projects

### Crear múltiples proyectos
```vue
<script setup>
import { useCreateProjects } from '@/services/projects/mutations'

const createMutation = useCreateProjects()

const handleCreateMultiple = () => {
  const projects = [
    { projectName: 'Proyecto 1', initialDate: '2025-01-15', client: 1, province: 1, projectStructure: 1 },
    { projectName: 'Proyecto 2', initialDate: '2025-01-16', client: 2, province: 2, projectStructure: 2 }
  ]

  createMutation.mutate(projects)
}
</script>
```

### Cerrar proyecto
```vue
<script setup>
import { useCloseProject } from '@/services/projects/mutations'

const closeMutation = useCloseProject()

const handleClose = (projectId) => {
  closeMutation.mutate(projectId, {
    onSuccess: () => {
      console.log('Proyecto cerrado')
    }
  })
}
</script>
```

---

## 6. Nomenclatives

### CRUD de Clientes
```vue
<script setup>
import { useClients } from '@/services/nomenclatives/queries'
import { clientsMutations } from '@/services/nomenclatives/mutations'

const { data: clients } = useClients()
const { useCreate, useUpdate, useDelete } = clientsMutations

const createMutation = useCreate()
const updateMutation = useUpdate()
const deleteMutation = useDelete()

const handleCreate = (data) => {
  createMutation.mutate(data)
}

const handleUpdate = (id, data) => {
  updateMutation.mutate({ id, data })
}

const handleDelete = (id) => {
  deleteMutation.mutate(id)
}
</script>
```

### Usar múltiples nomenclativos
```vue
<script setup>
import { 
  useClients, 
  useCounties, 
  useProjectStructures 
} from '@/services/nomenclatives/queries'

const { data: clients } = useClients()
const { data: counties } = useCounties()
const { data: structures } = useProjectStructures()
</script>

<template>
  <Dropdown v-model="selectedClient" :options="clients" optionLabel="clientName" />
  <Dropdown v-model="selectedCounty" :options="counties" optionLabel="countyName" />
  <Dropdown v-model="selectedStructure" :options="structures" optionLabel="structureName" />
</template>
```

---

## 7. Team Formation

### Generar equipos (ejecución manual)
```vue
<script setup>
import { ref } from 'vue'
import { useTeamFormation } from '@/services/team-formation/queries'
import { useSaveTeams } from '@/services/team-formation/mutations'

const params = ref({
  teamFormationParameters: {
    groupList: [{ id: 1 }],
    confRole: true,
    maximunRoles: 3,
    // ... más parámetros
  },
  projectsIDs: [1, 2],
  groupIDs: [1]
})

const { data: teams, refetch, isLoading, isFetching } = useTeamFormation(params, { 
  enabled: false // No ejecutar automáticamente
})

const saveTeamsMutation = useSaveTeams()

const handleGenerate = () => {
  refetch() // Ejecutar manualmente
}

const handleSave = () => {
  saveTeamsMutation.mutate({
    proposalName: 'Propuesta 2025-01',
    projects: teams.value
  }, {
    onSuccess: () => {
      console.log('Equipos guardados')
    }
  })
}
</script>

<template>
  <Button @click="handleGenerate" :loading="isFetching">
    Generar Equipos
  </Button>
  
  <div v-if="teams">
    <Button @click="handleSave" :loading="saveTeamsMutation.isPending">
      Guardar Propuesta
    </Button>
  </div>
</template>
```

---

## 8. Reports

### Generar y exportar reporte
```vue
<script setup>
import { useReports } from '@/services/reports/queries'
import { useGenerateReport, useExportReport } from '@/services/reports/mutations'

const { data: reports } = useReports()
const generateMutation = useGenerateReport()
const exportMutation = useExportReport()

const handleGenerate = () => {
  generateMutation.mutate({
    type: 'PROJECT_SUMMARY',
    filters: { startDate: '2025-01-01', endDate: '2025-12-31' }
  })
}

const handleExport = (reportId, format = 'pdf') => {
  exportMutation.mutate({ id: reportId, format }, {
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report.${format}`
      a.click()
    }
  })
}
</script>
```

---

## 9. Audit

### Logs con filtros reactivos
```vue
<script setup>
import { ref } from 'vue'
import { useAuditLogs } from '@/services/audit/queries'

const filters = ref({
  page: 1,
  size: 20,
  entity: '',
  action: '',
  userId: null,
  startDate: null,
  endDate: null
})

// TanStack Query automáticamente recarga cuando filters cambia
const { data: logs, isLoading } = useAuditLogs(filters)

const handleFilterChange = (key, value) => {
  filters.value[key] = value
  filters.value.page = 1 // Reset a primera página
}
</script>

<template>
  <div class="filters">
    <Dropdown 
      v-model="filters.entity" 
      :options="['User', 'Person', 'Role', 'Project']"
      placeholder="Entidad"
      @change="handleFilterChange('entity', $event.value)"
    />
    
    <Dropdown 
      v-model="filters.action" 
      :options="['CREATE', 'UPDATE', 'DELETE']"
      placeholder="Acción"
      @change="handleFilterChange('action', $event.value)"
    />
    
    <Calendar 
      v-model="filters.startDate"
      placeholder="Fecha inicio"
      @date-select="handleFilterChange('startDate', $event)"
    />
  </div>

  <DataTable :value="logs?.items" :loading="isLoading">
    <Column field="entity" header="Entidad" />
    <Column field="action" header="Acción" />
    <Column field="userName" header="Usuario" />
    <Column field="timestamp" header="Fecha" />
  </DataTable>
</template>
```

---

## 🎯 Patrones Comunes

### 1. Loading States
```vue
<script setup>
const { data, isLoading, isFetching, isError } = useQuery()
</script>

<template>
  <div v-if="isLoading">Cargando inicial...</div>
  <div v-else-if="isError">Error al cargar</div>
  <div v-else>
    <div v-if="isFetching">Actualizando...</div>
    <!-- Contenido -->
  </div>
</template>
```

### 2. Optimistic Updates
```vue
<script setup>
const updateMutation = useUpdateSomething()

const handleUpdate = (id, data) => {
  updateMutation.mutate({ id, data }, {
    onMutate: async (variables) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: ['items'] })
      
      // Snapshot del estado anterior
      const previous = queryClient.getQueryData(['items'])
      
      // Actualización optimista
      queryClient.setQueryData(['items'], (old) => 
        old.map(item => item.id === id ? { ...item, ...data } : item)
      )
      
      return { previous }
    },
    onError: (err, variables, context) => {
      // Revertir en caso de error
      queryClient.setQueryData(['items'], context.previous)
    }
  })
}
</script>
```

### 3. Paginación
```vue
<script setup>
import { ref } from 'vue'

const page = ref(1)
const { data, isLoading } = useItems({ page })

const handlePageChange = (newPage) => {
  page.value = newPage
}
</script>
```

---

**Última actualización**: 2025-01-15
