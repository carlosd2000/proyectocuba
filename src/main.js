import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/authStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Inicializa el authStore
const authStore = useAuthStore()
authStore.initializeAuthListener().then(() => {
    app.mount('#app')
})  