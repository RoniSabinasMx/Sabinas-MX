import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
    { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
    {
        path: '/',
        component: () => import('../views/Dashboard.vue'),
        meta: { requiresAuth: true },
        children: [
            { path: '', name: 'Home', component: () => import('../views/HomeView.vue') },
            { path: '/servicios', name: 'Services', component: () => import('../views/Services.vue') },
            { path: '/textos', name: 'LocaleStrings', component: () => import('../views/LocaleStrings.vue') },
            { path: '/sponsors', name: 'Sponsors', component: () => import('../views/Sponsors.vue') },
            { path: '/configuracion', name: 'Settings', component: () => import('../views/Settings.vue') },
            { path: '/crm', name: 'CRM', component: () => import('../views/CRM.vue') },
        ]
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to) => {
    const auth = useAuthStore()
    if (auth.loading) await auth.init()
    if (to.meta.requiresAuth && !auth.user) return '/login'
    if (to.path === '/login' && auth.user) return '/'
})

export default router
