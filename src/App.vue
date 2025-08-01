<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import { database } from './firebase/config.js'
import { ref as dbRef, onValue } from 'firebase/database'
import { cargarLibreriasIniciales } from './composables/useAppInitializer.js'
import { iniciarRelojGlobal } from './composables/useHoraGlobal.js'
import { useHorariosMonitor } from './composables/useSobrepasadoMonitor.js' 
import ToastManager from './components/ToastManager.vue'

const router = useRouter()
const authStore = useAuthStore()
const isAppReady = ref(false)

const { estadosHorarios, contadores, actualizarEstadosHorarios } = useHorariosMonitor()

let fondoManager = null
let fondoCreadorManager = null
let usuariosCreadosManager = null

onMounted(async () => {
  try {
    // await authStore.initializeAuthListener()
    // if (authStore.user) {
    //   await authStore.loadUserProfile()
    // }
    iniciarRelojGlobal()
    console.log('horaGlobal:', localStorage.getItem('horaGlobal'))
    console.log('horaCierreCache:', JSON.parse(localStorage.getItem('horaCierreCache') || '{}'))
    actualizarEstadosHorarios()
    
    isAppReady.value = true
  } catch (error) {
    console.error('Error inicializando Auth:', error)
    isAppReady.value = true
  }

})

let tiroRef = null
let unsubscribeTiro = null

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

      const userType = authStore.userType;
      if(userType !== 'bancos') {
        const bancoId = authStore.bancoId;
        if (bancoId) {
          tiroRef = dbRef(database, `tirosPorBanco/${bancoId}`)

          unsubscribeTiro = onValue(tiroRef, (snapshot) => {
            const data = snapshot.val()
            if (data) {
              const hoy = new Date().toISOString().slice(0, 10)

              // Preparar objeto para almacenar localmente
              const tirosLocales = JSON.parse(localStorage.getItem('tirosLocales') || '{}')

              // Iterar por los tiros del día (puede haber mañana, tarde, noche)
              for (const horario in data) {
                const tiro = data[horario]

                if (!tiro?.timestamp) continue

                const fechaTiro = new Date(tiro.timestamp).toISOString().slice(0, 10)

                // Solo guardar si el tiro es del día actual
                if (fechaTiro === hoy) {
                  // Asegurar estructura
                  if (!tirosLocales[hoy]) {
                    tirosLocales[hoy] = {}
                  }

                  // Guardar por horario: mañana, tarde, noche...
                  tirosLocales[hoy][horario] = {
                    tiro: tiro.tiro,
                    timestamp: tiro.timestamp
                  }

                  console.log(`📥 Guardado tiro local [${horario}]:`, tiro.tiro)
                }
              }

              // Guardar de vuelta en localStorage
              localStorage.setItem('tirosLocales', JSON.stringify(tirosLocales))
            }
          })
        }
      }
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  fondoManager?.detenerSincronizacion?.()
  fondoCreadorManager?.detenerSincronizacion?.()
  usuariosCreadosManager?.detener?.()
  if (unsubscribeTiro && typeof unsubscribeTiro === 'function') {
    unsubscribeTiro()
  }
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