import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAuthStore } from './authStore.js'

export const useSecurityStore = defineStore('security', () => {
    const authStore = useAuthStore()

    const ifAnyGranteds = (rolesString) => {
        return authStore.hasAnyRole(rolesString)
    }

    // Roles específicos como computed properties que leen directamente de authStore
    const isGestor = computed(() => authStore.hasAnyRole('ROLE_GESTOR_RRHH'))
    const isAdmin = computed(() => authStore.hasAnyRole('ROLE_ADMIN'))
    const isDirectivoTecnico = computed(() => authStore.hasAnyRole('ROLE_DIRECTIVO_TECNICO'))
    const isExperimentador = computed(() => authStore.hasAnyRole('ROLE_EXPERIMENTADOR'))
    const isJefeEquipo = computed(() => authStore.hasAnyRole('ROLE_JEFE_DE_EQUIPO'))
    const isWorker = computed(() => authStore.hasAnyRole('ROLE_WORKER'))

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