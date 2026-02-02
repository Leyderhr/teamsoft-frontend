import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
    // En PrimeVue 4, el tema se maneja automáticamente
    // Solo necesitamos estado para preferencias de usuario
    const compactMode = ref(false)
    const sidebarCollapsed = ref(false)

    const toggleCompactMode = () => {
        compactMode.value = !compactMode.value
    }

    const toggleSidebar = () => {
        sidebarCollapsed.value = !sidebarCollapsed.value
    }

    return {
        compactMode,
        sidebarCollapsed,
        toggleCompactMode,
        toggleSidebar
    }
})