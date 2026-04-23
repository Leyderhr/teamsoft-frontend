# 📚 Guía de Uso - Módulos TeamSoft Frontend

## 🎯 Módulos Implementados

### ✅ 1. Users (Usuarios)
### ✅ 2. Persons (Personas)
### ✅ 3. Roles
### ✅ 4. Competences (Competencias)
### ✅ 5. Projects (Proyectos)
### ✅ 6. Nomenclatives (Catálogos)
### ✅ 7. Team Formation (Formación de Equipos)
### ✅ 8. Permissions (Permisos)

---

## 📖 Ejemplos de Uso

### 1️⃣ Users

```vue
<script setup>
import { useUsers } from '@/composables/useUsers'
import { ref } from 'vue'

const { 
  users, 
  isLoadingUsers, 
  createUser, 
  isCreatingUser,
  deleteUser,
  resetPassword
} = useUsers()

const newUser = ref({
  personName: '',
  surname: '',
  card: '',
  mail: '',
  enabled: true,
  roleIds: []
})

const handleCreate = () => {
  createUser(newUser.value, {
    onSuccess: () => {
      console.log('Usuario creado exitosamente')
    },
    onError: (error) => {
      console.error('Error al crear usuario:', error)
    }
  })
}

const handleDelete = (userId) => {
  deleteUser(userId)
}

const handleResetPassword = (userId) => {
  resetPassword(userId)
}
</script>

<template>
  <div v-if="isLoadingUsers">Cargando usuarios...</div>
  <div v-else>
    <ul>
      <li v-for="user in users" :key="user.id">
        {{ user.personName }} {{ user.surname }}
        <button @click="handleDelete(user.id)">Eliminar</button>
        <button @click="handleResetPassword(user.id)">Resetear Contraseña</button>
      </li>
    </ul>
  </div>
</template>
```

---

### 2️⃣ Persons

```vue
<script setup>
import { usePersons } from '@/composables/usePersons'

const { 
  persons, 
  isLoading, 
  createPerson, 
  updatePerson,
  deletePerson 
} = usePersons()

const handleCreate = (personData) => {
  createPerson(personData, {
    onSuccess: () => {
      console.log('Persona creada')
    }
  })
}
</script>
```

---

### 3️⃣ Roles

```vue
<script setup>
import { useRoles } from '@/composables/useRoles'

const { 
  roles, 
  isLoading, 
  createRole,
  importRoles,
  exportRoles
} = useRoles()

const handleImport = (file) => {
  importRoles({ file, updateIfExist: false })
}

const handleExport = async () => {
  const blob = await exportRoles()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'roles.csv'
  a.click()
}
</script>
```

---

### 4️⃣ Competences

```vue
<script setup>
import { useCompetences } from '@/composables/useCompetences'

const { 
  competences, 
  isLoading, 
  createCompetence,
  importCompetences,
  exportCompetences
} = useCompetences()
</script>
```

---

### 5️⃣ Projects

```vue
<script setup>
import { useProjects } from '@/composables/useProjects'

const { 
  projects, 
  isLoading, 
  createProjects,
  closeProject,
  deleteProject
} = useProjects()

const handleClose = (projectId) => {
  closeProject(projectId, {
    onSuccess: () => {
      console.log('Proyecto cerrado')
    }
  })
}
</script>
```

---

### 6️⃣ Nomenclatives (Catálogos)

```vue
<script setup>
import { useNomenclative } from '@/composables/useNomenclative'
import {
  fetchGetClients,
  fetchCreateClient,
  fetchUpdateClient,
  fetchDeleteClient
} from '@/services/nomenclatives'

const { 
  data: clients, 
  isLoading, 
  create: createClient,
  update: updateClient,
  remove: deleteClient
} = useNomenclative(
  'clients',
  fetchGetClients,
  fetchCreateClient,
  fetchUpdateClient,
  fetchDeleteClient
)
</script>
```

**Otros nomenclativos disponibles:**
- `ageGroups` - Grupos de edad
- `competenceImportance` - Importancia de competencias
- `conflictIndex` - Índices de conflicto
- `costDistance` - Costo/Distancia
- `county` - Provincias
- `levels` - Niveles
- `nacionality` - Nacionalidades
- `personGroups` - Grupos de personas
- `projectStructure` - Estructuras de proyecto
- `race` - Razas
- `religion` - Religiones
- `roleEvaluation` - Evaluación de roles
- `roleLoad` - Carga de roles

---

### 7️⃣ Team Formation

