<script setup>
import { ref, onMounted } from 'vue'
import { useLocaleStore } from '@/core/store/locale.store.js'
import Toast from 'primevue/toast'
import AppLoading from '@/core/layout/Apploading.vue'
import Topbar from '@/core/layout/Topbar.vue'
import Menu from '@/core/layout/Menu.vue'
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

  <div class="flex flex-col min-h-screen bg-gray-50">
    <!-- Topbar fija -->
    <Topbar @toggle-menu="toggleMenu" class="fixed top-0 left-0 pl-0 w-full z-50 bg-sky-400" />

    <!-- Contenedor principal -->
    <div class="flex flex-row flex-1 pt-16">
      <!-- Menú lateral (oculto en móvil) -->
      <Menu
          :class="{ 'hidden lg:block': menuCollapsed, 'block': !menuCollapsed}"
          class="fixed lg:relative h-screen z-40 bg-white"
          :collapsed="menuCollapsed"
      />

      <!-- Contenido principal -->
      <main class="flex-1 lg:ml-64 transition-all duration-300" :class="{ 'lg:ml-64': menuCollapsed }">
        <Breadcrumb class="mb-4" />

        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.transition-all {
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