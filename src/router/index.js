import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import Login from '@/views/Login.vue'
import {useAuthStore} from "@/store/authStore.js";
import nomenclativesRoutes from './nomenclatives.routes.js'

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
        component: MainLayout,
        children: [
            {
                path: '',
                name: 'Dashboard',
                component: () => import('@/views/Dashboard.vue'),
                meta: {
                    breadcrumb: [
                        {
                            name: 'Dashboard', disable: true
                        }
                    ]
                }
            },
            ...nomenclativesRoutes,
            {
                path: 'manage-competences/competence',
                name: 'Competence',
                component: () => import('@/views/Competence.vue'),
                meta: {
                    breadcrumb: [
                        {
                            name: 'Competencias', disable: true
                        }
                    ]
                }
            },
            {
                path: 'manage-roles/role',
                name: 'Role',
                component: () => import('@/views/Role.vue'),
                meta: {
                    breadcrumb: [
                        {
                            name: 'Roles', disable: true
                        }
                    ]
                }
            },
            {
                path: 'person',
                name: 'Person',
                component: () => import('@/views/Person.vue'),
                meta: {
                    breadcrumb: [
                        {
                            name: 'Personas', disable: true
                        }
                    ]
                }
            },
            {
                path: 'manage-projects/project',
                name: 'Project',
                component: () => import('@/views/Project.vue'),
                meta: {
                    breadcrumb: [
                        {
                            name: 'Proyectos', disable: true
                        }
                    ]
                }
            }


        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Guard de autenticación
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    if (requiresAuth && !authStore.isAuthenticated) {
        // Redirigir a login si requiere autenticación y no está autenticado
        next('/login');
    } else if (to.path === '/login' && authStore.isAuthenticated) {
        // Si ya está autenticado y trata de ir a login, redirigir al dashboard
        next('/');
    } else {
        next();
    }
});

export default router