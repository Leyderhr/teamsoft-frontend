<script setup>
import {ref, watch} from 'vue'
import {useRoute} from 'vue-router'
import Breadcrumb from 'primevue/breadcrumb'

const route = useRoute()
const items = ref([])
const home = ref({
  icon: 'pi pi-home',
  to: '/'
})

// Actualizar breadcrumb basado en la ruta actual
const updateBreadcrumb = () => {
  const breadcrumbs = []

  // Agregar home si no es la página principal
  if (route.path !== '/') {
    breadcrumbs.push({label: 'Inicio', to: '/'})
  }

  // Agregar partes de la ruta
  route.matched.forEach(match => {
    if (match.meta?.breadcrumb) {
      breadcrumbs.push({
        label: match.meta.breadcrumb,
        to: match.path
      })
    }
  })

  // Agregar la página actual (sin link)
  if (route.meta?.title) {
    breadcrumbs.push({
      label: route.meta.title,
      to: null
    })
  }

  items.value = breadcrumbs
}

// Observar cambios en la ruta
watch(() => route.path, updateBreadcrumb, {immediate: true})

// Exponer método para actualizar manualmente
defineExpose({updateBreadcrumb})
</script>

<template>
  <template>
    <nav class="breadcrumb-nav p-3 surface-ground">
      <Breadcrumb :home="home" :model="items">
        <template #item="{ item }">
          <router-link
              v-if="item.to"
              :to="item.to"
              class="text-color hover:text-primary no-underline"
          >
            {{ item.label }}
          </router-link>
          <span v-else class="text-color">
          {{ item.label }}
        </span>
        </template>
      </Breadcrumb>
    </nav>
  </template>
</template>

<style scoped>
.breadcrumb-nav {
  border-bottom: 1px solid #e0e0e0;
}
</style>