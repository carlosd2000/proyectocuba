import { ref, watch, onUnmounted } from 'vue'

export function useCandadoHorario(fechaSeleccionada, horarioSeleccionado) {
  const candadoAbierto = ref(false)
  const horaCierre = ref(null)
  const serverTime = ref(null)
  const deviceTime = ref(new Date())
  let intervalId = null

  // Actualiza la hora del dispositivo periódicamente
  const updateDeviceTime = () => {
    deviceTime.value = new Date()
  }

  // Obtiene hora del servidor (horaGlobal) con fallback a dispositivo
  function obtenerHoraServidor() {
    const raw = localStorage.getItem('horaGlobal')
    return raw ? new Date(raw) : null
  }

  // Verifica si un horario está marcado como sobrepasado en el cache
  function estaSobrepasado(horarioKey) {
    const cache = JSON.parse(localStorage.getItem('horariosCache') || '{}')
    return cache[horarioKey]?.sobrepasado === true
  }

  async function actualizarEstadoCandado() {
    const hoy = new Date()
    const fecha = new Date(fechaSeleccionada.value)
    hoy.setHours(0, 0, 0, 0)
    fecha.setHours(0, 0, 0, 0)

    const horarioKey = (horarioSeleccionado.value || '').toLowerCase()
    const cache = JSON.parse(localStorage.getItem('horaCierreCache') || '{}')[horarioKey]
    
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

    // Obtiene tiempos
    const serverNow = obtenerHoraServidor()
    const deviceNow = deviceTime.value
    serverTime.value = serverNow || deviceNow // Usamos serverTime como referencia principal

    // Verifica sobrepasado en cache
    if (estaSobrepasado(horarioSeleccionado)) {
      candadoAbierto.value = false
      return
    }

    // Verifica si ya se recibió el tiro para este horario
    const tirosGuardados = JSON.parse(localStorage.getItem('tirosRecibidos') || '{}')
    const tiroKey = 'tiro' + (horarioSeleccionado.value || '').toLowerCase() 

    if (tirosGuardados[tiroKey] === true) {
      candadoAbierto.value = false
      return
    }

    // Lógica de candado
    if (fecha.getTime() < hoy.getTime()) {
      // Fecha pasada
      candadoAbierto.value = false
    } else if (fecha.getTime() > hoy.getTime()) {
      // Fecha futura
      candadoAbierto.value = true
    } else {
      // Hoy - verificamos ambos criterios (servidor y dispositivo)
      const serverValid = serverNow ? serverNow < cierre : true
      const deviceValid = deviceNow < cierre
      
      candadoAbierto.value = serverValid && deviceValid
    }
  }

  function startIntervalIfToday() {
    clearInterval(intervalId)
    const hoy = new Date()
    const fecha = new Date(fechaSeleccionada.value)
    hoy.setHours(0, 0, 0, 0)
    fecha.setHours(0, 0, 0, 0)
    
    if (fecha.getTime() === hoy.getTime()) {
      // Actualizamos hora del dispositivo cada segundo
      intervalId = setInterval(() => {
        updateDeviceTime()
        actualizarEstadoCandado()
      }, 1000)
    }
  }

  // Watchers
  watch([fechaSeleccionada, horarioSeleccionado], () => {
    actualizarEstadoCandado()
    startIntervalIfToday()
  }, { immediate: true })

  // Observar cambios en los caches
  watch(() => localStorage.getItem('horaCierreCache'), actualizarEstadoCandado, { deep: true })
  watch(() => localStorage.getItem('horariosCache'), actualizarEstadoCandado, { deep: true })

  onUnmounted(() => {
    clearInterval(intervalId)
  })

  return {
    candadoAbierto,
    horaCierre,
    serverTime,
    deviceTime, // Exportamos para debug
    actualizarEstadoCandado
  }
}