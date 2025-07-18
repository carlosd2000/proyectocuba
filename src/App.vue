<script setup>
import { useAuthStore } from '@/stores/authStore'
import { ref, watchEffect, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import ToastManager from './components/ToastManager.vue'
import { cargarLibreriasIniciales } from './scripts/useAppInitializer.js'

const router = useRouter()
const authStore = useAuthStore()
const isAppReady = ref(false)

let fondoManager = null
let fondoCreadorManager = null
let usuariosCreadosManager = null

onMounted(async () => {
  try {
    await authStore.initializeAuthListener()
    if (authStore.user) {
      await authStore.loadUserProfile()
    }
    isAppReady.value = true
  } catch (error) {
    console.error('Error inicializando Auth:', error)
    isAppReady.value = true
  }
})

// Elimina watchEffect y reemplázalo con un watch controlado:
watch(
  () => authStore.user && authStore.profile && authStore.bancoId, // Solo se dispara cuando TODO está listo
  async (ready) => {
    if (ready) {
      const { 
        fondoManager: fondo, 
        fondoCreadorManager: fondoCreador, 
        usuariosCreadosManager: usuarios 
      } = await cargarLibreriasIniciales(authStore);
      
      fondoManager = fondo;
      fondoCreadorManager = fondoCreador;
      usuariosCreadosManager = usuarios;
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  fondoManager?.detenerSincronizacion?.()
  fondoCreadorManager?.detenerSincronizacion?.()
  usuariosCreadosManager?.detener?.()
})

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