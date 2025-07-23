import { ref, watch, onUnmounted } from 'vue'

export function useCandadoHorario(fechaSeleccionada, horarioSeleccionado) {
  const candadoAbierto = ref(false)
  const horaCierre = ref(null)
  const serverTime = ref(null)
  let intervalId = null

  async function obtenerHoraLocalAjustada() {
    const now = new Date()
    now.setHours(now.getHours() + 1) // Ajuste si tu hora local está una hora menos que Cuba
    return now
  }

  async function actualizarEstadoCandado() {
    const hoy = new Date()
    const fecha = new Date(fechaSeleccionada.value)
    hoy.setHours(0, 0, 0, 0)
    fecha.setHours(0, 0, 0, 0)

    const horarioKey = (horarioSeleccionado.value || '').toLowerCase()

    const cache = leerHoraCierreCache(fechaSeleccionada, horarioKey)
    const now = await obtenerHoraLocalAjustada()
    serverTime.value = now

    if (!cache || !cache.hora || !cache.activo) {
      candadoAbierto.value = false
      horaCierre.value = null
      return
    }

    // Convertimos la hora 'HH:MM' a objeto Date
    const [hh, mm] = cache.hora.split(':').map(Number)
    const cierre = new Date()
    cierre.setHours(hh, mm, 0, 0)

    horaCierre.value = cierre.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    if (fecha.getTime() < hoy.getTime()) {
      // Fecha pasada
      candadoAbierto.value = false
    } else if (fecha.getTime() > hoy.getTime()) {
      // Fecha futura
      candadoAbierto.value = true
    } else {
      // Hoy
      candadoAbierto.value = now < cierre
    }
  }

  function leerHoraCierreCache(fechaSeleccionada, horarioKey) {
    const fecha = new Date(fechaSeleccionada.value)
    fecha.setHours(0, 0, 0, 0)
    const fechaKey = fecha.toISOString().slice(0, 10)

    const cache = JSON.parse(localStorage.getItem('horaCierreCache') || '{}')
    return cache[fechaKey]?.[horarioKey] || null
  }

  function startIntervalIfToday() {
    clearInterval(intervalId)
    const hoy = new Date()
    const fecha = new Date(fechaSeleccionada.value)
    hoy.setHours(0, 0, 0, 0)
    fecha.setHours(0, 0, 0, 0)
    if (fecha.getTime() === hoy.getTime()) {
      intervalId = setInterval(actualizarEstadoCandado, 1000)
    }
  }

  watch([fechaSeleccionada, horarioSeleccionado], () => {
    actualizarEstadoCandado()
    startIntervalIfToday()
  }, { immediate: true })

  onUnmounted(() => {
    clearInterval(intervalId)
  })

  return {
    candadoAbierto,
    horaCierre,
    serverTime,
    actualizarEstadoCandado
  }
}
