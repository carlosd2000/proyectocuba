import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/authStore'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// 1. Crear la app y pinia primero
const app = createApp(App)
const pinia = createPinia()

// 2. Configurar plugins
app.use(pinia)
app.use(router)

// 3. Inicializar autenticación ANTES de montar
const authStore = useAuthStore()

// 4. Montar la app solo después de verificar autenticación
authStore.initializeAuthListener().finally(() => {
  app.mount('#app')
})