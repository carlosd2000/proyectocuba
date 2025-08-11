<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import { database } from './firebase/config.js'
import { ref as dbRef, onValue } from 'firebase/database'
import { cargarLibreriasIniciales } from './composables/useAppInitializer.js'
import { useInicializarHorarios } from './composables/useInicializarHorarios.js'
import { useVerificarTirosLocales } from './composables/useVerificarTirosLocales.js'
import { useSincronizarGanadores } from './composables/useSincronizarGanadores.js'
import ToastManager from './components/ToastManager.vue'

const router = useRouter()
const authStore = useAuthStore()
const isAppReady = ref(false)

const { inicializar } = useInicializarHorarios()
const { tirosRecibidos, verificarTirosLocales } = useVerificarTirosLocales()

let fondoManager = null
let fondoCreadorManager = null
let usuariosCreadosManager = null

onMounted(async () => {
  try {
    verificarTirosLocales()
    isAppReady.value = true
  } catch (error) {
    console.error('Error inicializando Auth:', error)
    isAppReady.value = true
  }
})

let tiroRef = null
let unsubscribeTiro = null

watch(
  () => authStore.user && authStore.profile && authStore.bancoId,
  async (ready) => {
    if (ready) {
      await inicializar()
      const { 
        fondoManager: fondo, 
        fondoCreadorManager: fondoCreador, 
        usuariosCreadosManager: usuarios 
      } = await cargarLibreriasIniciales(authStore);
      
      fondoManager = fondo;
      fondoCreadorManager = fondoCreador;
      usuariosCreadosManager = usuarios;

      const userType = authStore.userType;

      const bancoId = authStore.bancoId;
      if (bancoId) {
        tiroRef = dbRef(database, `tirosPorBanco/${bancoId}`)

        unsubscribeTiro = onValue(tiroRef, (snapshot) => {
          (async () => {
            const data = snapshot.val()
            if (data) {
              const hoy = new Date().toISOString().slice(0, 10)
              const tirosLocales = JSON.parse(localStorage.getItem('tirosLocales') || '{}')

              for (const horario in data) {
                const tiro = data[horario]
                if (!tiro?.timestamp) continue

                const fechaTiro = new Date(tiro.timestamp).toISOString().slice(0, 10)

                if (fechaTiro === hoy) {
                  if (!tirosLocales[hoy]) {
                    tirosLocales[hoy] = {}
                  }

                  tirosLocales[hoy][horario] = {
                    tiro: tiro.tiro,
                    timestamp: tiro.timestamp
                  }

                  console.log(`📥 Guardado tiro local [${horario}]:`, tiro.tiro)
                }
              }

              localStorage.setItem('tirosLocales', JSON.stringify(tirosLocales))
              const ganadores = await useSincronizarGanadores()
            }

            verificarTirosLocales()
          })()
        })
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