import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {      
      path: '/admin/:id',      
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
      path: '/adminregister/:id',
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
      path: '/parlet/:id',
      name: 'parlet',
      component: () => import('../views/Parlet.vue'),
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
