import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {      
      path: '/adminview/:id',      
      name: 'AdminView',      
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/',
      name: 'login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/listeros/:id',
      name: 'listeros',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/:id',
      name: 'admin',
      component: () => import('../views/Registros.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/bancos/:id',
      name: 'bancos',
      component: () => import('../views/Registros.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/colectorprincipal/:id',
      name: 'colectorprincipal',
      component: () => import('../views/Registros.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/colectores/:id',
      name: 'colectores',
      component: () => import('../views/Registros.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/anadirjugada/:id',
      name: 'anadirjugada',
      component: () => import('../views/AñadirJugada.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/lista/:id',
      name: 'lista',
      component: () => import('../views/Lista.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/horario/:id',
      name: 'horario',
      component: () => import('../views/Horario.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/wallet/:id',
      name: 'wallet',
      component: () => import('../views/Wallet.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/monitoreolisteros/:id',
      name: 'monitoreolisteros',
      component: () => import('../views/Monitoreolisteros.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/transacciones/:id',
      name: 'transacciones',
      component: () => import('../views/Transacciones.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/transferencias/:id',
      name: 'transferencias',
      component: () => import('../views/Transferencias.vue'),
      meta: { requiresAuth: true },
    }
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' });
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    next('/adminview/' + authStore.userId); // Redirige al dashboard o vista principal
  } else {
    next();
  }
});

export default router