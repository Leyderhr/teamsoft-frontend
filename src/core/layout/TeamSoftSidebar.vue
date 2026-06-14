<template>
  <aside
    :class="[
      'fixed flex flex-col top-0 px-5 left-0 bg-white text-gray-900 h-screen transition-all duration-300 ease-in-out border-r border-gray-200 z-30 overflow-hidden',
      {
        'lg:w-[290px]': isExpanded || isMobileOpen || isHovered,
        'lg:w-[90px]': !isExpanded && !isHovered,
        'translate-x-0 w-[290px] z-50': isMobileOpen,
        '-translate-x-full': !isMobileOpen,
        'lg:translate-x-0': true,
      },
    ]"
    @mouseenter="() => { if (!isExpanded) setIsHovered(true) }"
    @mouseleave="() => setIsHovered(false)"
  >
    <!-- ── Logo ── -->
    <div
      class="flex-shrink-0"
      :class="[
        'flex items-center',
        !isExpanded && !isHovered ? 'lg:justify-center py-6' : 'justify-start py-5',
      ]"
    >
      <router-link to="/" class="flex items-center gap-2 min-w-0">
        <img v-if="isExpanded || isHovered || isMobileOpen" src="/Teamsoft+.png" alt="TeamSoft" class="h-10" />
        <img v-else src="/trabajo_en_equipo2.png" alt="TS" class="h-10" />
      </router-link>
    </div>

    <!-- ── Navigation ── -->
    <div class="flex flex-col overflow-y-auto flex-1 py-4 no-scrollbar">
      <nav>
        <ul class="flex flex-col gap-1">

          <!-- ── DASHBOARD ── -->
          <li>
            <router-link
              to="/"
              class="menu-item group hover:bg-gray-100 hover:text-gray-700"
              :class="[
                isActive('/') ? 'menu-item-active' : 'menu-item-inactive',
                !isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start',
              ]"
            >
              <span :class="isActive('/') ? 'menu-item-icon-active' : 'menu-item-icon-inactive group-hover:text-gray-600'">
                <LayoutDashboard class="w-5 h-5 flex-shrink-0" />
              </span>
              <span v-if="isExpanded || isHovered || isMobileOpen" class="text-sm font-medium whitespace-nowrap">
                Dashboard
              </span>
            </router-link>
          </li>

          <!-- ── CONFIGURAR (solo GESTOR) ── -->
          <template v-if="securityStore.isGestor">
            <li>
              <!-- Level 1: Configurar toggle -->
              <button
                @click="toggleSubmenu('configurar')"
                class="menu-item group w-full hover:bg-gray-100 hover:text-gray-700"
                :class="[
                  isSubmenuOpen('configurar') ? 'menu-item-active' : 'menu-item-inactive',
                  !isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start',
                ]"
              >
                <span :class="isSubmenuOpen('configurar') ? 'menu-item-icon-active' : 'menu-item-icon-inactive group-hover:text-gray-600'">
                  <Cog class="w-5 h-5 flex-shrink-0" />
                </span>
                <span v-if="isExpanded || isHovered || isMobileOpen" class="text-sm font-medium whitespace-nowrap">
                  Configurar
                </span>
                <ChevronDown
                  v-if="isExpanded || isHovered || isMobileOpen"
                  class="ml-auto w-4 h-4 transition-transform duration-200 flex-shrink-0"
                  :class="isSubmenuOpen('configurar') ? 'rotate-180 text-brand-500' : 'text-gray-400'"
                />
              </button>

              <!-- Level 2 submenu: Competencias, Rol, Persona, Proyecto -->
              <transition @enter="startTransition" @after-enter="endTransition" @before-leave="startTransition" @after-leave="endTransition">
                <div v-show="isSubmenuOpen('configurar') && (isExpanded || isHovered || isMobileOpen)" style="overflow:hidden">
                  <ul class="mt-1 ml-5 space-y-0.5">

                    <!-- Competencias (nomenclativos) -->
                    <li>
                      <button
                        @click="toggleNestedSubmenu('config-competencias')"
                        class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-100"
                        :class="isNestedOpen('config-competencias') ? 'text-brand-500 font-medium' : 'text-gray-600 font-normal'"
                      >
                        <BookOpen class="w-4 h-4 flex-shrink-0" />
                        <span class="whitespace-nowrap">Competencias</span>
                        <ChevronDown
                          class="ml-auto w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0"
                          :class="isNestedOpen('config-competencias') ? 'rotate-180' : ''"
                        />
                      </button>
                      <transition @enter="startTransition" @after-enter="endTransition" @before-leave="startTransition" @after-leave="endTransition">
                        <ul v-show="isNestedOpen('config-competencias')" style="overflow:hidden" class="ml-6 mt-0.5 space-y-0.5">
                          <li v-for="sub in configurarCompetencias" :key="sub.path">
                            <router-link :to="sub.path" class="menu-dropdown-item hover:bg-gray-100 hover:text-gray-700" :class="isActive(sub.path) ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'">
                              {{ sub.name }}
                            </router-link>
                          </li>
                        </ul>
                      </transition>
                    </li>

                    <!-- Rol (nomenclativos) -->
                    <li>
                      <button
                        @click="toggleNestedSubmenu('config-rol')"
                        class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-100"
                        :class="isNestedOpen('config-rol') ? 'text-brand-500 font-medium' : 'text-gray-600 font-normal'"
                      >
                        <Shield class="w-4 h-4 flex-shrink-0" />
                        <span class="whitespace-nowrap">Rol</span>
                        <ChevronDown
                          class="ml-auto w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0"
                          :class="isNestedOpen('config-rol') ? 'rotate-180' : ''"
                        />
                      </button>
                      <transition @enter="startTransition" @after-enter="endTransition" @before-leave="startTransition" @after-leave="endTransition">
                        <ul v-show="isNestedOpen('config-rol')" style="overflow:hidden" class="ml-6 mt-0.5 space-y-0.5">
                          <li v-for="sub in configurarRol" :key="sub.path">
                            <router-link :to="sub.path" class="menu-dropdown-item hover:bg-gray-100 hover:text-gray-700" :class="isActive(sub.path) ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'">
                              {{ sub.name }}
                            </router-link>
                          </li>
                        </ul>
                      </transition>
                    </li>

                    <!-- Persona (nomenclativos) -->
                    <li>
                      <button
                        @click="toggleNestedSubmenu('config-persona')"
                        class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-100"
                        :class="isNestedOpen('config-persona') ? 'text-brand-500 font-medium' : 'text-gray-600 font-normal'"
                      >
                        <UserCog class="w-4 h-4 flex-shrink-0" />
                        <span class="whitespace-nowrap">Persona</span>
                        <ChevronDown
                          class="ml-auto w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0"
                          :class="isNestedOpen('config-persona') ? 'rotate-180' : ''"
                        />
                      </button>
                      <transition @enter="startTransition" @after-enter="endTransition" @before-leave="startTransition" @after-leave="endTransition">
                        <ul v-show="isNestedOpen('config-persona')" style="overflow:hidden" class="ml-6 mt-0.5 space-y-0.5">
                          <li v-for="sub in configurarPersona" :key="sub.path">
                            <router-link :to="sub.path" class="menu-dropdown-item hover:bg-gray-100 hover:text-gray-700" :class="isActive(sub.path) ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'">
                              {{ sub.name }}
                            </router-link>
                          </li>
                        </ul>
                      </transition>
                    </li>

                    <!-- Proyecto (nomenclativos) -->
                    <li>
                      <button
                        @click="toggleNestedSubmenu('config-proyecto')"
                        class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-100"
                        :class="isNestedOpen('config-proyecto') ? 'text-brand-500 font-medium' : 'text-gray-600 font-normal'"
                      >
                        <FolderCog class="w-4 h-4 flex-shrink-0" />
                        <span class="whitespace-nowrap">Proyecto</span>
                        <ChevronDown
                          class="ml-auto w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0"
                          :class="isNestedOpen('config-proyecto') ? 'rotate-180' : ''"
                        />
                      </button>
                      <transition @enter="startTransition" @after-enter="endTransition" @before-leave="startTransition" @after-leave="endTransition">
                        <ul v-show="isNestedOpen('config-proyecto')" style="overflow:hidden" class="ml-6 mt-0.5 space-y-0.5">
                          <li v-for="sub in configurarProyecto" :key="sub.path">
                            <router-link :to="sub.path" class="menu-dropdown-item hover:bg-gray-100 hover:text-gray-700" :class="isActive(sub.path) ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'">
                              {{ sub.name }}
                            </router-link>
                          </li>
                        </ul>
                      </transition>
                    </li>

                  </ul>
                </div>
              </transition>
            </li>
          </template>

          <!-- ── RECURSOS HUMANOS (solo GESTOR) ── -->
          <template v-if="securityStore.isGestor">
            <li>
              <button
                @click="toggleSubmenu('rrhh')"
                class="menu-item group w-full hover:bg-gray-100 hover:text-gray-700"
                :class="[
                  isSubmenuOpen('rrhh') ? 'menu-item-active' : 'menu-item-inactive',
                  !isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start',
                ]"
              >
                <span :class="isSubmenuOpen('rrhh') ? 'menu-item-icon-active' : 'menu-item-icon-inactive group-hover:text-gray-600'">
                  <Users class="w-5 h-5 flex-shrink-0" />
                </span>
                <span v-if="isExpanded || isHovered || isMobileOpen" class="text-sm font-medium whitespace-nowrap">
                  Recursos Humanos
                </span>
                <ChevronDown
                  v-if="isExpanded || isHovered || isMobileOpen"
                  class="ml-auto w-4 h-4 transition-transform duration-200 flex-shrink-0"
                  :class="isSubmenuOpen('rrhh') ? 'rotate-180 text-brand-500' : 'text-gray-400'"
                />
              </button>
              <transition @enter="startTransition" @after-enter="endTransition" @before-leave="startTransition" @after-leave="endTransition">
                <div v-show="isSubmenuOpen('rrhh') && (isExpanded || isHovered || isMobileOpen)" style="overflow:hidden">
                  <ul class="mt-1 ml-9 space-y-0.5">
                    <li v-for="sub in rrhhItems" :key="sub.path">
                      <router-link :to="sub.path" class="menu-dropdown-item hover:bg-gray-100 hover:text-gray-700" :class="isActive(sub.path) ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'">
                        {{ sub.name }}
                      </router-link>
                    </li>
                  </ul>
                </div>
              </transition>
            </li>
          </template>

          <!-- ── PROYECTOS ── -->
          <template v-if="securityStore.isDirectivoTecnico || securityStore.isExperimentador || securityStore.isJefeEquipo">
            <li>
              <button
                @click="toggleSubmenu('proyectos')"
                class="menu-item group w-full hover:bg-gray-100 hover:text-gray-700"
                :class="[
                  isSubmenuOpen('proyectos') ? 'menu-item-active' : 'menu-item-inactive',
                  !isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start',
                ]"
              >
                <span :class="isSubmenuOpen('proyectos') ? 'menu-item-icon-active' : 'menu-item-icon-inactive group-hover:text-gray-600'">
                  <Briefcase class="w-5 h-5 flex-shrink-0" />
                </span>
                <span v-if="isExpanded || isHovered || isMobileOpen" class="text-sm font-medium whitespace-nowrap">
                  Proyectos
                </span>
                <ChevronDown
                  v-if="isExpanded || isHovered || isMobileOpen"
                  class="ml-auto w-4 h-4 transition-transform duration-200 flex-shrink-0"
                  :class="isSubmenuOpen('proyectos') ? 'rotate-180 text-brand-500' : 'text-gray-400'"
                />
              </button>
              <transition @enter="startTransition" @after-enter="endTransition" @before-leave="startTransition" @after-leave="endTransition">
                <div v-show="isSubmenuOpen('proyectos') && (isExpanded || isHovered || isMobileOpen)" style="overflow:hidden">
                  <ul class="mt-1 ml-9 space-y-0.5">
                    <li v-for="sub in proyectosItems" :key="sub.path">
                      <router-link :to="sub.path" class="menu-dropdown-item hover:bg-gray-100 hover:text-gray-700" :class="isActive(sub.path) ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'">
                        {{ sub.name }}
                      </router-link>
                    </li>
                  </ul>
                </div>
              </transition>
            </li>
          </template>

          <!-- ── EXPERIMENTOS ── -->
          <template v-if="securityStore.isExperimentador">
            <li>
              <router-link
                to="/experiments"
                class="menu-item group hover:bg-gray-100 hover:text-gray-700"
                :class="[
                  isActive('/experiments') ? 'menu-item-active' : 'menu-item-inactive',
                  !isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start',
                ]"
              >
                <span :class="isActive('/experiments') ? 'menu-item-icon-active' : 'menu-item-icon-inactive group-hover:text-gray-600'">
                  <FlaskConical class="w-5 h-5 flex-shrink-0" />
                </span>
                <span v-if="isExpanded || isHovered || isMobileOpen" class="text-sm font-medium whitespace-nowrap">
                  Experimentos
                </span>
              </router-link>
            </li>
          </template>

          <!-- ── ADMINISTRACIÓN (solo ADMIN) ── -->
          <template v-if="securityStore.isAdmin">
            <li>
              <button
                @click="toggleSubmenu('admin')"
                class="menu-item group w-full hover:bg-gray-100 hover:text-gray-700"
                :class="[
                  isSubmenuOpen('admin') ? 'menu-item-active' : 'menu-item-inactive',
                  !isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start',
                ]"
              >
                <span :class="isSubmenuOpen('admin') ? 'menu-item-icon-active' : 'menu-item-icon-inactive group-hover:text-gray-600'">
                  <ShieldCheck class="w-5 h-5 flex-shrink-0" />
                </span>
                <span v-if="isExpanded || isHovered || isMobileOpen" class="text-sm font-medium whitespace-nowrap">
                  Administración
                </span>
                <ChevronDown
                  v-if="isExpanded || isHovered || isMobileOpen"
                  class="ml-auto w-4 h-4 transition-transform duration-200 flex-shrink-0"
                  :class="isSubmenuOpen('admin') ? 'rotate-180 text-brand-500' : 'text-gray-400'"
                />
              </button>
              <transition @enter="startTransition" @after-enter="endTransition" @before-leave="startTransition" @after-leave="endTransition">
                <div v-show="isSubmenuOpen('admin') && (isExpanded || isHovered || isMobileOpen)" style="overflow:hidden">
                  <ul class="mt-1 ml-9 space-y-0.5">
                    <li>
                      <router-link to="/manage-user-role/users" class="menu-dropdown-item hover:bg-gray-100 hover:text-gray-700" :class="isActive('/manage-user-role/users') ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'">
                        Usuarios
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/reports/person-report" class="menu-dropdown-item hover:bg-gray-100 hover:text-gray-700" :class="isActive('/reports/person-report') ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'">
                        Reporte de personas
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/reports/finished-teams" class="menu-dropdown-item hover:bg-gray-100 hover:text-gray-700" :class="isActive('/reports/finished-teams') ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'">
                        Equipos Cerrados
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/reports/list-workers" class="menu-dropdown-item hover:bg-gray-100 hover:text-gray-700" :class="isActive('/reports/list-workers') ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'">
                        Listar personas
                      </router-link>
                    </li>

                  </ul>
                </div>
              </transition>
            </li>
          </template>

        </ul>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useSecurityStore } from '@/core/store/security.store.js'
