import { defineStore } from 'pinia'
import { ref } from 'vue'
import { i18n } from '@/i18n' // <--- Importamos la instancia

export const useLocaleStore = defineStore('locale', () => {
    const currentLanguage = ref(localStorage.getItem('locale') || 'es')
    const availableLanguages = [
        { code: 'es', name: 'Español' },
        { code: 'en', name: 'English' }
    ]

    const setLanguage = (langCode) => {
        if (availableLanguages.some(lang => lang.code === langCode)) {
            currentLanguage.value = langCode
            localStorage.setItem('locale', langCode)
            
            // Sincroniza la librería i18n con la nueva selección
            i18n.global.locale.value = langCode 
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