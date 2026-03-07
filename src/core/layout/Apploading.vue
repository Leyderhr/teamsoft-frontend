<script setup>
import {ref, onMounted, onUnmounted} from 'vue'
import ProgressSpinner from 'primevue/progressspinner'

const loading = ref(false)

// Simular eventos de carga (deberás conectar esto con Axios interceptors)
let timer = null

const startLoading = () => {
  loading.value = true
}

const stopLoading = () => {
  loading.value = false
}

// Para pruebas, puedes exponer estos métodos
defineExpose({startLoading, stopLoading})
</script>

<template>
  <div v-if="loading" class="app-loading">
    <div class="loading-card">
      <ProgressSpinner style="width: 40px; height: 40px"/>
      <span class="loading-text">Procesando...</span>
    </div>
  </div>
</template>

<style scoped>
.app-loading {
  position: fixed;
  top: 130px;
  right: 20px;
  z-index: 10000;
  animation: fadeIn 0.3s ease-in;
}

.loading-card {
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(3, 169, 244, 0.3);
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white linear-gradient(135deg, #03a9f4, #2196f3);
  font-weight: 600;
}

.loading-text {
  white-space: nowrap;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>