<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/core/store/authStore.js'
import { useLocaleStore } from '@/core/store/locale.store.js'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import Avatar from 'primevue/avatar'

const router = useRouter()
const userStore = useAuthStore()
const localeStore = useLocaleStore()

const profileMenuRef = ref()
const languageMenuRef = ref()

const toggleProfileMenu = (event) => {
  profileMenuRef.value.toggle(event)
}

const toggleLanguageMenu = (event) => {
  languageMenuRef.value.toggle(event)
}

const profileItems = computed(() => [
  {
    label: userStore.username || 'Usuario',
    icon: 'pi pi-user',
    disabled: true,
    class: 'profile-header-item'
  },
  { separator: true },
  {
    label: 'Cambiar contrase\u00f1a',
    icon: 'pi pi-key',
    command: () => router.push('/change-password')
  },
  {
    label: 'Cerrar sesi\u00f3n',
    icon: 'pi pi-sign-out',
    command: async () => {
      await userStore.logout()
      router.push('/login')
    }
  }
])

const languageItems = computed(() => [
  {
    label: 'Espa\u00f1ol',
    icon: localeStore.currentLanguage === 'es' ? 'pi pi-check' : '',
    command: () => localeStore.setLanguage('es')
  },
  {
    label: 'English',
    icon: localeStore.currentLanguage === 'en' ? 'pi pi-check' : '',
    command: () => localeStore.setLanguage('en')
  }
])

defineEmits(['toggle-menu'])
</script>

<template>
  <header class="topbar">
    <!-- Logo area -->
    <div class="topbar-left">
      <router-link to="/" class="logo-link">
        <span class="logo-text">TeamSoft<sup>+</sup></span>
      </router-link>
    </div>

    <!-- Right actions -->
    <div class="topbar-right">
      <!-- Mobile menu toggle -->
      <Button
          icon="pi pi-bars"
          text
          rounded
          class="menu-toggle-btn lg:hidden"
          @click="$emit('toggle-menu')"
      />

      <!-- Profile -->
      <div class="topbar-item">
        <button class="topbar-action-btn" @click="toggleProfileMenu">
          <Avatar icon="pi pi-user" shape="circle" size="small" class="avatar" />
          <span class="username-label">{{ userStore.username || 'Usuario' }}</span>
          <i class="pi pi-chevron-down chevron" />
        </button>
        <Menu ref="profileMenuRef" :model="profileItems" :popup="true" />
      </div>

      <!-- Language selector -->
      <div class="topbar-item">
        <button class="topbar-action-btn" @click="toggleLanguageMenu">
          <i class="pi pi-globe" />
          <span class="lang-code">{{ localeStore.currentLanguage.toUpperCase() }}</span>
        </button>
        <Menu ref="languageMenuRef" :model="languageItems" :popup="true" />
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--ts-topbar-height);
  background: var(--ts-dash-blue);
  box-shadow: var(--ts-shadow-topbar);
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}

/* ── Logo area ── */
.topbar-left {
  width: var(--ts-sidebar-width);
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 1.25rem;
  background: var(--ts-dash-blue-dark);
  box-shadow: 3px 0 6px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.logo-link {
  text-decoration: none;
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--ts-text-on-dark);
  letter-spacing: -0.5px;
}

.logo-text sup {
  font-size: 0.6em;
  color: var(--ts-accent-dark);
  margin-left: 1px;
}

/* ── Right actions ── */
.topbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-right: 1.25rem;
  margin-left: auto;
}

.topbar-item {
  position: relative;
}

.topbar-action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  border-radius: 6px;
  transition: background var(--ts-transition-fast), color var(--ts-transition-fast);
  font-size: 0.875rem;
  font-family: inherit;
}

.topbar-action-btn:hover {
  background: var(--ts-dash-blue-dark);
  color: var(--ts-text-on-dark);
}

.avatar {
  background: var(--ts-dash-blue) !important;
  color: var(--ts-text-on-dark) !important;
  width: 32px !important;
  height: 32px !important;
  font-size: 0.875rem !important;
}

.username-label {
  font-weight: 500;
}

.chevron {
  font-size: 0.7rem;
  opacity: 0.7;
}

.lang-code {
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.menu-toggle-btn {
  color: var(--ts-text-on-dark) !important;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .topbar-left {
    width: auto;
    padding: 0 0.75rem;
    box-shadow: none;
  }

  .logo-text {
    font-size: 1.25rem;
  }

  .username-label {
    display: none;
  }

  .lang-code {
    display: none;
  }

  .topbar-right {
    gap: 0.25rem;
    padding-right: 0.75rem;
  }
}
</style>
