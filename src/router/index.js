import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {      
      path: '/adminview/:id',      
      name: 'AdminView',      
      component: () => import('../views/AdminView.vue'),
<<<<<<< HEAD
      meta: { requiresAuth: true }   
=======
      meta: { requiresAuth: true },
>>>>>>> 63472598e549e15401c3b3246ad2fe9a77e05fc3
    },
    {
      path: '/',
      name: 'login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/listeros/:id',
      name: 'listeros',
      component: () => import('../views/Listeros.vue'),
<<<<<<< HEAD
      meta: { requiresAuth: true }
=======
      meta: { requiresAuth: true },
>>>>>>> 63472598e549e15401c3b3246ad2fe9a77e05fc3
    },
    {
      path: '/admin/:id',
      name: 'admin',
      component: () => import('../views/Registros.vue'),
<<<<<<< HEAD
      meta: { requiresAuth: true }
=======
      meta: { requiresAuth: true },
>>>>>>> 63472598e549e15401c3b3246ad2fe9a77e05fc3
    },
    {
      path: '/bancos/:id',
      name: 'bancos',
      component: () => import('../views/Registros.vue'),
<<<<<<< HEAD
      meta: { requiresAuth: true }
=======
      meta: { requiresAuth: true },
>>>>>>> 63472598e549e15401c3b3246ad2fe9a77e05fc3
    },
    {
      path: '/colectores/:id',
      name: 'colectores',
      component: () => import('../views/Registros.vue'),
<<<<<<< HEAD
      meta: { requiresAuth: true }
=======
      meta: { requiresAuth: true },
>>>>>>> 63472598e549e15401c3b3246ad2fe9a77e05fc3
    },
    {
      path: '/anadirjugada/:id',
      name: 'anadirjugada',
      component: () => import('../views/AñadirJugada.vue'),
<<<<<<< HEAD
      meta: { requiresAuth: true }
=======
      meta: { requiresAuth: true },
>>>>>>> 63472598e549e15401c3b3246ad2fe9a77e05fc3
    },
    {
      path: '/listas/:id',
      name: 'listas',
      component: () => import('../views/Listas.vue'),
<<<<<<< HEAD
      meta: { requiresAuth: true }
=======
      meta: { requiresAuth: true },
>>>>>>> 63472598e549e15401c3b3246ad2fe9a77e05fc3
    },
    {
      path: '/horario/:id',
      name: 'horario',
      component: () => import('../views/Horario.vue'),
<<<<<<< HEAD
      meta: { requiresAuth: true }
=======
      meta: { requiresAuth: true },
>>>>>>> 63472598e549e15401c3b3246ad2fe9a77e05fc3
    },
    {
      path: '/wallet/:id',
      name: 'wallet',
<<<<<<< HEAD
      component: () => import('../views/wallet.vue'),
      meta: { requiresAuth: true }
=======
      component: () => import('../views/Wallet.vue'),
      meta: { requiresAuth: true },
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
      meta: { requiresAuth: true },
    },
    {
      path: '/transferencias/:id',
      name: 'transferencias',
      component: () => import('../views/Transferencias.vue'),
      meta: { requiresAuth: true },
>>>>>>> 63472598e549e15401c3b3246ad2fe9a77e05fc3
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
