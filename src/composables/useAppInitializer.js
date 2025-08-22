// scripts/useAppInitializer.js
import { useUsuariosCreados } from '../scripts/useUsuariosCreados.js'
import { obtenerApuestas } from '../scripts/obtenerApuestas.js'
import { obtenerConfigPagos } from '../scripts/obtenerConfigPagos.js'

export async function cargarLibreriasIniciales(authStore) {
  let fondoManager = null
  let fondoCreadorManager = null
  let usuariosCreadosManager = null
  let configPagosManager = null

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
    configPagosManager = obtenerConfigPagos()
    if (authStore.bancoId) {
      await configPagosManager.cargarConfigPagos(authStore.bancoId)
    }
    
    if (authStore.user?.uid) {
      await obtenerApuestas(authStore.user.uid)
    }
    return {
      fondoManager,
      fondoCreadorManager,
      usuariosCreadosManager,
      configPagosManager,
    }
  } catch (error) {
    console.error('Error durante carga inicial:', error)
    return {}
  }
}