import { useSidebar } from '@/core/composables/useSidebar.js'

import {
  LayoutDashboard,
  Settings,
  Cog,
  Users,
  Briefcase,
  BookOpen,
  Shield,
  ShieldCheck,
  UserCog,
  FolderCog,
  FlaskConical,
  ChevronDown,
} from 'lucide-vue-next'

const route = useRoute()
const securityStore = useSecurityStore()
const { isExpanded, isMobileOpen, isHovered, openSubmenu, setIsHovered, toggleSubmenu } = useSidebar()

// ── Nested submenu state (level 3) ──
const openNestedSubmenu = ref(null)

function toggleNestedSubmenu(key) {
  openNestedSubmenu.value = openNestedSubmenu.value === key ? null : key
}

function isNestedOpen(key) {
  return openNestedSubmenu.value === key
}

// ── Route helpers ──
const isActive = (path) => route.path === path

// Auto-expand submenu that contains the active route
const isSubmenuOpen = (key) => {
  if (openSubmenu.value === key) return true
  // Auto-open if active route belongs to this section
  const activeMap = {
    configurar: configurarAllPaths.value,
    rrhh: rrhhItems.value.map(i => i.path),
    proyectos: proyectosItems.value.map(i => i.path),
    admin: ['/manage-user-role/users', '/reports/person-report', '/reports/finished-teams', '/reports/list-workers'],
  }
  return activeMap[key]?.some(p => route.path.startsWith(p)) ?? false
}

