import {createApp} from 'vue'
import App from './App.vue'
import router from './core/router'
import {createPinia} from "pinia";

// PrimeVue
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'

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
app.use(router)
app.use(pinia)
app.mount('#app')
