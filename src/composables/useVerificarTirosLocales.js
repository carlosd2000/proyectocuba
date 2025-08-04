import { ref } from 'vue'

const tirosRecibidos = ref({
  tirodia: false,
  tirotarde: false,
  tironoche: false
})

export function useVerificarTirosLocales() {
  function verificar() {
    const hoy = new Date().toISOString().slice(0, 10)
    const fechaGuardada = localStorage.getItem('fechaTirosRecibidos')
    const tirosLocalesPorFecha = JSON.parse(localStorage.getItem('tirosLocales') || '{}')
    const tirosLocales = tirosLocalesPorFecha[hoy] || {}

    let nuevoEstado = {
      tirodia: !!tirosLocales['Dia'],
      tirotarde: !!tirosLocales['Tarde'],
      tironoche: !!tirosLocales['Noche']
    }

    if (fechaGuardada !== hoy) {
      // Día nuevo: reiniciar pero también volver a revisar tirosLocales por si ya hay
      console.log('📆 Día nuevo detectado, reiniciando estado...')
    }

    // Solo actualizamos si algo cambió
    const haCambiado =
      tirosRecibidos.value.tirodia !== nuevoEstado.tirodia ||
      tirosRecibidos.value.tirotarde !== nuevoEstado.tirotarde ||
      tirosRecibidos.value.tironoche !== nuevoEstado.tironoche

    if (haCambiado || fechaGuardada !== hoy) {
      tirosRecibidos.value = nuevoEstado
      localStorage.setItem('tirosRecibidos', JSON.stringify(nuevoEstado))
      localStorage.setItem('fechaTirosRecibidos', hoy)
      console.log('✅ Verificados tirosRecibidos desde tirosLocales:', nuevoEstado)
    } else {
      console.log('ℹ️ No hubo cambios en tirosRecibidos:', nuevoEstado)
    }
  }

  return {
    tirosRecibidos,
    verificarTirosLocales: verificar
  }
}
