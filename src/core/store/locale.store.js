import { defineStore } from 'pinia'
import { ref } from 'vue'
import { i18n } from '@/i18n' 

export const useLocaleStore = defineStore('locale', () => {
    // Lógica para obtener el idioma inicial (LocalStorage o Navegador)
    const getInitialLanguage = () => {
        const saved = localStorage.getItem('locale')
        if (saved) return saved
        
        // Detecta el idioma del navegador (ej. 'es-ES' -> 'es')
        const browserLang = navigator.language?.split('-')[0]
        return (browserLang === 'es' || browserLang === 'en') ? browserLang : 'es'
    }

    const currentLanguage = ref(getInitialLanguage())
    const availableLanguages = [
        { code: 'es', name: 'Español' },
        { code: 'en', name: 'English' }
    ]

    const setLanguage = (langCode) => {
        if (availableLanguages.some(lang => lang.code === langCode)) {
            currentLanguage.value = langCode
            localStorage.setItem('locale', langCode)
            
            // Sincroniza i18n
            i18n.global.locale.value = langCode 
        }
    }

    const loadSavedLanguage = () => {
        setLanguage(getInitialLanguage())
    }

    return {
        currentLanguage,
        availableLanguages,
        setLanguage,
        loadSavedLanguage
    }
})