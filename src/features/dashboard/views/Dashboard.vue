<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/core/store/authStore.js'
import { useSecurityStore } from '@/core/store/security.store.js'
import projectService from '@/features/projects/services/projectService.js'
import personGroupService from '@/features/nomenclatives/services/personGroupService.js'

const router = useRouter()
const authStore = useAuthStore()
const securityStore = useSecurityStore()

const projects = ref([])
const groups = ref([])
const loading = ref(true)

// Computed stats from real project data
const stats = computed(() => {
  const all = projects.value
  const active = all.filter(p => !p.close && !p.finalize)
  const finalized = all.filter(p => p.finalize && !p.close)
  const closed = all.filter(p => p.close)
  return {
    total: all.length,
    active: active.length,
    finalized: finalized.length,
    closed: closed.length,
    groups: groups.value.length
  }
})

const loadData = async () => {
  loading.value = true
  try {
    const [projectData, groupData] = await Promise.all([
      projectService.getAll().catch(() => []),
      personGroupService.getAll().catch(() => [])
    ])
    projects.value = projectData
    groups.value = groupData
  } finally {
    loading.value = false
  }
}

const formatRole = (role) => {
  if (!role) return ''
  return role.replace('ROLE_', '').replace(/_/g, ' ')
}

const quickActions = computed(() => {
  const actions = []

  if (securityStore.isDirectivoTecnico || securityStore.isExperimentador) {
    actions.push(
        { label: 'Formar Equipo', icon: 'pi pi-users', route: '/manage-projects/team-formation', color: 'primary' },
        { label: 'Proyectos', icon: 'pi pi-briefcase', route: '/manage-projects/project', color: 'info' }
    )
  }

  if (securityStore.isGestor) {
    actions.push(
        { label: 'Personas', icon: 'pi pi-user', route: '/person', color: 'teal' },
        { label: 'Competencias', icon: 'pi pi-star', route: '/manage-competences/competence', color: 'purple' }
    )
  }

  if (securityStore.isAdmin) {
    actions.push(
        { label: 'Usuarios', icon: 'pi pi-user-plus', route: '/manage-user-role/users', color: 'warning' },
        { label: 'Reportes', icon: 'pi pi-chart-bar', route: '/reports/person-report', color: 'success' }
    )
  }

  return actions
})

onMounted(loadData)
</script>

<template>
  <div class="dashboard">
    <!-- Welcome banner -->
    <div class="welcome-banner">
      <div class="welcome-text">
        <h1 class="welcome-title">
          Bienvenido, <span class="username-highlight">{{ authStore.username }}</span>
        </h1>
        <p class="welcome-subtitle">
          {{ formatRole(authStore.roles?.[0]) }} &mdash; TeamSoft+ Sistema de Formaci&oacute;n de Equipos
        </p>
      </div>
      <div class="welcome-icon">
        <i class="pi pi-th-large" />
      </div>
    </div>

    <!-- Stat cards -->
    <div class="stats-grid">
      <div class="stat-card stat-card--total">
        <div class="stat-body">
          <div class="stat-number">{{ stats.total }}</div>
          <div class="stat-label">Proyectos Totales</div>
        </div>
        <div class="stat-icon">
          <i class="pi pi-folder" />
        </div>
      </div>

      <div class="stat-card stat-card--active">
        <div class="stat-body">
          <div class="stat-number">{{ stats.active }}</div>
          <div class="stat-label">Activos</div>
        </div>
        <div class="stat-icon">
          <i class="pi pi-play" />
        </div>
      </div>

      <div class="stat-card stat-card--finalized">
        <div class="stat-body">
          <div class="stat-number">{{ stats.finalized }}</div>
          <div class="stat-label">Finalizados</div>
        </div>
        <div class="stat-icon">
          <i class="pi pi-check-circle" />
        </div>
      </div>

      <div class="stat-card stat-card--closed">
        <div class="stat-body">
          <div class="stat-number">{{ stats.closed }}</div>
          <div class="stat-label">Cerrados</div>
        </div>
        <div class="stat-icon">
          <i class="pi pi-lock" />
        </div>
      </div>
    </div>

    <!-- Quick actions & Recent projects -->
    <div class="content-grid">
      <!-- Quick actions -->
      <div class="section-card" v-if="quickActions.length">
        <div class="section-header">
          <i class="pi pi-bolt" />
          <span>Acciones R&aacute;pidas</span>
        </div>
        <div class="actions-grid">
          <button
              v-for="action in quickActions"
              :key="action.route"
              class="action-btn"
              :class="'action-btn--' + action.color"
              @click="router.push(action.route)"
          >
            <i :class="action.icon" />
            <span>{{ action.label }}</span>
          </button>
        </div>
      </div>

      <!-- Recent projects -->
      <div class="section-card">
        <div class="section-header">
          <i class="pi pi-history" />
          <span>Proyectos Recientes</span>
        </div>
        <div v-if="loading" class="loading-state">
          <i class="pi pi-spin pi-spinner" style="font-size: 1.5rem; color: var(--ts-primary)" />
        </div>
        <div v-else-if="projects.length === 0" class="empty-state">
          <i class="pi pi-inbox" />
          <p>No hay proyectos registrados</p>
        </div>
        <div v-else class="project-list">
          <div
              v-for="project in projects.slice(0, 6)"
              :key="project.id"
              class="project-item"
          >
            <div class="project-info">
              <span class="project-name">{{ project.projectName }}</span>
              <span class="project-client">{{ project.client?.entityName || '&mdash;' }}</span>
            </div>
            <span
                class="project-badge"
                :class="{
                'badge--active': !project.close && !project.finalize,
                'badge--finalized': project.finalize && !project.close,
                'badge--closed': project.close
              }"
            >
              {{ project.close ? 'Cerrado' : project.finalize ? 'Finalizado' : 'Activo' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Groups overview -->
    <div class="section-card groups-card" v-if="groups.length">
      <div class="section-header">
        <i class="pi pi-sitemap" />
        <span>Grupos de Personas ({{ stats.groups }})</span>
      </div>
      <div class="groups-grid">
        <div v-for="group in groups.slice(0, 8)" :key="group.id" class="group-chip">
          <i class="pi pi-users" />
          {{ group.name }}
        </div>
        <div v-if="groups.length > 8" class="group-chip group-chip--more">
          +{{ groups.length - 8 }} m&aacute;s
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

/* ── Welcome Banner ── */
.welcome-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2.5rem;
  background: linear-gradient(135deg, var(--ts-dark) 0%, var(--ts-primary-dark) 100%);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  color: var(--ts-text-on-dark);
}

.welcome-title {
  font-size: 1.75rem;
  font-weight: 300;
  margin: 0 0 0.5rem 0;
}

.username-highlight {
  font-weight: 700;
  color: var(--ts-cyan);
}

.welcome-subtitle {
  margin: 0;
  opacity: 0.8;
  font-size: 0.95rem;
  text-transform: capitalize;
}

.welcome-icon {
  font-size: 3rem;
  opacity: 0.3;
}

/* ── Stat Cards Grid ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-radius: 10px;
  color: var(--ts-text-on-dark);
  box-shadow: var(--ts-shadow-1);
  transition: transform var(--ts-transition-fast), box-shadow var(--ts-transition-fast);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--ts-shadow-2);
}

.stat-card--total {
  background: linear-gradient(135deg, var(--ts-dash-blue-dark), var(--ts-dash-blue));
}
.stat-card--active {
  background: linear-gradient(135deg, var(--ts-dash-green-dark), var(--ts-dash-green));
}
.stat-card--finalized {
  background: linear-gradient(135deg, var(--ts-dash-purple-dark), var(--ts-dash-purple));
}
.stat-card--closed {
  background: linear-gradient(135deg, var(--ts-dash-teal-dark), var(--ts-dash-teal));
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.9;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

/* ── Content Grid ── */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

/* ── Section Cards ── */
.section-card {
  background: var(--ts-bg-surface);
  border-radius: 10px;
  box-shadow: var(--ts-shadow-1);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  font-weight: 600;
  color: var(--ts-text-on-dark);
  background: var(--ts-dark);
  font-size: 0.95rem;
}

.section-header i {
  color: var(--ts-primary);
}

/* ── Quick Actions ── */
.actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  padding: 1.25rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--ts-border);
  border-radius: 8px;
  background: var(--ts-bg-surface);
  cursor: pointer;
  transition: all var(--ts-transition-fast);
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ts-text-primary);
}

