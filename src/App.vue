<script setup>
import Login from "@/views/Login.vue";

import { provide } from 'vue'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

// Proveer toast a componentes hijos si es necesario
provide('toast', toast)
</script>

<template>
  <router-view/>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
}
</style>
