# 🔄 Guía de Migración - Sistema Antiguo (Axios) → Nuevo (Ky + TanStack Query)

## 📋 Resumen

Esta guía explica cómo migrar componentes Vue que usan el sistema antiguo basado en Axios a el nuevo sistema basado en Ky + TanStack Query.

---

## ❌ Sistema Antiguo (Axios)

### Patrón Antiguo

```javascript
// features/users/services/userService.js
import apiClient from '@/core/api/axios.js'

const userService = {
    async getAll() {
        const response = await apiClient.get('/users')
        return response.data
    },
    async create(user) {
        const response = await apiClient.post('/users', user)
        return response.data
    }
}
```

```vue
<!-- Componente Vue -->
<script setup>
import { ref, onMounted } from 'vue'
import userService from '@/features/users/services/userService'

const users = ref([])
const loading = ref(false)

const loadUsers = async () => {
  loading.value = true
  try {
    users.value = await userService.getAll()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>
```

---

## ✅ Sistema Nuevo (Ky + TanStack Query)

### Patrón Nuevo

```javascript
// services/users/queries.js
import { useQuery } from '@tanstack/vue-query'
import { api } from '@/lib/api'

async function fetchUsers() {
  return api.get('users').json()
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })
}
```

```javascript
// services/users/mutations.js
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '@/lib/api'

async function createUser(userData) {
  return api.post('users', { json: userData }).json()
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
```

```vue
<!-- Componente Vue -->
<script setup>
import { useUsers } from '@/services/users/queries'
import { useCreateUser } from '@/services/users/mutations'

const { data: users, isLoading: loading, refetch } = useUsers()
const createUserMutation = useCreateUser()

const handleCreate = (userData) => {
  createUserMutation.mutate(userData, {
    onSuccess: () => {
      console.log('Usuario creado')
    },
    onError: (error) => {
      console.error(error)
    }
  })
}
</script>
```

---

## 🔄 Tabla de Migración

| Antiguo (Axios) | Nuevo (Ky + TanStack Query) |
|-----------------|----------------------------|
| `import userService from '@/features/users/services/userService'` | `import { useUsers } from '@/services/users/queries'` |
| `const users = ref([])` | `const { data: users } = useUsers()` |
| `const loading = ref(false)` | `const { isLoading: loading } = useUsers()` |
| `await userService.getAll()` | Automático con `useUsers()` |
| `await userService.create(data)` | `createUserMutation.mutate(data)` |
| `try/catch` manual | `onSuccess/onError` en mutation |
| `onMounted(() => loadData())` | No necesario, automático |

---

## 📦 Módulos Disponibles

### 1. Users

```javascript
// Queries
import { useUsers, useUser } from '@/services/users/queries'

// Mutations
import { 
  useCreateUser, 
  useDeleteUser, 
  useResetPassword 
} from '@/services/users/mutations'
```

### 2. Persons

```javascript
// Queries
import { usePersons, usePerson } from '@/services/persons/queries'

// Mutations
import { 
  useCreatePerson, 
  useUpdatePerson, 
  useDeletePerson 
} from '@/services/persons/mutations'
```

### 3. Roles

```javascript
// Queries
import { useRoles, useRole } from '@/services/roles/queries'

// Mutations
import { 
  useCreateRole, 
  useUpdateRole, 
  useDeleteRole,
  useImportRoles,
  useExportRoles
} from '@/services/roles/mutations'
```

### 4. Competences

```javascript
// Queries
import { useCompetences, useCompetence } from '@/services/competences/queries'

// Mutations
import { 
  useCreateCompetence, 
  useUpdateCompetence, 
  useDeleteCompetence,
  useImportCompetences,
  useExportCompetences
} from '@/services/competences/mutations'
```

### 5. Projects

```javascript
// Queries
import { useProjects, useProject } from '@/services/projects/queries'

// Mutations
import { 
  useCreateProjects, 
  useUpdateProject, 
  useCloseProject,
  useDeleteProject
} from '@/services/projects/mutations'
```

### 6. Nomenclatives

```javascript
// Queries
import { 
  useClients,
  useAgeGroups,
  useCompetenceImportance,
  useConflictIndex,
  useCostDistance,
  useCounties,
  useLevels,
  useNacionalities,
  usePersonGroups,
  useProjectStructures,
  useRaces,
  useReligions,
  useRoleEvaluations,
  useRoleLoads
} from '@/services/nomenclatives/queries'

// Mutations
import { 
  clientsMutations,
  ageGroupsMutations,
  // ... etc
} from '@/services/nomenclatives/mutations'

// Uso
const { useCreate, useUpdate, useDelete } = clientsMutations
const createClientMutation = useCreate()
```

### 7. Team Formation

```javascript
// Queries
import { useTeamFormation } from '@/services/team-formation/queries'

// Mutations
import { useSaveTeams } from '@/services/team-formation/mutations'

// Uso
const { data, refetch } = useTeamFormation(params, { enabled: false })
const saveTeamsMutation = useSaveTeams()

// Ejecutar manualmente
const handleGenerate = () => {
  refetch()
}
```

