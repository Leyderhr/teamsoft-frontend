<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSecurityStore } from '@/core/store/security.store.js'
import { useAuthStore } from '@/core/store/authStore.js'
import PanelMenu from 'primevue/panelmenu'
import Avatar from 'primevue/avatar'

defineProps({
  collapsed: { type: Boolean, default: false }
})

const router = useRouter()
const securityStore = useSecurityStore()
const userStore = useAuthStore()

const menuItems = computed(() => {
  const items = []

  items.push({
    label: 'Inicio',
    icon: 'pi pi-home',
    command: () => router.push('/')
  })

  if (securityStore.isGestor) {
    items.push({
      label: 'Configurar',
      icon: 'pi pi-list',
      items: [
        {
          label: 'Competencias',
          items: [
            { label: 'Importancia', command: () => router.push('/nomenclatives/competence-importance') },
            { label: 'Niveles', command: () => router.push('/nomenclatives/levels') }
          ]
        },
        {
          label: 'Rol',
          items: [
            { label: 'Costo de trabajar a distancia', command: () => router.push('/nomenclatives/cost-distance') },
            { label: 'Carga del rol', command: () => router.push('/nomenclatives/role-load') }
          ]
        },
        {
          label: 'Persona',
          items: [
            { label: 'Grupos', command: () => router.push('/nomenclatives/person-group') },
            { label: 'Evaluaci\u00f3n en el rol', command: () => router.push('/nomenclatives/role-eval') },
            { label: '\u00cdndice de conflicto', command: () => router.push('/nomenclatives/conflict-index') },
            { label: 'Nacionalidad', command: () => router.push('/nomenclatives/nacionality') },
            { label: 'Provincia', command: () => router.push('/nomenclatives/county') },
            { label: 'Raza', command: () => router.push('/nomenclatives/race') },
            { label: 'Religi\u00f3n', command: () => router.push('/nomenclatives/religion') },
            { label: 'Rango de edad', command: () => router.push('/nomenclatives/age-group') }
          ]
        },
        {
          label: 'Proyecto',
          items: [
            { label: 'Entidad cliente', command: () => router.push('/nomenclatives/client-entity') },
            { label: 'Estructuras definidas', command: () => router.push('/nomenclatives/project-structure') }
          ]
        }
      ]
    })
  }

  if (securityStore.isGestor) {
    items.push({
      label: 'Recursos Humanos',
      icon: 'pi pi-users',
      items: [
        { label: 'Competencias', command: () => router.push('/manage-competences/competence') },
        { label: 'Roles', command: () => router.push('/manage-roles/role') },
        { label: 'Personas', command: () => router.push('/person') },
        {
          label: 'Importar personas',
          items: [
            { label: 'Importar', command: () => router.push('/import') },
            { label: 'Configurar', command: () => router.push('/import/config') }
          ]
        }
      ]
    })
  }

  if (securityStore.isDirectivoTecnico || securityStore.isExperimentador || securityStore.isJefeEquipo) {
    const projectItems = []

    if (securityStore.isDirectivoTecnico || securityStore.isExperimentador) {
      projectItems.push(
          { label: 'Proyectos', command: () => router.push('/manage-projects/project') },
          { label: 'Formar equipo', command: () => router.push('/manage-projects/team-formation') }
      )
    }

    if (securityStore.isJefeEquipo) {
      projectItems.push(
          { label: 'Finalizar el proyecto', command: () => router.push('/manage-projects/close-project') }
      )
    }

    if (securityStore.isDirectivoTecnico) {
      projectItems.push(
          { label: 'Cerrar proyecto', command: () => router.push('/manage-projects/close-project') }
      )
    }

    items.push({
      label: 'Proyectos',
      icon: 'pi pi-briefcase',
      items: projectItems
    })
  }

  if (securityStore.isExperimentador) {
    items.push({
      label: 'Experimentos',
      icon: 'pi pi-cog',
      items: [
        { label: 'Configurar', command: () => router.push('/experiments') }
      ]
    })
  }

  if (securityStore.isAdmin) {
    items.push({
      label: 'Usuarios',
      icon: 'pi pi-user-plus',
      items: [
        { label: 'Usuarios', command: () => router.push('/manage-user-role/users') }
      ]
    })
  }

  if (securityStore.isAdmin) {
    items.push({
      label: 'Reportes',
      icon: 'pi pi-chart-bar',
      items: [
        { label: 'Personas', command: () => router.push('/reports/person-report') },
        { label: 'Equipos finalizados', command: () => router.push('/reports/finished-teams') },
        { label: 'Listar personas', command: () => router.push('/reports/list-workers') }
      ]
    })
  }

  return items
})
</script>

