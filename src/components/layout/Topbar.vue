<script setup>
import {ref, computed} from 'vue'
import {useRouter} from 'vue-router'
import {useUserStore} from '@/store/user'
import {useLocaleStore} from '@/store/locale'
import Button from 'primevue/button'
import Menu from 'primevue/menu'

const router = useRouter()
const userStore = useUserStore()
const localeStore = useLocaleStore()

const profileMenuRef = ref()
const languageMenuRef = ref()

const toggleProfileMenu = (event) => {
  profileMenuRef.value.toggle(event)
}

const toggleLanguageMenu = (event) => {
  languageMenuRef.value.toggle(event)
}

// Items del menú de perfil
const profileItems = computed(() => [
  {
    separator: true
  },
  {
    label: 'Cambiar contraseña',
    icon: 'pi pi-key',
    command: () => {
      router.push('/change-password')
    }
  },
  {
    label: 'Cerrar sesión',
    icon: 'pi pi-sign-out',
    command: () => {
      userStore.logout()
      router.push('/login')
    }
  }
])

// Items del menú de idioma
const languageItems = computed(() => [
  {
    label: 'Español',
    icon: localeStore.currentLanguage === 'es' ? 'pi pi-check' : '',
    command: () => {
      localeStore.setLanguage('es')
    }
  },
  {
    label: 'Inglés',
    icon: localeStore.currentLanguage === 'en' ? 'pi pi-check' : '',
    command: () => {
      localeStore.setLanguage('en')
    }
  }
])

// Emit para controlar menú en móvil
defineEmits(['toggle-menu'])
</script>

<template>
  <div class="topbar clearfix bg-primary p-3 flex align-items-center justify-content-between">
    <!-- Logo y título -->
    <div class="topbar-left">
      <router-link to="/" class="flex align-items-center no-underline">
        <i class="pi pi-home text-white text-6xl mr-2"></i>
        <span class="text-white text-4xl font-bold">TeamSoft<sup class="text-sm">+</sup></span>
      </router-link>
    </div>

    <!-- Menú derecho -->
    <div class="topbar-right flex align-items-center gap-4">
      <!-- Botón menú móvil -->
      <Button
          icon="pi pi-bars"
          class="p-button-text p-button-plain text-white lg:hidden"
          @click="$emit('toggle-menu')"
      />

      <!-- Menú de perfil -->
      <div class="profile-menu relative">
        <Button
            :label="userStore.user?.fullName || 'Usuario'"
            icon="pi pi-user"
            class="p-button-text p-button-plain text-white"
            @click="toggleProfileMenu"
        />
        <Menu ref="profileMenuRef" :model="profileItems" :popup="true"/>
      </div>

      <!-- Selector de idioma -->
      <div class="language-menu relative">
        <Button
            icon="pi pi-flag"
            class="p-button-text p-button-plain text-white"
            @click="toggleLanguageMenu"
        />
        <Menu ref="languageMenuRef" :model="languageItems" :popup="true"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.topbar {
  height: 60px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.topbar-left a {
  text-decoration: none;
}

/* Ajustes responsive */
@media (max-width: 768px) {
  .topbar-left span {
    font-size: 1.5rem;
  }

  .topbar-right {
    gap: 1rem;
  }
}
</style>