<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useSecurityStore } from '@/core/store/security.store.js'
import { useAuthStore } from '@/lib/auth-store'
import PanelMenu from 'primevue/panelmenu'
import Avatar from 'primevue/avatar'

defineProps({
  collapsed: { type: Boolean, default: false }
})

const { t } = useI18n()
const router = useRouter()
const securityStore = useSecurityStore()
const userStore = useAuthStore()

const menuItems = computed(() => {
  const items = []

  items.push({
    label: t('menu.home'),
    icon: 'pi pi-home',
    command: () => router.push('/')
  })

  if (securityStore.isGestor) {
    items.push({
      label: t('menu.configure'),
      icon: 'pi pi-list',
      items: [
        {
          label: t('menu.competences'),
          items: [
            { label: t('menu.nomenclatives.importance'), command: () => router.push('/nomenclatives/competence-importance') },
            { label: t('menu.nomenclatives.levels'), command: () => router.push('/nomenclatives/levels') }
          ]
        },
        {
          label: t('menu.role'),
          items: [
            { label: t('menu.nomenclatives.costDistance'), command: () => router.push('/nomenclatives/cost-distance') },
            { label: t('menu.nomenclatives.roleLoad'), command: () => router.push('/nomenclatives/role-load') }
          ]
        },
        {
          label: t('menu.person'),
          items: [
            { label: t('menu.nomenclatives.groups'), command: () => router.push('/nomenclatives/person-group') },
            { label: t('menu.nomenclatives.roleEval'), command: () => router.push('/nomenclatives/role-eval') },
            { label: t('menu.nomenclatives.conflictIndex'), command: () => router.push('/nomenclatives/conflict-index') },
            { label: t('menu.nomenclatives.nationality'), command: () => router.push('/nomenclatives/nacionality') },
            { label: t('menu.nomenclatives.county'), command: () => router.push('/nomenclatives/county') },
            { label: t('menu.nomenclatives.race'), command: () => router.push('/nomenclatives/race') },
            { label: t('menu.nomenclatives.religion'), command: () => router.push('/nomenclatives/religion') },
            { label: t('menu.nomenclatives.ageGroup'), command: () => router.push('/nomenclatives/age-group') }
          ]
        },
        {
          label: t('menu.project'),
          items: [
            { label: t('menu.nomenclatives.clientEntity'), command: () => router.push('/nomenclatives/client-entity') },
            { label: t('menu.nomenclatives.projectStructure'), command: () => router.push('/nomenclatives/project-structure') }
          ]
        }
      ]
    })
  }

  if (securityStore.isGestor) {
    items.push({
      label: t('menu.humanResources'),
      icon: 'pi pi-users',
      items: [
        { label: t('menu.competences'), command: () => router.push('/manage-competences/competence') },
        { label: t('menu.roles'), command: () => router.push('/manage-roles/role') },
        { label: t('menu.persons'), command: () => router.push('/person') },
        { label: t('menu.importPersons'), command: () => router.push('/import') }
      ]
    })
  }

  if (securityStore.isDirectivoTecnico || securityStore.isExperimentador || securityStore.isJefeEquipo) {
    const projectItems = []

    if (securityStore.isDirectivoTecnico || securityStore.isExperimentador) {
      projectItems.push(
          { label: t('menu.projects'), command: () => router.push('/manage-projects/project') },
          { label: t('menu.teamFormation'), command: () => router.push('/manage-projects/team-formation') }
      )
    }

    if (securityStore.isJefeEquipo) {
      projectItems.push(
          { label: t('menu.finalizeProject'), command: () => router.push('/manage-projects/close-project') }
      )
    }

    if (securityStore.isDirectivoTecnico) {
      projectItems.push(
          { label: t('menu.closeProject'), command: () => router.push('/manage-projects/close-project') }
      )
    }

    items.push({
      label: t('menu.projects'),
      icon: 'pi pi-briefcase',
      items: projectItems
    })
  }

  if (securityStore.isExperimentador) {
    items.push({
      label: t('menu.experiments'),
      icon: 'pi pi-cog',
      items: [
        { label: t('menu.configure'), command: () => router.push('/experiments') }
      ]
    })
  }

  if (securityStore.isAdmin) {
    items.push({
      label: t('menu.users'),
      icon: 'pi pi-user-plus',
      items: [
        { label: t('menu.users'), command: () => router.push('/manage-user-role/users') }
      ]
    })
  }

  if (securityStore.isAdmin) {
    items.push({
      label: t('menu.reports'),
      icon: 'pi pi-chart-bar',
      items: [
        { label: t('menu.persons'), command: () => router.push('/reports/person-report') },
        { label: t('menu.finishedTeams'), command: () => router.push('/reports/finished-teams') },
        { label: t('menu.listPersons'), command: () => router.push('/reports/list-workers') }
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
        <div class="profile-name">{{ userStore.username || t('common.user') }}</div>
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
