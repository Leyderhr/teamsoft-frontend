<script setup>
import Login from "@/features/auth/views/Login.vue";
import ConfirmDialog from 'primevue/confirmdialog'

import { provide } from 'vue'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

// Proveer toast a componentes hijos si es necesario
provide('toast', toast)
</script>

<template>
  <ConfirmDialog />
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

<style>
/* Estilos personalizados para ConfirmDialog*/
.p-confirmdialog {
  border-radius: 0.75rem !important;
  box-shadow: var(--shadow-theme-lg) !important;
  border: 1px solid var(--color-gray-200) !important;
  max-width: 28rem !important;
  font-family: var(--font-outfit) !important;
}

.p-confirmdialog .p-dialog-header {
  padding: 1.25rem 1.5rem !important;
  border-bottom: 1px solid var(--color-gray-200) !important;
  background: white !important;
  border-radius: 0.75rem 0.75rem 0 0 !important;
}

.p-confirmdialog .p-dialog-title {
  font-size: 1.125rem !important;
  font-weight: 600 !important;
  color: var(--color-gray-900) !important;
}

.p-confirmdialog .p-dialog-content {
  padding: 1.5rem !important;
  background: white !important;
  color: var(--color-gray-600) !important;
  font-size: 0.875rem !important;
  line-height: 1.5 !important;
}

.p-confirmdialog .p-dialog-footer {
  padding: 1rem 1.5rem !important;
  border-top: 1px solid var(--color-gray-200) !important;
  background: var(--color-gray-50) !important;
  border-radius: 0 0 0.75rem 0.75rem !important;
  display: flex !important;
  gap: 0.75rem !important;
  justify-content: flex-end !important;
}

/* Botones del diálogo */
.p-confirmdialog .p-button {
  padding: 0.5rem 1rem !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  border-radius: 0.5rem !important;
  transition: all 0.2s !important;
  font-family: var(--font-outfit) !important;
}

/* Botón de aceptar - Brand color */
.p-confirmdialog .p-button.p-confirm-dialog-accept {
  background: var(--color-brand-500) !important;
  border: 1px solid var(--color-brand-500) !important;
  color: white !important;
}

.p-confirmdialog .p-button.p-confirm-dialog-accept:hover {
  background: var(--color-brand-600) !important;
  border-color: var(--color-brand-600) !important;
}

.p-confirmdialog .p-button.p-confirm-dialog-accept:focus {
  box-shadow: var(--shadow-focus-ring) !important;
}

/* Botón de cancelar */
.p-confirmdialog .p-button.p-confirm-dialog-reject {
  background: white !important;
  border: 1px solid var(--color-gray-300) !important;
  color: var(--color-gray-700) !important;
}

.p-confirmdialog .p-button.p-confirm-dialog-reject:hover {
  background: var(--color-gray-50) !important;
  border-color: var(--color-gray-400) !important;
}

/* Icono de advertencia */
.p-confirmdialog .p-confirm-dialog-icon {
  font-size: 2rem !important;
  color: var(--color-warning-500) !important;
  margin-right: 1rem !important;
}

/* Overlay del diálogo */
.p-dialog-mask {
  background-color: rgba(0, 0, 0, 0.4) !important;
  backdrop-filter: blur(2px) !important;
}

/* Animación de entrada */
.p-dialog-enter-active {
  transition: all 0.2s ease-out !important;
}

.p-dialog-enter-from {
  opacity: 0 !important;
  transform: scale(0.95) !important;
}
</style>