<template>
  <aside class="layout-menu" :class="{ 'is-collapsed': collapsed }">
    <div class="menu-content">
      <!-- Profile section -->
      <div v-if="!collapsed" class="profile-section">
        <Avatar icon="pi pi-user" size="xlarge" shape="circle" class="profile-avatar" />
        <div class="profile-name">{{ userStore.username || 'Usuario' }}</div>
        <div class="profile-role" v-if="userStore.roles?.length">
          {{ userStore.roles[0]?.replace('ROLE_', '').replace(/_/g, ' ') }}
        </div>
      </div>

      <PanelMenu :model="menuItems" :multiple="false" class="ts-menu" />
    </div>
  </aside>
</template>

<style scoped>
.layout-menu {
  position: fixed;
  top: var(--ts-topbar-height);
  left: 0;
  height: calc(100vh - var(--ts-topbar-height));
  width: var(--ts-sidebar-width);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--ts-text-muted) transparent;
  transition: width var(--ts-transition-normal);
  background: var(--ts-bg-surface);
  border-right: 1px solid var(--ts-border);
  box-shadow: var(--ts-shadow-sidebar);
  z-index: 900;
}

.layout-menu.is-collapsed {
  width: var(--ts-sidebar-collapsed);
}

.layout-menu::-webkit-scrollbar {
  width: 4px;
}

.layout-menu::-webkit-scrollbar-thumb {
  background: var(--ts-text-muted);
  border-radius: 2px;
}

/* Profile section */
.profile-section {
  padding: 1.5rem 1rem 1rem;
  text-align: center;
  border-bottom: 1px solid var(--ts-border);
}

.profile-avatar {
  background: var(--ts-primary) !important;
  color: var(--ts-text-on-dark) !important;
  margin-bottom: 0.5rem;
}

.profile-name {
  font-weight: 700;
  color: var(--ts-text-primary);
  font-size: 0.95rem;
}

.profile-role {
  font-size: 0.75rem;
  color: var(--ts-text-secondary);
  text-transform: capitalize;
  margin-top: 0.25rem;
}

/* PanelMenu overrides */
.ts-menu {
  border: none;
  font-family: var(--ts-font-body);
}

:deep(.p-panelmenu-panel) {
  box-shadow: none;
  border: none;
  margin: 0;
}

:deep(.p-panelmenu-panel:has(.p-panelmenu-header-active)) {
  margin: 0;
}

:deep(.p-panelmenu-header-content) {
  border: none !important;
  border-radius: 0 !important;
  transition: background var(--ts-transition-fast);
}

:deep(.p-panelmenu-header-content:hover) {
  background: var(--ts-bg-hover) !important;
}

:deep(.p-panelmenu-header-action) {
  padding: 0.75rem 1rem !important;
  color: var(--ts-text-primary) !important;
  font-weight: 500;
}

:deep(.p-panelmenu-header-active .p-panelmenu-header-content) {
  background: var(--ts-primary-light) !important;
}

:deep(.p-panelmenu-header-active .p-panelmenu-header-action) {
  color: var(--ts-primary) !important;
  font-weight: 600;
}

:deep(.p-panelmenu-content) {
  border: none !important;
  background: transparent !important;
}

:deep(.p-menuitem-link) {
  padding: 0.6rem 1rem 0.6rem 2.5rem !important;
  color: var(--ts-text-secondary) !important;
  transition: all var(--ts-transition-fast);
}

:deep(.p-menuitem-link:hover) {
  background: var(--ts-bg-hover) !important;
  color: var(--ts-primary) !important;
}

@media (max-width: 1024px) {
  .layout-menu {
    transform: translateX(-100%);
    transition: transform var(--ts-transition-normal);
  }

  .layout-menu:not(.is-collapsed) {
    transform: translateX(0);
  }
}
</style>
