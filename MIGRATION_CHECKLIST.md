# ✅ Checklist de Migración de Componentes

## 📋 Checklist General por Componente

### Antes de Empezar
- [ ] Leer MIGRATION_GUIDE.md completo
- [ ] Revisar EXAMPLES.md para el módulo específico
- [ ] Identificar todos los servicios usados en el componente
- [ ] Hacer backup del componente original

### Durante la Migración

#### 1. Imports
- [ ] Eliminar `import someService from '@/features/*/services/*'`
- [ ] Agregar `import { useQuery } from '@/services/*/queries'`
- [ ] Agregar `import { useMutation } from '@/services/*/mutations'`
- [ ] Eliminar imports innecesarios de Vue (`ref`, `onMounted` si ya no se usan)

#### 2. Estado Reactivo
- [ ] Eliminar `const data = ref([])`
- [ ] Eliminar `const loading = ref(false)`
- [ ] Eliminar `const error = ref(null)`
- [ ] Reemplazar con `const { data, isLoading, isError } = useQuery()`

#### 3. Lifecycle Hooks
- [ ] Eliminar `onMounted(() => loadData())`
- [ ] Eliminar funciones `loadData()` manuales
- [ ] Verificar que queries se ejecuten automáticamente

#### 4. Operaciones CRUD
- [ ] Reemplazar `await service.create()` con `mutation.mutate()`
- [ ] Reemplazar `await service.update()` con `mutation.mutate()`
- [ ] Reemplazar `await service.delete()` con `mutation.mutate()`
- [ ] Eliminar bloques `try/catch` manuales
- [ ] Agregar `onSuccess/onError` en mutations

#### 5. Manejo de Errores
- [ ] Eliminar `try/catch` manual
- [ ] Usar `onError` en mutations
- [ ] Usar `isError` de queries
- [ ] Mantener toasts/notificaciones en `onSuccess/onError`

#### 6. Recarga de Datos
- [ ] Eliminar llamadas manuales a `loadData()`
- [ ] Verificar que TanStack Query invalide automáticamente
- [ ] Usar `refetch()` solo si es necesario (casos especiales)

### Después de la Migración

#### 7. Testing
- [ ] Probar carga inicial de datos
- [ ] Probar creación de registros
- [ ] Probar actualización de registros
- [ ] Probar eliminación de registros
- [ ] Probar estados de loading
- [ ] Probar manejo de errores
- [ ] Probar filtros (si aplica)
- [ ] Probar paginación (si aplica)

#### 8. Limpieza
- [ ] Eliminar código comentado
- [ ] Eliminar imports no usados
- [ ] Eliminar funciones helper innecesarias
- [ ] Verificar que no queden `ref()` innecesarios

#### 9. Documentación
- [ ] Marcar componente como migrado en este checklist
- [ ] Actualizar comentarios si es necesario
- [ ] Documentar cambios significativos

---

## 📦 Checklist por Módulo

### 1. Users Module

#### Componentes a Migrar
- [ ] `UserManagement.vue` ✅ (ya migrado)
- [ ] `UserForm.vue`
- [ ] `UserDetail.vue`

#### Servicios Antiguos a Eliminar
- [ ] `src/features/users/services/userService.js`

---

### 2. Persons Module

#### Componentes a Migrar
- [ ] `PersonManagement.vue`
- [ ] `PersonForm.vue`
- [ ] `PersonDetail.vue`
- [ ] `PersonCompetences.vue`
- [ ] `PersonConflicts.vue`

#### Servicios Antiguos a Eliminar
- [ ] `src/features/persons/services/personService.js`

---

### 3. Roles Module

#### Componentes a Migrar
- [ ] `RoleManagement.vue`
- [ ] `RoleForm.vue`
- [ ] `RoleDetail.vue`
- [ ] `RoleCompetences.vue`
- [ ] `RoleImport.vue`

#### Servicios Antiguos a Eliminar
- [ ] `src/features/roles/services/roleService.js`

---

### 4. Competences Module

#### Componentes a Migrar
- [ ] `CompetenceManagement.vue`
- [ ] `CompetenceForm.vue`
- [ ] `CompetenceDetail.vue`
- [ ] `CompetenceImport.vue`

#### Servicios Antiguos a Eliminar
- [ ] `src/features/competences/services/competenceService.js`

---

### 5. Projects Module

#### Componentes a Migrar
- [ ] `ProjectManagement.vue`
- [ ] `ProjectForm.vue`
- [ ] `ProjectDetail.vue`
- [ ] `ProjectList.vue`

