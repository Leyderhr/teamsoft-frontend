<template>
  <div
    v-if="isMobileOpen"
    class="fixed inset-0 z-40 bg-black/50 lg:hidden"
    @click="toggleMobileSidebar"
  />
</template>

<script setup>
import { useSidebar } from '@/core/composables/useSidebar.js'

const { isMobileOpen, toggleMobileSidebar } = useSidebar()
</script>