.action-btn:hover {
  box-shadow: var(--ts-shadow-1);
  transform: translateY(-1px);
}

.action-btn--primary:hover { border-color: var(--ts-primary); color: var(--ts-primary); }
.action-btn--info:hover    { border-color: var(--ts-info); color: var(--ts-info); }
.action-btn--teal:hover    { border-color: var(--ts-teal); color: var(--ts-teal); }
.action-btn--purple:hover  { border-color: var(--ts-purple); color: var(--ts-purple); }
.action-btn--warning:hover { border-color: var(--ts-warning-dark); color: var(--ts-warning-dark); }
.action-btn--success:hover { border-color: var(--ts-success); color: var(--ts-success); }

.action-btn i {
  font-size: 1.1rem;
}

/* ── Project List ── */
.project-list {
  padding: 0.5rem 0;
}

.project-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--ts-border-light);
  transition: background var(--ts-transition-fast);
}

.project-item:last-child {
  border-bottom: none;
}

.project-item:hover {
  background: var(--ts-bg-surface-alt);
}

.project-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.project-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--ts-text-primary);
}

.project-client {
  font-size: 0.78rem;
  color: var(--ts-text-secondary);
}

.project-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.65rem;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.badge--active    { background: rgba(76, 175, 80, 0.12); color: var(--ts-success-dark); }
.badge--finalized { background: rgba(103, 58, 183, 0.12); color: var(--ts-purple); }
.badge--closed    { background: rgba(0, 150, 136, 0.12); color: var(--ts-teal-dark); }

/* ── Empty / Loading States ── */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--ts-text-muted);
  gap: 0.75rem;
}

.empty-state i {
  font-size: 2rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

/* ── Groups ── */
.groups-card {
  margin-bottom: 1.5rem;
}

.groups-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 1.25rem;
}

.group-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.85rem;
  background: var(--ts-bg-surface-alt);
  border: 1px solid var(--ts-border);
  border-radius: 20px;
  font-size: 0.8rem;
  color: var(--ts-text-secondary);
  font-weight: 500;
}

.group-chip i {
  font-size: 0.75rem;
  color: var(--ts-primary);
}

.group-chip--more {
  background: var(--ts-primary-light);
  border-color: var(--ts-primary);
  color: var(--ts-primary);
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .welcome-banner {
    padding: 1.5rem;
  }

  .welcome-title {
    font-size: 1.25rem;
  }

  .welcome-icon {
    display: none;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
