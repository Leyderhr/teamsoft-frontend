<script setup>
import { ref, onMounted } from 'vue'
import { useLocaleStore } from '@/core/store/locale.store.js'
import Toast from 'primevue/toast'
import AppLoading from '@/core/layout/Apploading.vue'
import Topbar from '@/core/layout/Topbar.vue'
import Menu from '@/core/layout/Menu.vue'
import Breadcrumb from './Breadcrumb.vue'
import Footer from './Footer.vue'

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

  <div class="layout-wrapper">
    <Topbar @toggle-menu="toggleMenu" />

    <div class="layout-body">
      <!-- Mobile backdrop -->
      <div
          v-if="!menuCollapsed"
          class="sidebar-backdrop"
          @click="menuCollapsed = true"
      />

      <Menu :collapsed="menuCollapsed" />

      <div class="layout-content" :class="{ 'sidebar-collapsed': menuCollapsed }">
<!--        <Breadcrumb />-->

        <main class="page-content">
          <router-view />
        </main>

        <Footer />
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout-wrapper {
  min-height: 100vh;
  background: var(--ts-bg-body);
}

.layout-body {
  display: flex;
  padding-top: var(--ts-topbar-height);
}

.layout-content {
  flex: 1;
  margin-left: var(--ts-sidebar-width);
  min-height: calc(100vh - var(--ts-topbar-height));
  display: flex;
  flex-direction: column;
  transition: margin-left var(--ts-transition-normal);
}

.layout-content.sidebar-collapsed {
  margin-left: var(--ts-sidebar-collapsed);
}

.page-content {
  flex: 1;
  padding: 1.5rem;
}

/* Mobile backdrop */
.sidebar-backdrop {
  display: none;
}

@media (max-width: 1024px) {
  .layout-content {
    margin-left: 0 !important;
  }

  .sidebar-backdrop {
    display: block;
    position: fixed;
    top: var(--ts-topbar-height);
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 899;
    transition: opacity var(--ts-transition-fast);
  }
}
</style>
