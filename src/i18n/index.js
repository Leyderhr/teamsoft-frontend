import { createI18n } from 'vue-i18n'

// Español
import esErrors from './es/errors.json'
import esCommon from './es/common.json'
import esFeatures from './es/features.json'

// Inglés
import enErrors from './en/errors.json'
import enCommon from './en/common.json'
import enFeatures from './en/features.json'

export const i18n = createI18n({
  legacy: false, // Requerido en false para Composition API (setup)
  locale: localStorage.getItem('locale') || 'es',
  fallbackLocale: 'es',
  messages: {
    es: {
      errors: esErrors,
      common: esCommon,
      features: esFeatures
    },
    en: {
      errors: enErrors,
      common: enCommon,
      features: enFeatures
    }
  }
})