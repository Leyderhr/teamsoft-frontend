# 🚀 Migración Sistema de Fetching - TeamSoft Frontend

## 📚 Documentación Completa

Este proyecto está en proceso de migración del sistema antiguo basado en **Axios** al nuevo sistema basado en **Ky + TanStack Query**.

### 📖 Archivos de Documentación

| Archivo | Descripción | Cuándo Usar |
|---------|-------------|-------------|
| **MIGRATION_GUIDE.md** | Guía completa de migración con patrones y ejemplos | Leer primero, referencia principal |
| **MIGRATION_STATUS.md** | Estado actual de la migración y módulos completados | Ver progreso general |
| **MIGRATION_CHECKLIST.md** | Checklist detallado por componente y módulo | Durante la migración de cada componente |
| **EXAMPLES.md** | Ejemplos prácticos de uso para cada módulo | Consultar al implementar funcionalidades |
| **API_DOCUMENTATION.md** | Documentación de endpoints del backend | Referencia de API |
| **easysalon-fetching-guide.md** | Guía del patrón usado (referencia externa) | Entender arquitectura base |

---

## 🎯 Quick Start

### 1. Lee la Guía Principal
```bash
# Leer primero
MIGRATION_GUIDE.md
```

### 2. Verifica el Estado
```bash
# Ver qué está migrado
MIGRATION_STATUS.md
```

### 3. Migra un Componente
```bash
# Usa el checklist
MIGRATION_CHECKLIST.md

# Consulta ejemplos
EXAMPLES.md
```

---

## ✅ Sistema Nuevo (Ky + TanStack Query)

### Ventajas

1. **Menos código** - 60% menos boilerplate
2. **Cache automático** - Datos cacheados inteligentemente
3. **Revalidación automática** - Actualiza cuando cambian
4. **Estados integrados** - `isLoading`, `isError` automáticos
5. **Refresh token automático** - Manejo transparente
6. **Retry automático** - Reintenta requests fallidos
7. **Deduplicación** - Evita requests duplicados

### Ejemplo Rápido

**Antes (Axios):**
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

onMounted(() => loadUsers())
</script>
```

**Después (Ky + TanStack Query):**
```vue
<script setup>
import { useUsers } from '@/services/users/queries'

const { data: users, isLoading: loading } = useUsers()
</script>
```

---

## 📦 Módulos Disponibles

Todos los servicios están listos en `src/services/`:

1. ✅ **Users** - Gestión de usuarios
2. ✅ **Persons** - Gestión de personas
3. ✅ **Roles** - Gestión de roles (con import/export)
4. ✅ **Competences** - Gestión de competencias (con import/export)
5. ✅ **Projects** - Gestión de proyectos
6. ✅ **Nomenclatives** - 14 nomenclativos CRUD
7. ✅ **Team Formation** - Formación de equipos
8. ✅ **Reports** - Generación de reportes
9. ✅ **Audit** - Logs de auditoría

---

## 🔄 Patrón de Migración

### Queries (GET)
```javascript
// Antiguo
const data = ref([])
const loading = ref(false)
onMounted(async () => {
  loading.value = true
  data.value = await service.getAll()
  loading.value = false
})

// Nuevo
const { data, isLoading: loading } = useQuery()
```

### Mutations (POST/PUT/DELETE)
```javascript
// Antiguo
const handleCreate = async (formData) => {
  loading.value = true
  try {
    await service.create(formData)
    toast.add({ severity: 'success', summary: 'Creado' })
    await loadData()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error' })
  } finally {
    loading.value = false
  }
}

// Nuevo
const createMutation = useCreateMutation()
const handleCreate = (formData) => {
  createMutation.mutate(formData, {
    onSuccess: () => {
      toast.add({ severity: 'success', summary: 'Creado' })
    },
    onError: (error) => {
      toast.add({ severity: 'error', summary: 'Error' })
    }
  })
}
```

---

## 🎯 Orden de Migración

### Fase 1: Módulos Simples ✅
1. Users (completado)
2. Nomenclatives (siguiente)

### Fase 2: Módulos Intermedios
3. Roles
4. Competences
5. Projects

### Fase 3: Módulos Complejos
6. Persons
7. Team Formation

### Fase 4: Módulos de Soporte
8. Reports
9. Audit

---

## 🛠️ Herramientas

### TanStack Query DevTools

Instalar en `main.js`:
```javascript
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
app.component('VueQueryDevtools', VueQueryDevtools)
```

Usar en `App.vue`:
```vue
<template>
  <RouterView />
  <VueQueryDevtools />
</template>
```

---

## 📊 Progreso Actual

- **Servicios migrados**: 9/9 (100%)
- **Componentes migrados**: 1/50+ (2%)
- **Módulos completados**: 1/9 (11%)

---

## 🚨 Importante

### ❌ NO Hacer
- No mezclar sistemas (antiguo y nuevo) en el mismo componente
- No migrar parcialmente un componente
- No eliminar servicios antiguos hasta migrar todos los componentes que los usan

### ✅ SÍ Hacer
- Migrar un componente completo a la vez
- Probar después de cada migración
- Usar UserManagement.vue como referencia
- Consultar EXAMPLES.md para cada módulo
- Seguir el checklist en MIGRATION_CHECKLIST.md

---

## 📞 Soporte

Si tienes dudas durante la migración:

1. Consulta **MIGRATION_GUIDE.md** - Guía completa
2. Revisa **EXAMPLES.md** - Ejemplos prácticos
3. Usa **MIGRATION_CHECKLIST.md** - Checklist paso a paso
4. Inspecciona **UserManagement.vue** - Ejemplo completo migrado

---

## 📝 Notas

- Todos los servicios nuevos están en `src/services/`
- Los servicios antiguos están en `src/features/*/services/`
- No eliminar servicios antiguos hasta completar migración
- TanStack Query maneja automáticamente cache, revalidación y retry

---

**Última actualización**: 2025-01-15
**Versión**: 1.0.0
