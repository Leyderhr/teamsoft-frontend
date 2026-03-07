<script setup>
import {ref, computed} from 'vue'
import {useRouter} from 'vue-router'
import {useSecurityStore} from '@/core/store/security.store.js'
import {useAuthStore} from '@/core/store/authStore.js'
import PanelMenu from 'primevue/panelmenu'
import Avatar from 'primevue/avatar'

const router = useRouter()
const securityStore = useSecurityStore()
const userStore = useAuthStore()

const collapsed = ref(false)

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

// Modelo del menú usando PrimeVue PanelMenu
const menuItems = computed(() => {
  const items = []

  // Inicio
  items.push({
    label: 'Inicio',
    icon: 'pi pi-home',
    command: () => router.push('/'),
    class: 'ripplelink'
  })

  // Nomencladores (GESTOR)
  if (securityStore.isGestor) {
    items.push({
      label: 'Configurar',
      icon: 'pi pi-list',
      items: [
        {
          label: 'Competencias',
          items: [
            {label: 'Importancia', command: () => router.push('/nomenclatives/competence-importance')},
            {label: 'Niveles', command: () => router.push('/nomenclatives/levels')}
          ]
        },
        {
          label: 'Rol',
          items: [
            {label: 'Costo de trabajar a distancia', command: () => router.push('/nomenclatives/cost-distance')},
            {label: 'Carga del rol', command: () => router.push('/nomenclatives/role-load')}
          ]
        },
        {
          label: 'Persona',
          items: [
            {label: 'Grupos', command: () => router.push('/nomenclatives/person-group')},
            {label: 'Evaluación en el rol', command: () => router.push('/nomenclatives/role-eval')},
            {label: 'Índice de conflicto', command: () => router.push('/nomenclatives/conflict-index')},
            {label: 'Nacionalidad', command: () => router.push('/nomenclatives/nacionality')},
            {label: 'Provincia', command: () => router.push('/nomenclatives/county')},
            // {label: 'Municipio', command: () => router.push('/nomenclatives/municipality')},
            {label: 'Raza', command: () => router.push('/nomenclatives/race')},
            {label: 'Religión', command: () => router.push('/nomenclatives/religion')},
            {label: 'Rango de edad', command: () => router.push('/nomenclatives/age-group')}
          ]
        },
        {
          label: 'Proyecto',
          items: [
            {label: 'Entidad cliente', command: () => router.push('/nomenclatives/client-entity')},
            {label: 'Estructuras definidas', command: () => router.push('/nomenclatives/project-structure')}
          ]
        }
      ]
    })
  }

  // Recursos Humanos (GESTOR)
  if (securityStore.isGestor) {
    items.push({
      label: 'Recursos Humanos',
      icon: 'pi pi-users',
      items: [
        {label: 'Competencias', command: () => router.push('/manage-competences/competence')},
        {label: 'Roles', command: () => router.push('/manage-roles/role')},
        {label: 'Personas', command: () => router.push('/person')},
        {
          label: 'Importar personas',
          items: [
            {label: 'Importar', command: () => router.push('/import')},
            {label: 'Configurar', command: () => router.push('/import/config')}
          ]
        }
      ]
    })
  }

  // Proyectos
  if (securityStore.isDirectivoTecnico || securityStore.isExperimentador || securityStore.isJefeEquipo) {
    const projectItems = []

    if (securityStore.isDirectivoTecnico || securityStore.isExperimentador) {
      projectItems.push(
          {label: 'Proyectos', command: () => router.push('/manage-projects/project')},
          {label: 'Formar equipo', command: () => router.push('/team-formation')}
      )
    }

    if (securityStore.isJefeEquipo) {
      projectItems.push(
          {label: 'Finalizar el proyecto', command: () => router.push('/close-project/finalize')}
      )
    }

    if (securityStore.isDirectivoTecnico) {
      projectItems.push(
          {label: 'Cerrar proyecto', command: () => router.push('/close-project/close')}
      )
    }

    items.push({
      label: 'Proyectos',
      icon: 'pi pi-briefcase',
      items: projectItems
    })
  }

  // Experimentos (EXPERIMENTADOR)
  if (securityStore.isExperimentador) {
    items.push({
      label: 'Experimentos',
      icon: 'pi pi-cog',
      items: [
        {label: 'Configurar', command: () => router.push('/experiments')}
      ]
    })
  }

  // Usuarios (ADMIN)
  if (securityStore.isAdmin) {
    items.push({
      label: 'Usuarios',
      icon: 'pi pi-user-plus',
      items: [
        {label: 'Usuarios', command: () => router.push('/manage-user-role/users')}
      ]
    })
  }

  // Reportes (ADMIN)
  if (securityStore.isAdmin) {
    items.push({
      label: 'Reportes',
      icon: 'pi pi-chart-bar',
      items: [
        {label: 'Personas', command: () => router.push('/reports/person-report')},
        {label: 'Equipos finalizados', command: () => router.push('/reports/finished-teams')},
        {label: 'Listar personas', command: () => router.push('/reports/list-workers')}
      ]
    })
  }

  return items
})
</script>

<template>
  <div class="layout-menu"
       :class="{ 'w-64': !collapsed, 'w-16': collapsed }">
    <div class="menu-content">
      <!-- Perfil inline -->
      <div v-if="!collapsed" class="profile p-4 text-center border-b border-gray-200">
        <Avatar icon="pi pi-user" size="xlarge" shape="circle" class="mb-3"/>
        <div class="text-black font-bold">{{ userStore.username || 'Usuario' }}</div>
      </div>

      <!-- Menú principal -->
      <PanelMenu
          :model="menuItems"
          :multiple="false"
          class="border-none ultima-menu"
      />
    </div>
  </div>
</template>

<style scoped>
:deep(.p-panelmenu-panel){
  box-shadow: none;
}
:deep(.p-panelmenu-panel:has(.p-panelmenu-header-active)){
  margin: 0;
}
.ultima-menu {
  margin:0;
  padding:0;
  list-style:none;
  font-family: Roboto,sans-serif;
}

.layout-menu {
  position: fixed;
  top: 60px;
  left: 0;
  height: calc(100% - 60px);
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  transition: width 0.3s ease;
  background-color: #f5f5f5;
  border-right: 1px solid #e0e0e0;
  width: 250px;
  padding-top: 20px;
  box-shadow: 2px 0 7px rgba(0, 0, 0, 0.5);
}

.layout-menu::-webkit-scrollbar {
  display: none;
}

</style>