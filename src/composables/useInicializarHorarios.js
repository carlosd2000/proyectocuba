import { watch, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { sincronizarHorasDeCierre } from '@/composables/syncHorasCierre'
import { useHorariosMonitor } from '@/composables/useSobrepasadoMonitor'
import { iniciarRelojGlobal } from '@/composables/useHoraGlobal'

export function useInicializarHorarios() {
  const authStore = useAuthStore()
  let sincronizacionInterval = null
  const monitor = useHorariosMonitor() 
  
  const inicializarSistemasHorarios = async () => {
    try {
      if (!authStore.bancoId) {
        return
      }
      
      // 1. Iniciar reloj global (obtiene hora del servidor)
      await iniciarRelojGlobal()
      
      // 2. Sincronizar horarios de cierre desde Firestore
      await sincronizarHorasDeCierre()
      
      monitor.iniciar()
      // 3. Iniciar monitor de horarios
      await monitor.actualizarEstadosHorarios()
      
      // 4. Programar sincronización periódica (cada hora)
      sincronizacionInterval = setInterval(() => {
        sincronizarHorasDeCierre()
      }, 60 * 60 * 1000)
      
    } catch (error) {
      console.error('Error inicializando sistemas de horarios:', error)
    }
  }

  // Limpieza al desmontar
  const limpiar = () => {
    if (sincronizacionInterval) {
      clearInterval(sincronizacionInterval)
    }
    monitor.limpiar()
  }

  // Ejecutar inmediatamente y cuando cambie el bancoId
  watch(
    () => authStore.bancoId,
    (bancoId) => {
      if (bancoId) {
        inicializarSistemasHorarios()
      } else {
        limpiar()
      }
    },
    { immediate: true }
  )

  // Limpieza cuando se desmonte el componente
  onUnmounted(() => {
    limpiar()
  })

  return { 
    inicializar: inicializarSistemasHorarios,
    limpiar
  }
}