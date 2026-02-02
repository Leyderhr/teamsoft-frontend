import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useUserStore } from './user'

export const useSecurityStore = defineStore('security', () => {
    const userStore = useUserStore()

    const ifAnyGranteds = (rolesString) => {
        return userStore.hasAnyRole(rolesString)
    }

    // Roles específicos como computed properties
    const isGestor = computed(() => userStore.hasAnyRole('GESTOR'))
    const isAdmin = computed(() => userStore.hasAnyRole('ADMIN'))
    const isDirectivoTecnico = computed(() => userStore.hasAnyRole('DIRECTIVOTECNICO'))
    const isExperimentador = computed(() => userStore.hasAnyRole('EXPERIMENTADOR'))
    const isJefeEquipo = computed(() => userStore.hasAnyRole('JEFE_EQUIPO'))

    return {
        ifAnyGranteds,
        isGestor,
        isAdmin,
        isDirectivoTecnico,
        isExperimentador,
        isJefeEquipo
    }
})