<script setup>
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()

const reload = () => {
  window.location.reload()
}
</script>

<template>
  <div class="error-page">
    <div class="error-card">
      <div class="error-icon-wrapper server-error">
        <i class="pi pi-exclamation-triangle error-icon"></i>
      </div>
      <div class="error-code">500</div>
      <h1 class="error-title">Error del Servidor</h1>
      <p class="error-message">
        Ha ocurrido un error interno en el servidor.
        Intenta recargar la página o vuelve más tarde. Si el problema persiste,
        contacta al administrador del sistema.
      </p>
      <div class="error-actions">
        <Button
          label="Recargar Página"
          icon="pi pi-refresh"
          @click="reload"
        />
        <Button
          label="Ir al Inicio"
          icon="pi pi-home"
          severity="secondary"
          outlined
          @click="router.push('/')"
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
  min-height: calc(100vh - var(--ts-topbar-height));
  background: var(--ts-bg-body);
  padding: 2rem;
}

.error-card {
  background: var(--ts-bg-surface);
  border-radius: 12px;
  box-shadow: var(--ts-shadow-2);
  padding: 3rem 2.5rem;
  max-width: 480px;
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

.error-icon-wrapper.server-error {
  background: rgba(244, 67, 54, 0.12);
}

.error-icon {
  font-size: 3rem;
  color: var(--ts-error);
}

.error-code {
  font-size: 5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--ts-error);
  opacity: 0.15;
  margin-top: -0.5rem;
  letter-spacing: -4px;
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
  max-width: 380px;
  margin: 0;
}

.error-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 0.5rem;
}
</style>
