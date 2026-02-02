import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'

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
                meta:{
                    breadcrumb: [
                        {
                            name: 'Dashboard', disable: true
                        }
                    ]
                }
            },
            // {
            //     path: '/users',
            //     name: 'Users',
            //     component: () => import('@/views/Users.vue'),
            //     meta: {
            //         breadcrumb: [
            //             { name: 'Dashboard', to: '/' },
            //             { name: 'Usuarios', disabled: true }
            //         ]
            //     }
            // },
            // {
            //     path: '/users/create',
            //     name: 'CreateUser',
            //     component: () => import('@/views/CreateUser.vue'),
            //     meta: {
            //         breadcrumb: [
            //             { name: 'Dashboard', to: '/' },
            //             { name: 'Usuarios', to: '/users' },
            //             { name: 'Crear Usuario', disabled: true }
            //         ]
            //     }
            // },
            // {
            //     path: '/users/:id/edit',
            //     name: 'EditUser',
            //     component: () => import('@/views/EditUser.vue'),
            //     meta: {
            //         breadcrumb: [
            //             { name: 'Dashboard', to: '/' },
            //             { name: 'Usuarios', to: '/users' },
            //             { name: 'Editar Usuario', disabled: true }
            //         ]
            //     }
            // }

        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Guard de autenticación
router.beforeEach((to, from, next) => {
    const isPublic = to.matched.some(record => record.meta.public)
    const isAuthenticated = localStorage.getItem('user') // O tu lógica de auth

    if (!isPublic && !isAuthenticated) {
        return next('/login')
    }

    next()
})

export default router