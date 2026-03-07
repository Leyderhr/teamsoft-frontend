import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLocaleStore = defineStore('locale', () => {
    const currentLanguage = ref('es')
    const availableLanguages = [
        { code: 'es', name: 'Español' },
        { code: 'en', name: 'English' }
    ]

    const setLanguage = (langCode) => {
        if (availableLanguages.some(lang => lang.code === langCode)) {
            currentLanguage.value = langCode
            localStorage.setItem('locale', langCode)
            // Aquí podrías cargar los mensajes de idioma
        }
    }

    // Cargar idioma guardado
    const loadSavedLanguage = () => {
        const saved = localStorage.getItem('locale')
        if (saved) setLanguage(saved)
    }

    return {
        currentLanguage,
        availableLanguages,
        setLanguage,
        loadSavedLanguage
    }
})