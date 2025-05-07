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
      path: '/parlet/:id',
      name: 'parlet',
      component: () => import('../views/Parlet.vue'),
    },
    {
      path: '/candado/:id',
      name: 'candado',
      component: () => import('../views/Candado.vue'),
    },
    {
      path: '/listas/:id',
      name: 'listas',
      component: () => import('../views/Listas.vue'),
    },
    {
      path: '/horario',
      name: 'horario',
      component: () => import('../views/Horario.vue'),
    },
    {      
      path: '/patherlist/:id',      
      name: 'Patherlist',
      component: () => import('../views/Patherlist.vue'),          
    },
    {
      path: '/centena/:id',
      name: 'Centena',
      component: () => import('../views/Centena.vue'),
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

// Guardia de navegación global
router.beforeEach(async (to) => {
  const publicRoutes = ['login'] // Añade otras rutas públicas si existen
  const userProfile = JSON.parse(localStorage.getItem('userProfile'))
  
  // Si no está logueado y la ruta no es pública
  if (!userProfile && !publicRoutes.includes(to.name)) {
    return '/'
  }
  
  // Si está logueado y trata de ir al login
  if (userProfile && to.name === 'login') {
    return `/${userProfile.tipo}/${userProfile.uid}`
  }
})


export default router
