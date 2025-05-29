<script setup>
import { useAuthStore } from '@/stores/authStore'
import { watch, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { iniciarMonitorHorarios } from '@/scripts/monitorHorarios.js';

const router = useRouter()
const authStore = useAuthStore()
const isAppReady = ref(false)
let unsubscribeMonitor = ref(null);

onMounted(async () => {
  await authStore.initializeAuthListener();
  isAppReady.value = true;
  
  // Solo iniciar el monitor si hay usuario autenticado
  watch(() => authStore.user, (user) => {
    if (user) {
      unsubscribeMonitor.value = iniciarMonitorHorarios();
    } else if (unsubscribeMonitor.value) {
      unsubscribeMonitor.value();
      unsubscribeMonitor.value = null;
    }
  }, { immediate: true });
});

onUnmounted(() => {
  if (unsubscribeMonitor.value) {
    unsubscribeMonitor();
  }
});

// Redirección basada en autenticación
watch(() => authStore.user, (user) => {
  if (user && authStore.profile) {
    const redirectPath = authStore.userType === 'admin' 
      ? `/adminview/${authStore.userId}`
      : `/${authStore.userType}/${authStore.userId}`
    
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