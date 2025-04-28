import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/adminview',
      name: 'AdminView',
      component: () => import('../views/AdminView.vue'),
    },
    {
      path: '/listeros',
      name: 'Listeros',
      component: () => import('../views/Listeros.vue'),
    },
    {
      path: '/',
      name: 'Login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/anadirjugada',
      name: 'anadirjugada',       
      component: () => import('../views/AñadirJugada.vue'),
    },
    {
      path: '/parlet',
      name: 'Parlet',     
      component: () => import('../views/Parlet.vue'),
    },
    {
      path: '/listas',
      name: 'Listas',     
      component: () => import('../views/Listas.vue'),
    },
    {
      path: '/admin',
      name: 'Admi n',     
      component: () => import('../views/Registros.vue'),
    },
    {
      path: '/bancos',
      name: 'Bancos',     
      component: () => import('../views/Registros.vue'),
    },
    {
      path: '/colectores',
      name: 'Colectores',     
      component: () => import('../views/Registros.vue'),
    },
    {
      path: '/horario',
      name: 'Horario',
      component: () => import('../views/Horario.vue'),
    },
    {
      path: '/patherlist',
      name: 'PatherList',
      component: () => import('../views/PatherList.vue'),
    },
  ],
})  

export default router
