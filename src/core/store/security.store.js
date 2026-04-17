import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAuthStore } from './authStore.js'

export const useSecurityStore = defineStore('security', () => {
    const authStore = useAuthStore()

    // Helper function para verificar roles directamente desde user.value
    const checkRole = (role) => {
        return authStore.user?.authorities?.includes(role) ?? false
    }

    const checkAnyRole = (rolesParam) => {
        if (!authStore.user?.authorities) return false
        const roleArray = Array.isArray(rolesParam) ? rolesParam : rolesParam.split(',').map(r => r.trim())
        return roleArray.some(role => authStore.user.authorities.includes(role))
    }

    const ifAnyGranteds = (rolesString) => {
        return checkAnyRole(rolesString)
    }

    // Roles específicos como computed properties que leen DIRECTAMENTE de authStore.user
    const isGestor = computed(() => checkRole('ROLE_GESTOR_RRHH'))
    const isAdmin = computed(() => checkRole('ROLE_ADMIN'))
    const isDirectivoTecnico = computed(() => checkRole('ROLE_DIRECTIVO_TECNICO'))
    const isExperimentador = computed(() => checkRole('ROLE_EXPERIMENTADOR'))
    const isJefeEquipo = computed(() => checkRole('ROLE_JEFE_DE_EQUIPO'))
    const isWorker = computed(() => checkRole('ROLE_WORKER'))

    return {
        ifAnyGranteds,
        isGestor,
        isAdmin,
        isDirectivoTecnico,
        isExperimentador,
        isJefeEquipo,
        isWorker
    }
})