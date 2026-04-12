<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/core/store/authStore.js'
import Button from 'primevue/button'

const router = useRouter()
const authStore = useAuthStore()

const goToLogin = () => {
  authStore.logout?.()
  router.push('/login')
}
</script>

<template>
  <div class="error-page">
    <div class="error-card">
      <div class="error-icon-wrapper session">
        <i class="pi pi-clock error-icon"></i>
      </div>
      <h1 class="error-title">Sesión Expirada</h1>
      <p class="error-message">
        Tu sesión ha caducado por inactividad.
        Por favor, inicia sesión nuevamente para continuar.
      </p>
      <div class="error-actions">
        <Button
          label="Iniciar Sesión"
          icon="pi pi-sign-in"
          @click="goToLogin"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--ts-bg-body);
  padding: 2rem;
}

.error-card {
  background: var(--ts-bg-surface);
  border-radius: 12px;
  box-shadow: var(--ts-shadow-2);
  padding: 3rem 2.5rem;
  max-width: 440px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.error-icon-wrapper {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-icon-wrapper.session {
  background: rgba(3, 169, 244, 0.12);
}

.error-icon {
  font-size: 3rem;
  color: var(--ts-info);
}

.error-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--ts-text-primary);
  margin: 0;
}

.error-message {
  color: var(--ts-text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  max-width: 360px;
  margin: 0;
}

.error-actions {
  margin-top: 0.5rem;
}
</style>
