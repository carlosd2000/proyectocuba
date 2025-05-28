import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {      
      path: '/adminview/:id',      
      name: 'AdminView',      
      component: () => import('../views/AdminView.vue'),    
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
    },
    {
      path: '/admin/:id',
      name: 'admin',
      component: () => import('../views/Registros.vue'),
    },
    {
      path: '/bancos/:id',
      name: 'bancos',
      component: () => import('../views/Registros.vue'),
    },
    {
      path: '/colectores/:id',
      name: 'colectores',
      component: () => import('../views/Registros.vue'),
    },
    {
      path: '/anadirjugada/:id',
      name: 'anadirjugada',
      component: () => import('../views/AñadirJugada.vue'),
    },
    {
      path: '/listas/:id',
      name: 'listas',
      component: () => import('../views/Listas.vue'),
    },
    {
      path: '/horario/:id',
      name: 'horario',
      component: () => import('../views/Horario.vue'),
    },
    {
      path: '/wallet/:id',
      name: 'wallet',
      component: () => import('../views/Wallet.vue'),
    },
    {
      path: '/monitoreolisteros/:id',
      name: 'monitoreolisteros',
      component: () => import('../views/Monitoreolisteros.vue'),
    },
    {
      path: '/transacciones/:id',
      name: 'transacciones',
      component: () => import('../views/Transacciones.vue'),
    }
    // Ruta opcional para registro directo con tipo + id
    // Puedes comentar esta línea si aún no la usas
    // {
    //   path: '/register/:tipo/:id',
    //   name: 'register',
    //   component: () => import('../views/Registros.vue'),
    // },
  ],
})

export default router
