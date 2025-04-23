import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue'),
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
  ],
})

export default router