// ── Configurar sub-data ──
const configurarCompetencias = [
  { name: 'Importancia', path: '/nomenclatives/competence-importance' },
  { name: 'Niveles', path: '/nomenclatives/levels' },
]

const configurarRol = [
  { name: 'Costo de distancia', path: '/nomenclatives/cost-distance' },
  { name: 'Carga del rol', path: '/nomenclatives/role-load' },
]

const configurarPersona = [
  { name: 'Grupos', path: '/nomenclatives/person-group' },
  { name: 'Evaluación de rol', path: '/nomenclatives/role-eval' },
  { name: 'Índice de conflicto', path: '/nomenclatives/conflict-index' },
  { name: 'Nacionalidad', path: '/nomenclatives/nacionality' },
  { name: 'Provincia', path: '/nomenclatives/county' },
  { name: 'Raza', path: '/nomenclatives/race' },
  { name: 'Religión', path: '/nomenclatives/religion' },
  { name: 'Rango de edad', path: '/nomenclatives/age-group' },
]

const configurarProyecto = [
  { name: 'Entidad cliente', path: '/nomenclatives/client-entity' },
  { name: 'Estructuras', path: '/nomenclatives/project-structure' },
]

const configurarAllPaths = computed(() => [
  ...configurarCompetencias,
  ...configurarRol,
  ...configurarPersona,
  ...configurarProyecto,
].map(i => i.path))

