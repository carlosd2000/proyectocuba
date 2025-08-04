import { watch, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { sincronizarHorasDeCierre } from '@/composables/syncHorasCierre'
import { useHorariosMonitor } from '@/composables/useSobrepasadoMonitor'
import { iniciarRelojGlobal } from '@/composables/useHoraGlobal'

export function useInicializarHorarios() {
  const authStore = useAuthStore()
  let sincronizacionInterval = null
  
  // Inicializa todos los sistemas de horarios
  const inicializarSistemasHorarios = async () => {
    try {
      if (!authStore.bancoId) {
        console.warn('No hay bancoId - no se pueden inicializar horarios')
        return
      }

      console.log('Inicializando sistemas de horarios...')
      
      // 1. Iniciar reloj global (obtiene hora del servidor)
      await iniciarRelojGlobal()
      
      // 2. Sincronizar horarios de cierre desde Firestore
      await sincronizarHorasDeCierre()
      
      // 3. Iniciar monitor de horarios
      const { actualizarEstadosHorarios } = useHorariosMonitor()
      await actualizarEstadosHorarios()
      
      // 4. Programar sincronización periódica (cada hora)
      sincronizacionInterval = setInterval(() => {
        sincronizarHorasDeCierre()
      }, 60 * 60 * 1000)
      
      console.log('Sistemas de horarios inicializados correctamente')
    } catch (error) {
      console.error('Error inicializando sistemas de horarios:', error)
    }
  }

  // Limpieza al desmontar
  const limpiar = () => {
    if (sincronizacionInterval) {
      clearInterval(sincronizacionInterval)
    }
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