// scripts/useAppInitializer.js
import { useUsuariosCreados } from './useUsuariosCreados'
import { cargarInfoBancoSiNoExiste } from './fieldValidator.js'
import { sincronizarHorasDeCierre } from './syncHorasCierre.js'
import { obtenerApuestas } from './obtenerApuestas.js'

export async function cargarLibreriasIniciales(authStore) {
  let fondoManager = null
  let fondoCreadorManager = null
  let usuariosCreadosManager = null

  try {
    // Importaciones dinámicas
    const { useFondo } = await import('@/scripts/useFondo.js')
    fondoManager = useFondo()
    await fondoManager.iniciar()

    if (authStore.userType !== 'listeros') {
      const { useFondoCreador } = await import('@/scripts/useFondoCreador.js')
      fondoCreadorManager = useFondoCreador()
      await fondoCreadorManager.iniciar()

      usuariosCreadosManager = useUsuariosCreados()
      await usuariosCreadosManager.iniciar()
    }

    if (authStore.bancoId) {
      cargarInfoBancoSiNoExiste(authStore.bancoId)
      await sincronizarHorasDeCierre()
      // ...y luego cada 10 minutos
      setInterval(() => {
        sincronizarHorasDeCierre()
      }, 60 * 60 * 1000)
    }
    
    if (authStore.user?.uid) {
      await obtenerApuestas(authStore.user.uid)
    }
    return {
      fondoManager,
      fondoCreadorManager,
      usuariosCreadosManager
    }
  } catch (error) {
    console.error('Error durante carga inicial:', error)
    return {}
  }
}