#### Servicios Antiguos a Eliminar
- [ ] `src/features/projects/services/projectService.js`

---

### 6. Nomenclatives Module

#### Componentes a Migrar
- [ ] `ClientManagement.vue`
- [ ] `AgeGroupManagement.vue`
- [ ] `CompetenceImportanceManagement.vue`
- [ ] `ConflictIndexManagement.vue`
- [ ] `CostDistanceManagement.vue`
- [ ] `CountyManagement.vue`
- [ ] `LevelManagement.vue`
- [ ] `NacionalityManagement.vue`
- [ ] `PersonGroupManagement.vue`
- [ ] `ProjectStructureManagement.vue`
- [ ] `RaceManagement.vue`
- [ ] `ReligionManagement.vue`
- [ ] `RoleEvaluationManagement.vue`
- [ ] `RoleLoadManagement.vue`

#### Servicios Antiguos a Eliminar
- [ ] `src/features/nomenclatives/services/*.js`

---

### 7. Team Formation Module

#### Componentes a Migrar
- [ ] `TeamFormation.vue`
- [ ] `TeamFormationConfig.vue`
- [ ] `TeamFormationResults.vue`
- [ ] `TeamFormationSave.vue`

#### Servicios Antiguos a Eliminar
- [ ] `src/features/team-formation/services/teamFormationService.js`

---

### 8. Reports Module

#### Componentes a Migrar
- [ ] `ReportList.vue`
- [ ] `ReportGenerate.vue`
- [ ] `ReportDetail.vue`
- [ ] `ReportExport.vue`

#### Servicios Antiguos a Eliminar
- [ ] `src/features/reports/services/reportService.js`

---

### 9. Audit Module

#### Componentes a Migrar
- [ ] `AuditLogs.vue`
- [ ] `AuditLogDetail.vue`
- [ ] `AuditFilters.vue`

#### Servicios Antiguos a Eliminar
- [ ] `src/features/audit/services/auditService.js`

---

## 🎯 Orden de Migración Recomendado

### Fase 1: Módulos Simples (1-2 días)
1. ✅ Users (ya migrado)
2. Nomenclatives (CRUD simple, sin relaciones complejas)

### Fase 2: Módulos Intermedios (2-3 días)
3. Roles (con import/export)
4. Competences (con import/export)
5. Projects

### Fase 3: Módulos Complejos (3-4 días)
6. Persons (muchas relaciones)
7. Team Formation (lógica compleja)

### Fase 4: Módulos de Soporte (1-2 días)
8. Reports
9. Audit

---

## 🔍 Verificación Final

### Por Componente
- [ ] No hay imports de servicios antiguos
- [ ] No hay `ref()` para datos que vienen de queries
- [ ] No hay `onMounted()` para cargar datos
- [ ] No hay `try/catch` manual para operaciones CRUD
- [ ] Todas las mutations usan `onSuccess/onError`
- [ ] Estados de loading usan `isLoading` de queries/mutations
- [ ] Componente funciona correctamente

### Por Módulo
- [ ] Todos los componentes migrados
- [ ] Servicios antiguos eliminados
- [ ] Tests pasando (si existen)
- [ ] No hay regresiones

### Global
- [ ] Todos los módulos migrados
- [ ] `src/features/*/services/` eliminado
- [ ] `src/core/api/axios.js` eliminado
- [ ] TanStack Query DevTools funcionando
- [ ] Documentación actualizada

---

## 📊 Progreso

### Resumen
- **Total de módulos**: 9
- **Módulos completados**: 9 (Users, Persons, Roles, Competences, Projects, Nomenclatives, Team Formation, Reports, Audit)
- **Progreso**: 100%

### Por Módulo
- ✅ Users: 100%
- ✅ Persons: 100%
- ✅ Roles: 100%
- ✅ Competences: 100%
- ✅ Projects: 100%
- ✅ Nomenclatives: 100%
- ✅ Team Formation: 100%
- ✅ Reports: 100% (sin componentes que migrar)
- ✅ Audit: 100% (sin componentes que migrar)

---

## 💡 Tips para Migración Eficiente

1. **Migra un componente completo a la vez** - No dejes componentes a medio migrar
2. **Prueba después de cada componente** - No acumules cambios sin probar
3. **Usa UserManagement.vue como referencia** - Es el ejemplo completo
4. **Consulta EXAMPLES.md** - Tiene ejemplos para cada módulo
5. **Usa TanStack Query DevTools** - Para debugging en tiempo real
6. **No mezcles patrones** - O todo antiguo o todo nuevo, nunca mezclado

---

**Última actualización**: 2025-01-15