// Auto-expand nested submenus when active route is inside them
watchEffect(() => {
  const nestedMap = {
    'config-competencias': configurarCompetencias.map(i => i.path),
    'config-rol': configurarRol.map(i => i.path),
    'config-persona': configurarPersona.map(i => i.path),
    'config-proyecto': configurarProyecto.map(i => i.path),
  }
  for (const [key, paths] of Object.entries(nestedMap)) {
    if (paths.includes(route.path)) {
      openNestedSubmenu.value = key
      break
    }
  }
})

// ── Recursos Humanos ──
const rrhhItems = computed(() => [
  { name: 'Competencias', path: '/manage-competences/competence' },
  { name: 'Roles', path: '/manage-roles/role' },
  { name: 'Personas', path: '/person' },
  { name: 'Importar Personas', path: '/import' },
])

// ── Proyectos ──
const proyectosItems = computed(() => {
  const items = []
  if (securityStore.isDirectivoTecnico || securityStore.isExperimentador) {
    items.push(
      { name: 'Proyectos', path: '/manage-projects/project' },
      { name: 'Formar equipo', path: '/manage-projects/team-formation' },
      { name: 'Finalizar equipo', path: '/manage-projects/finalize-team' },
    )
  }
  if (securityStore.isJefeEquipo || securityStore.isDirectivoTecnico) {
    items.push({ name: 'Cerrar equipo', path: '/manage-projects/close-team' })
  }
  return items
})

// ── Height transition helpers ──
const startTransition = (el) => {
  el.style.height = 'auto'
  const height = el.scrollHeight
  el.style.height = '0px'
  el.offsetHeight // force reflow
  el.style.height = height + 'px'
}

const endTransition = (el) => {
  el.style.height = ''
}
</script>
