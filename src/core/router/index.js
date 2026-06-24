import { createRouter, createWebHistory } from 'vue-router'
import TeamSoftLayout from '@/core/layout/TeamSoftLayout.vue'
import Login from '@/features/auth/views/Login.vue'
import { useAuthStore } from '@/lib/auth-store'
import nomenclativesRoutes from './nomenclatives.routes.js'
import subEntitiesRoutes from './subEntities.routes.js'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: {
            public: true
        }
    },
    {
        path: '/',
        component: TeamSoftLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                name: 'Dashboard',
                component: () => import('@/features/dashboard/views/Dashboard.vue'),
                meta: {
                    breadcrumb: [
                        {
                            name: 'menu.dashboard', disable: true
                        }
                    ]
                }
            },
            ...nomenclativesRoutes,
            ...subEntitiesRoutes,
            {
                path: '/nomenclatives/project-structure/create',
                name: 'ProjectStructureCreate',
                component: () => import('@/features/projects/views/ProjectStructureFormPage.vue'),
                meta: { title: 'features.projects.structure.createTitle' }
            },
            {
                path: '/nomenclatives/project-structure/edit/:id',
                name: 'ProjectStructureEdit',
                component: () => import('@/features/projects/views/ProjectStructureFormPage.vue'),
                meta: { title: 'features.projects.structure.editTitle' }
            },
            {
                path: 'manage-competences/competence',
                name: 'Competence',
                component: () => import('@/features/competences/views/Competence.vue'),
                meta: { breadcrumb: [{ name: 'menu.competences', disable: true }] }
            },
            {
                path: 'manage-competences/competence/create',
                name: 'CompetenceCreate',
                component: () => import('@/features/competences/views/CompetenceFormPage.vue'),
                props: { mode: 'create' },
                meta: { breadcrumb: [{ name: 'menu.competences', disable: true }] }
            },
            {
                path: 'manage-competences/competence/edit/:id',
                name: 'CompetenceEdit',
                component: () => import('@/features/competences/views/CompetenceFormPage.vue'),
                props: route => ({ mode: 'edit', itemId: route.params.id }),
                meta: { breadcrumb: [{ name: 'menu.competences', disable: true }] }
            },
            {
                path: 'manage-roles/role',
                name: 'Role',
                component: () => import('@/features/roles/views/Role.vue'),
                meta: { breadcrumb: [{ name: 'menu.roles', disable: true }] }
            },
            {
                path: 'manage-roles/role/create',
                name: 'RoleCreate',
                component: () => import('@/features/roles/views/RoleFormPage.vue'),
                props: { mode: 'create' },
                meta: { breadcrumb: [{ name: 'menu.roles', disable: true }] }
            },
            {
                path: 'manage-roles/role/edit/:id',
                name: 'RoleEdit',
                component: () => import('@/features/roles/views/RoleFormPage.vue'),
                props: route => ({ mode: 'edit', itemId: route.params.id }),
                meta: { breadcrumb: [{ name: 'menu.roles', disable: true }] }
            },
            {
                path: 'person',
                name: 'Person',
                component: () => import('@/features/persons/views/Person.vue'),
                meta: { breadcrumb: [{ name: 'menu.persons', disable: true }] }
            },
            {
                path: 'person/create',
                name: 'PersonCreate',
                component: () => import('@/features/persons/views/PersonFormPage.vue'),
                props: { mode: 'create' },
                meta: { breadcrumb: [{ name: 'menu.persons', disable: true }] }
            },
            {
                path: 'person/edit/:id',
                name: 'PersonEdit',
                component: () => import('@/features/persons/views/PersonFormPage.vue'),
                props: route => ({ mode: 'edit', itemId: route.params.id }),
                meta: { breadcrumb: [{ name: 'menu.persons', disable: true }] }
            },
            {
                path: 'manage-projects/project',
                name: 'Project',
                component: () => import('@/features/projects/views/Project.vue'),
                meta: { breadcrumb: [{ name: 'menu.projects', disable: true }] }
            },
            {
                path: 'manage-projects/project/create',
                name: 'ProjectCreate',
                component: () => import('@/features/projects/views/ProjectFormPage.vue'),
                props: { mode: 'create' },
                meta: { breadcrumb: [{ name: 'menu.projects', disable: true }] }
            },
            {
                path: 'manage-projects/project/edit/:id',
                name: 'ProjectEdit',
                component: () => import('@/features/projects/views/ProjectFormPage.vue'),
                props: route => ({ mode: 'edit', itemId: route.params.id }),
                meta: { breadcrumb: [{ name: 'menu.projects', disable: true }] }
            },
            {
                path: 'manage-projects/team-formation',
                name: 'TeamFormation',
                component: () => import('@/features/projects/views/TeamUp.vue'),
                meta: {
                    breadcrumb: [{ name: 'menu.teamFormation', disable: true }]
                }
            },
            {
                path: 'manage-projects/close-team',
                name: 'CloseTeam',
                component: () => import('@/features/projects/views/CloseTeam.vue'),
                meta: {
                    breadcrumb: [{ name: 'menu.closeTeam', disable: true }]
                }
            },
            {
                path: 'manage-projects/close-team/:projectId/evaluate',
                name: 'CloseTeamEvaluate',
                component: () => import('@/features/projects/views/CloseTeamEvaluate.vue'),
                props: true,
                meta: {
                    breadcrumb: [
                        { name: 'menu.closeTeam', path: '/manage-projects/close-team' },
                        { name: 'menu.evaluateLeader', disable: true },
                    ]
                }
            },
            {
                path: 'manage-projects/finalize-team',
                name: 'FinalizeTeam',
                component: () => import('@/features/projects/views/FinalizeTeam.vue'),
                meta: {
                    breadcrumb: [{ name: 'menu.finalizeTeam', disable: true }]
                }
            },
            {
                path: 'manage-projects/finalize-team/:projectId/members',
                name: 'FinalizeTeamMembers',
                component: () => import('@/features/projects/views/FinalizeTeamMembers.vue'),
                props: true,
                meta: {
                    breadcrumb: [
                        { name: 'menu.finalizeTeam', path: '/manage-projects/finalize-team' },
                        { name: 'menu.evaluateMembers', disable: true },
                    ]
                }
            },
            {
                path: 'manage-projects/finalize-team/:projectId/member/:personId',
                name: 'FinalizeMemberCompetences',
                component: () => import('@/features/projects/views/FinalizeMemberCompetences.vue'),
                props: true,
                meta: {
                    breadcrumb: [
                        { name: 'menu.finalizeTeam', path: '/manage-projects/finalize-team' },
                        { name: 'menu.editCompetences', disable: true },
                    ]
                }
            },
            {
                path: 'manage-user-role/users',
                name: 'UserManagement',
                component: () => import('@/features/users/views/UserManagement.vue'),
                meta: { breadcrumb: [{ name: 'menu.users', disable: true }], roles: ['ROLE_ADMIN'] }
            },
            {
                path: 'manage-user-role/users/create',
                name: 'UserCreate',
                component: () => import('@/features/users/views/UserFormPage.vue'),
                props: { mode: 'create' },
                meta: { breadcrumb: [{ name: 'menu.users', disable: true }], roles: ['ROLE_ADMIN'] }
            },
            {
                path: 'manage-user-role/users/edit/:id',
                name: 'UserEdit',
                component: () => import('@/features/users/views/UserFormPage.vue'),
                props: route => ({ mode: 'edit', itemId: route.params.id }),
                meta: { breadcrumb: [{ name: 'menu.users', disable: true }], roles: ['ROLE_ADMIN'] }
            },
            {
                path: 'change-password',
                name: 'ChangePassword',
                component: () => import('@/features/users/views/ChangePassword.vue'),
                meta: {
                    breadcrumb: [{ name: 'menu.changePassword', disable: true }]
                }
            },
            {
                path: 'reports/person-report',
                name: 'PersonReport',
                component: () => import('@/features/reports/views/PersonReport.vue'),
                meta: {
                    breadcrumb: [{ name: 'features.reports.personReport.title', disable: true }],
                    roles: ['ROLE_ADMIN']
                }
            },
            {
                path: 'reports/finished-teams',
                name: 'FinishedTeams',
                component: () => import('@/features/reports/views/FinishedTeams.vue'),
                meta: {
                    breadcrumb: [{ name: 'features.reports.finishedTeams.title', disable: true }],
                    roles: ['ROLE_ADMIN']
                }
            },
            {
                path: 'reports/list-workers',
                name: 'ListWorkers',
                component: () => import('@/features/reports/views/ListWorkers.vue'),
                meta: {
                    breadcrumb: [{ name: 'features.reports.listWorkers.title', disable: true }],
                    roles: ['ROLE_ADMIN']
                }
            },
            {
                path: 'import',
                name: 'Import',
                component: () => import('@/features/import/views/ImportWizard.vue'),
                meta: {
                    breadcrumb: [{ name: 'features.import.title', disable: true }]
                }
            },
            {
                path: 'experiments',
                name: 'ExperimentConfig',
                component: () => import('@/features/experiments/views/ExperimentConfig.vue'),
                meta: {
                    breadcrumb: [{ name: 'features.experiments.configTitle', disable: true }],
                    roles: ['ROLE_EXPERIMENTADOR']
                }
            },
            {
                path: '403',
                name: 'Forbidden',
                component: () => import('@/features/errors/views/Forbidden.vue')
            },
            {
                path: '500',
                name: 'ServerError',
                component: () => import('@/features/errors/views/ServerError.vue')
            },
            {
                path: 'session-expired',
                name: 'SessionExpired',
                component: () => import('@/features/errors/views/SessionExpired.vue')
            }
        ]
    },
    {
        path: '/404',
        name: 'NotFound',
        component: () => import('@/features/errors/views/NotFound.vue')
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/404'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Guard de autenticación y autorización por rol
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const requiredRoles = to.meta?.roles

    // Redirigir a login si requiere autenticación y no está autenticado
    if (requiresAuth && !authStore.isAuthenticated) {
        next('/login')
        return
    }

    // Si ya está autenticado y trata de ir a login, redirigir al dashboard
    if (to.path === '/login' && authStore.isAuthenticated) {
        next('/')
        return
    }

    // Verificar roles requeridos si la ruta los especifica
    if (requiredRoles && requiredRoles.length > 0 && authStore.isAuthenticated) {
        const userRoles = authStore.user?.authorities || []
        const hasRole = requiredRoles.some(role => userRoles.includes(role))
        if (!hasRole) {
            next('/403')
            return
        }
    }

    next()
})

export default router
