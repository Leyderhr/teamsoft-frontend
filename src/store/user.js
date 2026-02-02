import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
    const user = ref({
        fullName: 'Usuario Demo',
        identification: '12345',
        roles: ['GESTOR', 'ADMIN'] // Ejemplo
    })

    const isAuthenticated = computed(() => !!user.value.identification)

    const logout = async () => {
        // Lógica de logout
        user.value = null
        localStorage.removeItem('token')
        // Puedes redirigir desde el componente
    }

    const hasAnyRole = (roles) => {
        if (!user.value?.roles) return false
        const roleArray = Array.isArray(roles) ? roles : roles.split(',')
        return roleArray.some(role => user.value.roles.includes(role.trim()))
    }

    return {
        user,
        isAuthenticated,
        logout,
        hasAnyRole
    }
})