### 8. Reports

```javascript
// Queries
import { useReports, useReport } from '@/services/reports/queries'

// Mutations
import { 
  useGenerateReport, 
  useExportReport 
} from '@/services/reports/mutations'
```

### 9. Audit

```javascript
// Queries
import { useAuditLogs, useAuditLog } from '@/services/audit/queries'

// Uso con filtros
const { data: logs } = useAuditLogs({
  page: 1,
  size: 20,
  entity: 'User',
  action: 'CREATE'
})
```

---

## 🔧 Ejemplos de Migración

### Ejemplo 1: Lista Simple

**Antes:**
```vue
<script setup>
import { ref, onMounted } from 'vue'
import userService from '@/features/users/services/userService'

const users = ref([])
const loading = ref(false)

const loadUsers = async () => {
  loading.value = true
  try {
    users.value = await userService.getAll()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div v-if="loading">Cargando...</div>
  <div v-else>
    <div v-for="user in users" :key="user.id">
      {{ user.personName }}
    </div>
  </div>
</template>
```

**Después:**
```vue
<script setup>
import { useUsers } from '@/services/users/queries'

const { data: users, isLoading: loading } = useUsers()
</script>

<template>
  <div v-if="loading">Cargando...</div>
  <div v-else>
    <div v-for="user in users" :key="user.id">
      {{ user.personName }}
    </div>
  </div>
</template>
```

---

### Ejemplo 2: Crear con Formulario

**Antes:**
```vue
<script setup>
import { ref } from 'vue'
import userService from '@/features/users/services/userService'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const loading = ref(false)
const formData = ref({
  personName: '',
  surname: '',
  mail: ''
})

const handleSubmit = async () => {
  loading.value = true
  try {
    await userService.create(formData.value)
    toast.add({ severity: 'success', summary: 'Usuario creado' })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message })
  } finally {
    loading.value = false
  }
}
</script>
```

**Después:**
```vue
<script setup>
import { ref } from 'vue'
import { useCreateUser } from '@/services/users/mutations'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const createUserMutation = useCreateUser()
const formData = ref({
  personName: '',
  surname: '',
  mail: ''
})

const handleSubmit = () => {
  createUserMutation.mutate(formData.value, {
    onSuccess: () => {
      toast.add({ severity: 'success', summary: 'Usuario creado' })
    },
    onError: (error) => {
      toast.add({ severity: 'error', summary: 'Error', detail: error.message })
    }
  })
}
</script>
```

---

### Ejemplo 3: Eliminar con Confirmación

**Antes:**
```vue
<script setup>
import { ref } from 'vue'
import userService from '@/features/users/services/userService'
import { useConfirm } from 'primevue/useconfirm'

const confirm = useConfirm()
const loading = ref(false)

const handleDelete = (userId) => {
  confirm.require({
    message: '¿Está seguro?',
    accept: async () => {
      loading.value = true
      try {
        await userService.delete(userId)
        await loadUsers() // Recargar lista
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>
```

**Después:**
```vue
<script setup>
import { useDeleteUser } from '@/services/users/mutations'
import { useConfirm } from 'primevue/useconfirm'

const confirm = useConfirm()
const deleteUserMutation = useDeleteUser()

const handleDelete = (userId) => {
  confirm.require({
    message: '¿Está seguro?',
    accept: () => {
      deleteUserMutation.mutate(userId)
      // No necesita recargar manualmente, TanStack Query lo hace automáticamente
    }
  })
}
</script>
```

---

### Ejemplo 4: Team Formation (Ejecución Manual)

**Antes:**
```vue
<script setup>
import { ref } from 'vue'
import { fetchGenerateTeams, fetchSaveTeams } from '@/services/team-formation'

const teams = ref([])
const loading = ref(false)
const params = ref({
  teamFormationParameters: {},
  projectsIDs: [],
  groupIDs: []
})

const handleGenerate = async () => {
  loading.value = true
  try {
    teams.value = await fetchGenerateTeams(params.value)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  loading.value = true
  try {
    await fetchSaveTeams({ proposalName: 'Propuesta 1', projects: teams.value })
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>
```

**Después:**
```vue
<script setup>
import { ref } from 'vue'
import { useTeamFormation } from '@/services/team-formation/queries'
import { useSaveTeams } from '@/services/team-formation/mutations'

const params = ref({
  teamFormationParameters: {},
  projectsIDs: [],
  groupIDs: []
})

const { data: teams, refetch, isLoading: loading } = useTeamFormation(params, { enabled: false })
const saveTeamsMutation = useSaveTeams()

const handleGenerate = () => {
  refetch()
}

const handleSave = () => {
  saveTeamsMutation.mutate({
    proposalName: 'Propuesta 1',
    projects: teams.value
  })
}
</script>
```

---

### Ejemplo 5: Audit Logs con Filtros

