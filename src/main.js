import {createApp} from 'vue'
import App from './App.vue'
import router from './core/router'
import { i18n } from './i18n'
import {createPinia} from "pinia";
import { VueQueryPlugin } from '@tanstack/vue-query'
import { queryClient } from './lib/query-client'
import { useAuthStore } from './lib/auth-store'

// PrimeVue
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'
import ConfirmationService from 'primevue/confirmationservice'

// Tema de PrimeVue
import Material from '@primeuix/themes/material';

import 'primeicons/primeicons.css';
import './style.css'




const app = createApp(App)
const pinia = createPinia()

app.directive('tooltip', Tooltip)
app.use(PrimeVue, {
    ripple: true,
    inputStyle: 'outlined', // o 'filled'
    theme: {
        preset: Material, // 🎨 ¡Aquí está la clave!
        options: {
            darkModeSelector: false, // Configura esto si necesitas modo oscuro
            cssLayer: false
        }
    }
})
app.use(ToastService)
app.use(ConfirmationService)
app.use(router)
app.use(pinia)
app.use(VueQueryPlugin, { queryClient })

app.use(i18n)

// Inicializar auth store desde localStorage
const authStore = useAuthStore()
authStore.initFromStorage()

app.mount('#app')