```vue
<script setup>
import { useTeamFormation } from '@/composables/useTeamFormation'
import { ref } from 'vue'

const { 
  generateTeams, 
  isGenerating, 
  generatedTeams,
  saveTeams,
  isSaving
} = useTeamFormation()

const formationParams = ref({
  teamFormationParameters: {
    groupList: [],
    confRole: true,
    maximunRoles: 3,
    // ... más parámetros
  },
  projectsIDs: [1, 2, 3],
  groupIDs: [1, 2]
})

const handleGenerate = () => {
  generateTeams(formationParams.value, {
    onSuccess: (teams) => {
      console.log('Equipos generados:', teams)
    }
  })
}

const handleSave = () => {
  saveTeams({
    proposalName: 'Propuesta 2024',
    projects: generatedTeams.value
  })
}
</script>
```

---

### 8️⃣ Permissions

```vue
<script setup>
import { usePermissions } from '@/composables/usePermissions'

const { 
  isAdmin,
  isGestorRRHH,
  canManageUsers,
  canManagePersons,
  canManageProjects,
  hasRole,
  hasAnyRole
} = usePermissions()
</script>

<template>
  <div v-if="canManageUsers">
    <h2>Gestión de Usuarios</h2>
    <!-- Solo visible para ADMIN -->
  </div>

  <div v-if="canManagePersons">
    <h2>Gestión de Personas</h2>
    <!-- Solo visible para GESTOR_RRHH -->
  </div>

  <div v-if="canManageProjects">
    <h2>Gestión de Proyectos</h2>
    <!-- Visible para EXPERIMENTADOR o DIRECTIVO_TECNICO -->
  </div>

  <button v-if="hasRole('ROLE_ADMIN')">
    Acción solo para Admin
  </button>

  <button v-if="hasAnyRole(['ROLE_EXPERIMENTADOR', 'ROLE_DIRECTIVO_TECNICO'])">
    Acción para Experimentador o Directivo
  </button>
</template>
```

---

## 🔐 Roles Disponibles

| Rol | Constante | Permisos |
|-----|-----------|----------|
| Administrador | `ROLE_ADMIN` | Gestión de usuarios |
| Gestor RRHH | `ROLE_GESTOR_RRHH` | Personas, roles, competencias |
| Directivo Técnico | `ROLE_DIRECTIVO_TECNICO` | Proyectos, formación de equipos |
| Experimentador | `ROLE_EXPERIMENTADOR` | Proyectos, formación de equipos |
| Worker | `ROLE_WORKER` | Acceso básico |
| Jefe de Equipo | `ROLE_JEFE_DE_EQUIPO` | Gestión de equipo |

---

## 🚀 Patrón de Uso General

Todos los composables siguen el mismo patrón:

```javascript
const {
  // Data
  data,           // Datos obtenidos
  isLoading,      // Estado de carga
  error,          // Error si existe
  refetch,        // Función para recargar datos
  
  // Mutations
  create,         // Función para crear
  isCreating,     // Estado de creación
  update,         // Función para actualizar
  isUpdating,     // Estado de actualización
  remove,         // Función para eliminar
  isDeleting      // Estado de eliminación
} = useModule()
```

---

## 📦 Estructura de Archivos

```
src/
├── services/
│   ├── users/
│   │   ├── types.js
│   │   ├── get-users.js
│   │   ├── create-user.js
│   │   ├── update-user.js
│   │   ├── delete-user.js
│   │   └── index.js
│   ├── persons/
│   ├── roles/
│   ├── competences/
│   ├── projects/
│   ├── nomenclatives/
│   └── team-formation/
└── composables/
    ├── useUsers.js
    ├── usePersons.js
    ├── useRoles.js
    ├── useCompetences.js
    ├── useProjects.js
    ├── useNomenclative.js
    ├── useTeamFormation.js
    └── usePermissions.js
```

---

## ✅ Checklist de Implementación

- [x] Sistema de autenticación con JWT
- [x] Refresh token automático
- [x] Módulo Users (CRUD completo)
- [x] Módulo Persons (CRUD completo)
- [x] Módulo Roles (CRUD + import/export)
- [x] Módulo Competences (CRUD + import/export)
- [x] Módulo Projects (CRUD + close)
- [x] Módulo Nomenclatives (14 catálogos)
- [x] Módulo Team Formation
- [x] Sistema de permisos por roles
- [x] Manejo de errores centralizado
- [x] TanStack Query para cache y estado

---

## 🎯 Próximos Pasos

1. Crear páginas Vue para cada módulo
2. Implementar formularios de creación/edición
3. Agregar tablas con paginación
4. Implementar búsqueda y filtros
5. Agregar validaciones de formularios
6. Implementar notificaciones toast
7. Agregar confirmaciones de eliminación
8. Implementar guards de rutas por permisos
