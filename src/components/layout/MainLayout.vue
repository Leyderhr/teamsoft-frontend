<script setup>
import { ref, onMounted } from 'vue'
import { useLocaleStore } from '@/store/locale'
import Toast from 'primevue/toast'
import AppLoading from '@/components/layout/AppLoading.vue'
import Topbar from '@/components/layout/Topbar.vue'
import Menu from '@/components/layout/Menu.vue'
import Breadcrumb from './Breadcrumb.vue'


const localeStore = useLocaleStore()
const menuCollapsed = ref(false)

onMounted(() => {
  localeStore.loadSavedLanguage()
})

const toggleMenu = () => {
  menuCollapsed.value = !menuCollapsed.value
}
</script>

<template>
  <Toast position="top-right" />
  <AppLoading />

  <div class="flex flex-column min-h-screen">
    <!-- Topbar fija -->
    <Topbar @toggle-menu="toggleMenu" class="fixed top-0 left-0 w-full z-5" />

    <!-- Contenedor principal -->
    <div class="flex flex-row flex-1 pt-16">
      <!-- Menú lateral (oculto en móvil) -->
      <Menu
          :class="{ 'hidden lg:block': menuCollapsed, 'block': !menuCollapsed }"
          class="fixed lg:relative h-screen z-4"
          :collapsed="menuCollapsed"
      />

      <!-- Contenido principal -->
      <main class="flex-1 p-4 lg:ml-64 transition-all duration-300" :class="{ 'lg:ml-16': menuCollapsed }">
        <Breadcrumb class="mb-4" />

        <router-view />
      </main>
    </div>
  </div>
</template>
<style scoped>
.transition-all {
  margin-top: 70px;
  transition-property: all;
}
.duration-300 {
  transition-duration: 300ms;
}

/* Ajustes responsive */
@media (max-width: 1024px) {
  .lg\:ml-64, .lg\:ml-16 {
    margin-left: 0 !important;
  }
}
</style>