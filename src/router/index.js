import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import {useAuthStore} from "@/store/authStore.js";
import Religion from "@/views/nomenclatives/Religion.vue";

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
                component: Dashboard,
                meta: {
                    breadcrumb: [
                        {
                            name: 'Dashboard', disable: true
                        }
                    ]
                }
            },
            {
                path: 'nomenclatives/religion',
                name: 'Religion',
                component: Religion,
                meta:{
                    breadcrumb: [
                        {
                            name: 'Religión', disable: true
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