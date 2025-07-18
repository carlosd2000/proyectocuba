import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/authStore'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const authStore = useAuthStore()

// Inicializa el authStore antes de montar la app
authStore.initializeAuthListener().finally(() => {
  // Verificar si está en adminview y redirigir si es necesario
  if (window.location.pathname.includes('/adminview/') && authStore.userType !== 'admin') {
    router.replace(`/home/${authStore.userId}`)
  }
  app.mount('#app')
})