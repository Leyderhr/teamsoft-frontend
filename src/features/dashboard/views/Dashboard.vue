<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/lib/auth-store'
import { useSecurityStore } from '@/core/store/security.store.js'
import projectService from '@/features/projects/services/projectService.js'
import personGroupService from '@/features/nomenclatives/services/personGroupService.js'
import {
  FolderOpen, Play, CheckCircle, Lock, Users, Briefcase,
  User, Star, UserPlus, BarChart3, Zap, History, Network, Loader2, Inbox
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const securityStore = useSecurityStore()

const createdProjects   = ref([])
const formedProjects    = ref([])
const finalizedProjects = ref([])
const closedProjects    = ref([])
const groups = ref([])
const loading = ref(true)

const projects = computed(() => [
  ...createdProjects.value,
  ...formedProjects.value,
  ...finalizedProjects.value,
  ...closedProjects.value,
])

const stats = computed(() => ({
  total: projects.value.length,
  active: createdProjects.value.length + formedProjects.value.length,
  finalized: finalizedProjects.value.length,
  closed: closedProjects.value.length,
  groups: groups.value.length,
}))

const statCards = computed(() => [
  {
    label: 'Proyectos Totales',
    value: stats.value.total,
    icon: FolderOpen,
    iconBg: 'bg-brand-50',
    iconColor: 'text-brand-500',
  },
  {
    label: 'Activos',
    value: stats.value.active,
    icon: Play,
    iconBg: 'bg-success-50',
    iconColor: 'text-success-600',
  },
  {
    label: 'Finalizados',
    value: stats.value.finalized,
    icon: CheckCircle,
    iconBg: 'bg-blue-light-50',
    iconColor: 'text-blue-light-600',
  },
  {
    label: 'Cerrados',
    value: stats.value.closed,
    icon: Lock,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-500',
  },
])

const formatRole = (role) => {
  if (!role) return ''
  return role.replace('ROLE_', '').replace(/_/g, ' ')
}

const quickActions = computed(() => {
  const actions = []
  if (securityStore.isDirectivoTecnico || securityStore.isExperimentador) {
    actions.push(
      { label: 'Formar Equipo', icon: Users, route: '/manage-projects/team-formation' },
      { label: 'Proyectos', icon: Briefcase, route: '/manage-projects/project' }
    )
  }
  if (securityStore.isGestor) {
    actions.push(
      { label: 'Personas', icon: User, route: '/person' },
      { label: 'Competencias', icon: Star, route: '/manage-competences/competence' }
    )
  }
  if (securityStore.isAdmin) {
    actions.push(
      { label: 'Usuarios', icon: UserPlus, route: '/manage-user-role/users' },
      { label: 'Reportes', icon: BarChart3, route: '/reports/person-report' }
    )
  }
  return actions
})

function getBadgeClass(project) {
  switch (project.state) {
    case 'CLOSED':    return 'bg-gray-100 text-gray-600'
    case 'FINALIZED': return 'bg-blue-light-50 text-blue-light-700'
    case 'FORMED':    return 'bg-brand-50 text-brand-700'
    default:          return 'bg-success-50 text-success-700' // CREATED
  }
}

function getBadgeLabel(project) {
  switch (project.state) {
    case 'CLOSED':    return 'Cerrado'
    case 'FINALIZED': return 'Finalizado'
    case 'FORMED':    return 'Formado'
    default:          return 'Creado'
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const [created, formed, finalized, closed, groupData] = await Promise.all([
      projectService.getByState('CREATED').catch(() => []),
      projectService.getByState('FORMED').catch(() => []),
      projectService.getByState('FINALIZED').catch(() => []),
      projectService.getByState('CLOSED').catch(() => []),
      personGroupService.getAll().catch(() => [])
    ])
    createdProjects.value   = created
    formedProjects.value    = formed
    finalizedProjects.value = finalized
    closedProjects.value    = closed
    groups.value = groupData
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="space-y-6">
    <!-- Welcome Banner -->
    <div
      class="rounded-2xl px-8 py-6 text-white overflow-hidden relative"
      style="background: linear-gradient(135deg, #0a5d7d, #1094b9)"
    >
      <div class="relative z-10">
        <h1 class="text-2xl font-semibold mb-1">
          Bienvenido, {{ authStore.username }}
        </h1>
        <p class="text-white/70 text-sm capitalize">
          {{ formatRole(authStore.roles?.[0]) }} &mdash; TeamSoft+ Sistema de Formaci&oacute;n de Equipos
        </p>
      </div>
      <div class="absolute -right-6 -top-6 w-36 h-36 rounded-full bg-white/10 pointer-events-none"></div>
      <div class="absolute -right-2 -bottom-8 w-24 h-24 rounded-full bg-white/5 pointer-events-none"></div>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div
        v-for="card in statCards"
        :key="card.label"
        class="bg-white rounded-2xl border border-gray-200 p-5 shadow-theme-xs flex items-center justify-between"
      >
        <div>
          <p class="text-sm text-gray-500 mb-1">{{ card.label }}</p>
          <h4 class="text-3xl font-bold text-gray-800">{{ card.value }}</h4>
        </div>
        <div class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" :class="card.iconBg">
          <component :is="card.icon" class="w-6 h-6" :class="card.iconColor" />
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Quick Actions -->
      <div v-if="quickActions.length" class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-theme-xs">
        <div class="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-brand-500 text-white">
          <Zap class="w-4 h-4" />
          <span class="text-sm font-semibold">Acciones R&aacute;pidas</span>
        </div>
        <div class="p-4 grid grid-cols-2 gap-3">
          <button
            v-for="action in quickActions"
            :key="action.route"
            @click="router.push(action.route)"
            class="rounded-lg border border-gray-200 p-3 flex items-center gap-2 text-sm text-gray-700 hover:border-brand-500 hover:text-brand-500 hover:bg-brand-50 transition-colors text-left"
          >
            <component :is="action.icon" class="w-4 h-4 flex-shrink-0" />
            {{ action.label }}
          </button>
        </div>
      </div>

      <!-- Recent Projects -->
      <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-theme-xs">
        <div class="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-brand-500 text-white">
          <History class="w-4 h-4" />
          <span class="text-sm font-semibold">Proyectos Recientes</span>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <Loader2 class="w-6 h-6 text-brand-500 animate-spin" />
        </div>

        <!-- Empty -->
        <div v-else-if="projects.length === 0" class="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
          <Inbox class="w-10 h-10" />
          <p class="text-sm">No hay proyectos registrados</p>
        </div>

        <!-- List -->
        <ul v-else>
          <li
            v-for="project in projects.slice(0, 6)"
            :key="project.id"
            class="flex items-center justify-between px-5 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
          >
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-700 truncate">{{ project.projectName }}</p>
              <p class="text-xs text-gray-400 truncate">{{ project.client?.entityName || '—' }}</p>
            </div>
            <span
              class="ml-3 inline-flex px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
              :class="getBadgeClass(project)"
            >
              {{ getBadgeLabel(project) }}
            </span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Groups Overview -->
    <div v-if="groups.length" class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-theme-xs">
      <div class="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-brand-500 text-white">
        <Network class="w-4 h-4" />
        <span class="text-sm font-semibold">Grupos de Personas ({{ stats.groups }})</span>
      </div>
      <div class="flex flex-wrap gap-2 p-5">
        <span
          v-for="group in groups.slice(0, 8)"
          :key="group.id"
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-medium border border-brand-200"
        >
          <Users class="w-3 h-3" />
          {{ group.name }}
        </span>
        <span
          v-if="groups.length > 8"
          class="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium"
        >
          +{{ groups.length - 8 }} m&aacute;s
        </span>
      </div>
    </div>
  </div>
</template>
