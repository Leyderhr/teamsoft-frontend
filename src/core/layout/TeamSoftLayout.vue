<template>
  <div class="min-h-screen xl:flex">
    <!-- Sidebar -->
    <TeamSoftSidebar />

    <!-- Mobile Backdrop -->
    <Backdrop />

    <!-- Main Content Area -->
    <div
      class="flex-1 min-w-0 overflow-x-hidden transition-all duration-300 ease-in-out"
      :class="isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]'"
    >
      <!-- Header -->
      <TeamSoftHeader />

      <!-- Page Content -->
      <div class="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useLocaleStore } from '@/core/store/locale.store.js'
import { useSidebarProvider } from '@/core/composables/useSidebar.js'
import TeamSoftHeader from './TeamSoftHeader.vue'
import TeamSoftSidebar from './TeamSoftSidebar.vue'
import Backdrop from './Backdrop.vue'

const localeStore = useLocaleStore()
const { isExpanded, isHovered } = useSidebarProvider()

onMounted(() => {
  localeStore.loadSavedLanguage()
})
</script>
