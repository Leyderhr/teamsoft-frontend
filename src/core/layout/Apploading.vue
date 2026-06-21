<script setup>
import { useI18n } from 'vue-i18n'
import { useLoading } from '@/core/composables/useLoading.js'
import ProgressSpinner from 'primevue/progressspinner'

const { t } = useI18n()
const { isLoading } = useLoading()
</script>

<template>
  <Transition name="fade-slide">
    <div v-if="isLoading" class="app-loading">
      <div class="loading-card">
        <ProgressSpinner style="width: 32px; height: 32px" strokeWidth="4" />
        <span class="loading-text">{{ t('common.processing') }}</span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.app-loading {
  position: fixed;
  top: calc(var(--ts-topbar-height) + 12px);
  right: 20px;
  z-index: 10000;
}

.loading-card {
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  box-shadow: var(--ts-shadow-2);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, var(--ts-primary), var(--ts-primary-dark));
  color: var(--ts-text-on-dark);
  font-weight: 600;
  font-size: 0.875rem;
}

.loading-text {
  white-space: nowrap;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all var(--ts-transition-normal);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
