import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import {createPinia} from "pinia";

// PrimeVue
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Tooltip from 'primevue/tooltip'

// Tema de PrimeVue
//import Lara from '@primeuix/themes/lara' //Por si queremos usar otro tema
import Material from '@primeuix/themes/material';

import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css'

// Estilos de ultima layout
import '@/assets/ultima-layout/css/animate.css'
import '@/assets/ultima-layout/css/ripple.css'
import '@/assets/ultima-layout/css/nanoscroller.css'

// Estilos y js globales
import '@/assets/css/materialize.min.css'
// import '@/assets/css/cssLayout.css'




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
app.mount('#app')
