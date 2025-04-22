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
  ],
})

export default router
