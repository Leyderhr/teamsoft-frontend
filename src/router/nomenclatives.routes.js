import { nomenclativeConfigs } from '@/config/nomenclatives.config'
import GenericNomenclative from '@/views/nomenclatives/GenericNomenclative.vue'

// Generar rutas dinámicamente desde la configuración
export default Object.values(nomenclativeConfigs).map(config => ({
    path: `nomenclatives/${config.key}`,
    name: config.key.charAt(0).toUpperCase() + config.key.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase()),
    component: GenericNomenclative,
    props: { config },
    meta: {
        breadcrumb: config.breadcrumb
    }
}))
