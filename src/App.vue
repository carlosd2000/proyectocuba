<script setup>
import { useAuthStore } from '@/stores/authStore'
import { watch, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import ToastManager from './components/ToastManager.vue'
import { cargarInfoBancoSiNoExiste } from './scripts/fieldValidator.js'
import { useUsuariosCreados } from './scripts/useUsuariosCreados'

const router = useRouter()
const authStore = useAuthStore()
const isAppReady = ref(false)

let fondoManager = null
let fondoCreadorManager = null
let usuariosCreadosManager = null 

onMounted(async () => {
  try {
    await authStore.initializeAuthListener();
    
    // Importación dinámica
    const { useFondo } = await import('@/scripts/useFondo.js')
    fondoManager = useFondo()
    await fondoManager.iniciar()
    
    if (authStore.userType !== 'listeros') {
      const { useFondoCreador } = await import('@/scripts/useFondoCreador.js')
      fondoCreadorManager = useFondoCreador()
      await fondoCreadorManager.iniciar()

      // ✅ Inicia sincronización de usuarios
      usuariosCreadosManager = useUsuariosCreados()
      await usuariosCreadosManager.iniciar()
    }

    isAppReady.value = true;
    if (authStore.bancoId) {
      cargarInfoBancoSiNoExiste(authStore.bancoId)
    }
  } catch (error) {
    console.error('Error inicializando aplicación:', error)
    isAppReady.value = true // Asegurar que la app se muestre incluso con error
  }
});

// Limpieza al desmontar
onUnmounted(() => {
  if (fondoManager) fondoManager.detenerSincronizacion?.()
  if (fondoCreadorManager) fondoCreadorManager.detenerSincronizacion?.()
  usuariosCreadosManager?.detener?.()
})

// Redirección basada en autenticación
watch(() => authStore.user, (user) => {
  if (user && authStore.profile) {
    const redirectPath = authStore.userType === 'admin' 
      ? `/adminview/${authStore.userId}`
      : `/home/${authStore.userId}`
    
    if (window.location.pathname === '/') {
      router.push(redirectPath)
    }
  }
}, { immediate: true })
</script>

<template>
  <div v-if="!isAppReady" class="global-loading">
    <div class="spinner"></div>
  </div>
  <RouterView v-else />
  <ToastManager />
</template>

<style>
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 1000;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>