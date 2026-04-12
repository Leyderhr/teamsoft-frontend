import { nomenclativeConfigs } from '@/features/nomenclatives/config/nomenclatives.config.js'
import GenericNomenclative from '@/features/nomenclatives/views/GenericNomenclative.vue'

function toRouteName(key) {
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}

// Generar rutas dinámicamente desde la configuración (list + create + edit)
export default Object.values(nomenclativeConfigs).flatMap(config => [
  {
    path: `nomenclatives/${config.key}`,
    name: toRouteName(config.key),
    component: GenericNomenclative,
    props: { config },
    meta: { breadcrumb: config.breadcrumb }
  },
  {
    path: `nomenclatives/${config.key}/create`,
    name: `${toRouteName(config.key)}Create`,
    component: () => import('@/shared/components/GenericFormPage.vue'),
    props: {
      mode: 'create',
      fields: config.fields,
      service: config.service,
      title: config.title,
      listRoute: `/nomenclatives/${config.key}`
    },
    meta: { breadcrumb: config.breadcrumb }
  },
  {
    path: `nomenclatives/${config.key}/edit/:id`,
    name: `${toRouteName(config.key)}Edit`,
    component: () => import('@/shared/components/GenericFormPage.vue'),
    props: route => ({
      mode: 'edit',
      fields: config.fields,
      service: config.service,
      title: config.title,
      listRoute: `/nomenclatives/${config.key}`
    }),
    meta: { breadcrumb: config.breadcrumb }
  }
])
