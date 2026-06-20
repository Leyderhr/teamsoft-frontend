import { createI18n } from 'vue-i18n'

// Español
import esErrors from './es/errors.json'
import esCommon from './es/common.json'
import esFeatures from './es/features.json'
import esMenu from './es/menu.json'

// Inglés
import enErrors from './en/errors.json'
import enCommon from './en/common.json'
import enFeatures from './en/features.json'
import enMenu from './en/menu.json'

export const i18n = createI18n({
  legacy: false, // Requerido en false para Composition API (setup)
  locale: localStorage.getItem('locale') || 'es',
  fallbackLocale: 'es',
  messages: {
    es: {
      errors: esErrors,
      common: esCommon,
      features: esFeatures,
      menu: esMenu
    },
    en: {
      errors: enErrors,
      common: enCommon,
      features: enFeatures,
      menu: enMenu
    }
  }
})