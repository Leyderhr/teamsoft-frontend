import {createApp} from 'vue'
import App from './App.vue'

// PrimeVue
import PrimeVue from 'primevue/config'
import {ToastService, Tooltip, ConfirmationService, Ripple} from "primevue";

// Tema de PrimeVue
import Aura from '@primeuix/themes/aura';
import 'primeicons/primeicons.css'
// import 'primeflex/primeflex.css'

// Estilos y js globales
import '@/assets/css/content.css'
import '@/assets/css/primefaces-custom.css'
import '@/assets/css/jsfcrud.css'
import '@/assets/css/materialize.min.css'

// import '@/assets/css/cssLayout.css'

// Estilos de ultima layout
import '@/assets/ultima-layout/css/animate.css'
import '@/assets/ultima-layout/css/ripple.css'
import '@/assets/ultima-layout/css/nanoscroller.css'


const app = createApp(App)

app.directive('tooltip', Tooltip)
app.use(PrimeVue, {
    theme: {preset: Aura}
})
app.use(ToastService)
app.mount('#app')