**Antes:**
```vue
<script setup>
import { ref, watch } from 'vue'
import auditService from '@/features/audit/services/auditService'

const logs = ref([])
const loading = ref(false)
const filters = ref({
  page: 1,
  size: 20,
  entity: '',
  action: ''
})

const loadLogs = async () => {
  loading.value = true
  try {
    logs.value = await auditService.getAll(filters.value)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

watch(filters, () => {
  loadLogs()
}, { deep: true })
</script>
```

**Después:**
```vue
<script setup>
import { ref } from 'vue'
import { useAuditLogs } from '@/services/audit/queries'

const filters = ref({
  page: 1,
  size: 20,
  entity: '',
  action: ''
})

const { data: logs, isLoading: loading } = useAuditLogs(filters)
// TanStack Query automáticamente recarga cuando filters cambia
</script>
```

---

## ✅ Ventajas del Nuevo Sistema

1. **Menos código boilerplate** - No más `ref()`, `onMounted()`, `try/catch` manual
2. **Cache automático** - TanStack Query cachea las respuestas
3. **Revalidación automática** - Actualiza datos cuando cambian
4. **Estados de carga** - `isLoading`, `isPending`, `isError` automáticos
5. **Refresh token automático** - Manejo transparente de tokens expirados
6. **Optimistic updates** - Actualizaciones optimistas fáciles
7. **Retry automático** - Reintenta requests fallidos
8. **Deduplicación** - Evita requests duplicados

---

## 🚨 Archivos a Eliminar

Una vez migrados todos los componentes, eliminar:

```
src/features/*/services/*.js  (servicios antiguos)
src/core/api/axios.js         (cliente axios antiguo)
src/core/api/authService.js   (si existe)
```

---

## 📝 Checklist de Migración por Componente

- [ ] Identificar servicios usados (ej: `userService`)
- [ ] Reemplazar imports de servicios por queries/mutations
- [ ] Eliminar `ref()` para datos y loading
- [ ] Eliminar `onMounted()` para cargas iniciales
- [ ] Reemplazar `try/catch` por `onSuccess/onError`
- [ ] Eliminar llamadas manuales a `loadData()`
- [ ] Probar funcionalidad completa
- [ ] Eliminar archivo de servicio antiguo

---

## 🎯 Orden de Migración Sugerido

1. ✅ **Users** (ya migrado)
2. **Persons** (siguiente)
3. **Roles**
4. **Competences**
5. **Projects**
6. **Nomenclatives**
7. **Team Formation**
8. **Reports**
9. **Audit**

---

## 💡 Tips

- **No mezclar sistemas**: Migra un componente completo, no parcialmente
- **Prueba después de cada migración**: Verifica que todo funcione
- **Usa DevTools**: TanStack Query DevTools para debugging
- **Consulta ejemplos**: Revisa `UserManagement.vue` como referencia

---

## 🔍 Cómo Identificar Código Antiguo

Busca estos patrones en tus componentes:

```javascript
// ❌ Patrón antiguo
import someService from '@/features/*/services/*'
const data = ref([])
const loading = ref(false)
onMounted(() => loadData())

// ✅ Patrón nuevo
import { useSomething } from '@/services/*/queries'
const { data, isLoading } = useSomething()
```

---

## 🚀 Próximos Pasos

1. Migrar componente por componente siguiendo el orden sugerido
2. Probar cada migración antes de continuar
3. Eliminar archivos antiguos una vez confirmado que todo funciona
4. Actualizar documentación del proyecto

---

## 📚 Referencias

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/vue/overview)
- [Ky Documentation](https://github.com/sindresorhus/ky)
- [Vue Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)

---

**Última actualización**: 2025-01-15grados todos los componentes, eliminar:

```
src/features/*/services/*.js  (servicios antiguos)
src/core/api/axios.js         (cliente axios antiguo)
src/core/api/authService.js   (si existe)
```

---

## 📝 Checklist de Migración por Componente

- [ ] Identificar servicios usados (ej: `userService`)
- [ ] Reemplazar imports de servicios por queries/mutations
- [ ] Eliminar `ref()` para datos y loading
- [ ] Eliminar `onMounted()` para cargas iniciales
- [ ] Reemplazar `try/catch` por `onSuccess/onError`
- [ ] Eliminar llamadas manuales a `loadData()`
- [ ] Probar funcionalidad completa
- [ ] Eliminar archivo de servicio antiguo

---

## 🎯 Orden de Migración Sugerido

1. ✅ Users (ya migrado)
2. Persons
3. Roles
4. Competences
5. Projects
6. Nomenclatives
7. Team Formation
8. Reports
9. Audit

---

## 💡 Tips

- **No mezclar sistemas**: Migra un componente completo, no parcialmente
- **Prueba después de cada migración**: Verifica que todo funcione
- **Usa DevTools**: TanStack Query DevTools para debugging
- **Consulta ejemplos**: Revisa `UserManagement.vue` como referencia
