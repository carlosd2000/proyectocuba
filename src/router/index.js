import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {      
      path: '/adminview/:id',      
      name: 'AdminView',      
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true, adminOnly: true },
    },
    {
      path: '/',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/home/:id',
      name: 'home',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/:id',
      name: 'admin',
      component: () => import('../views/Registros.vue'),
      meta: { requiresAuth: true, adminOnly: true },
    },
    {
      path: '/bancos/:id',
      name: 'bancos',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/colectorprincipal/:id',
      name: 'colectorprincipal',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/colectores/:id',
      name: 'colectores',
      component: () => import('../views/Home.vue'),
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
      path: '/usuario/:id',
      name: 'usuario',
      component: () => import('../views/Usuario.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/fondo/:id',
      name: 'fondo',
      component: () => import('../views/Fondo.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/registrar/:id',
      name: 'registrar',
      component: () => import('../views/Registros.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/transferir/:id',
      name: 'transferir',
      component: () => import('../views/Transferir.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/payments/:id',
      name: 'payments',
      component: () => import('../views/Payments.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/configpayments/:id',
      name: 'configpayments',
      component: () => import('../views/ConfigPayments.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/notificar/:id',
      name: 'notificar',
      component: () => import('../views/Notificar.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/newnotification/:id',
      name: 'newnotification',
      component: () => import('../views/NewNotification.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/notifications/:id',
      name: 'notifications',
      component: () => import('../views/Notifications.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.adminOnly);

  // Si la ruta requiere autenticación
  if (requiresAuth) {
    if (!authStore.isAuthenticated) {
      authStore.clearAuth();
      return next({ name: 'login' });
    }

    // Si es ruta de admin pero el usuario no es admin
    if (requiresAdmin && authStore.userType !== 'admin') {
      return next(`/home/${authStore.userId}`);
    }

    // Redirigir siempre a /home si intentan acceder a /adminview y no son admin
    if (to.name === 'AdminView' && authStore.userType !== 'admin') {
      return next(`/home/${authStore.userId}`);
    }
  }

  // Si está autenticado y va a login, redirigir a home
  if (to.name === 'login' && authStore.isAuthenticated) {
    return next(`/home/${authStore.userId}`);
  }

  next();
});

export default router