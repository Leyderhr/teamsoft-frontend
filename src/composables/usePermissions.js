import { computed } from 'vue'
import { useAuthStore } from '@/lib/auth-store'

/**
 * Composable para verificar permisos basados en roles
 */
export function usePermissions() {
  const authStore = useAuthStore()

  const hasRole = (role) => {
    return authStore.user?.authorities?.includes(role) || false
  }

  const hasAnyRole = (roles) => {
    return roles.some(role => hasRole(role))
  }

  const hasAllRoles = (roles) => {
    return roles.every(role => hasRole(role))
  }

  // Roles específicos
  const isAdmin = computed(() => hasRole('ROLE_ADMIN'))
  const isGestorRRHH = computed(() => hasRole('ROLE_GESTOR_RRHH'))
  const isDirectivoTecnico = computed(() => hasRole('ROLE_DIRECTIVO_TECNICO'))
  const isExperimentador = computed(() => hasRole('ROLE_EXPERIMENTADOR'))
  const isWorker = computed(() => hasRole('ROLE_WORKER'))
  const isJefeDeEquipo = computed(() => hasRole('ROLE_JEFE_DE_EQUIPO'))

  // Permisos por módulo
  const canManageUsers = computed(() => isAdmin.value)
  const canManagePersons = computed(() => isGestorRRHH.value)
  const canManageRoles = computed(() => isGestorRRHH.value)
  const canManageCompetences = computed(() => isGestorRRHH.value)
  const canManageProjects = computed(() => 
    isExperimentador.value || isDirectivoTecnico.value
  )
  const canFormTeams = computed(() => 
    isExperimentador.value || isDirectivoTecnico.value
  )

  return {
    hasRole,
    hasAnyRole,
    hasAllRoles,
    
    // Roles
    isAdmin,
    isGestorRRHH,
    isDirectivoTecnico,
    isExperimentador,
    isWorker,
    isJefeDeEquipo,
    
    // Permisos
    canManageUsers,
    canManagePersons,
    canManageRoles,
    canManageCompetences,
    canManageProjects,
    canFormTeams
  }
}
