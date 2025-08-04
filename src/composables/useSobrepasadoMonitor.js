import { ref, watch, onMounted, onUnmounted } from 'vue'

export function useHorariosMonitor() {
  console.log('useHorariosMonitor initialized')
  const estadosHorarios = ref({})
  const contadores = ref({})
  let intervalId = null
  let timeoutId = null

  // Calcula los minutos restantes para cada horario
  const calcularMinutosRestantes = (horaActual, horaCierre) => {
    if (!horaCierre) return Infinity // Valor alto para horarios no configurados
    const [horaStr, minutoStr] = horaCierre.split(':').map(Number)
    const horaLimiteMin = horaStr * 60 + minutoStr
    const horaActualMin = horaActual.getHours() * 60 + horaActual.getMinutes()
    const segundosRestantes = (horaLimiteMin - horaActualMin) * 60 // <- Esto es nuevo
    console.log(`Segundos restantes para cierre: ${segundosRestantes}s`) // <- Único console.log agregado
    return horaLimiteMin - horaActualMin
  }

  // Encuentra el horario más cercano a cerrarse
  const encontrarHorarioMasCercano = (horaActual, cache) => {
    let horarioCercano = null
    let minMinutosRestantes = Infinity

    const horarios = ['dia', 'tarde', 'noche']
    horarios.forEach(horario => {
      const datos = cache[horario]
      if (datos?.activo && datos?.hora) {
        const minutos = calcularMinutosRestantes(horaActual, datos.hora)
        if (minutos < minMinutosRestantes && minutos > 0) {
          minMinutosRestantes = minutos
          horarioCercano = horario
        }
      }
    })

    return { horario: horarioCercano, minutos: minMinutosRestantes }
  }

  // Actualiza todos los estados y contadores
  const actualizarEstadosCompletos = () => {
    try {
      console.log('Actualizando estados horarios...')
      const horaGlobalRaw = localStorage.getItem('horaGlobal')
      const cacheCompleto = JSON.parse(localStorage.getItem('horaCierreCache') || '{}')

      
      if (!horaGlobalRaw) {
        console.warn('No hay horaGlobal disponible')
        return
      }

      const horaActual = new Date(horaGlobalRaw)
      const nuevosEstados = {}
      const nuevosContadores = {}
      const horarios = ['dia', 'tarde', 'noche']
      
      if (isNaN(horaActual.getTime())) {
        console.warn('horaGlobal no es una fecha válida:', horaGlobalRaw)
        return
      }

      horarios.forEach(horario => {
        const datosHorario = cacheCompleto[horario] || {}
        const activo = !!datosHorario.activo
        const minutosRestantes = calcularMinutosRestantes(horaActual, datosHorario.hora)
        const sobrepasado = minutosRestantes <= 0

        nuevosEstados[horario] = { activo, sobrepasado }
        nuevosContadores[horario] = minutosRestantes > 0 ? minutosRestantes : 0
      })

      estadosHorarios.value = nuevosEstados
      contadores.value = nuevosContadores
      localStorage.setItem('horariosCache', JSON.stringify(nuevosEstados))

      // Programar próxima actualización cuando llegue a cero
      programarProximaActualizacion(horaActual, cacheCompleto)
    } catch (error) {
      console.error('Error actualizando estados horarios:', error)
    }
  }

  // Programa la próxima actualización para cuando el contador llegue a cero
  const programarProximaActualizacion = (horaActual, cache) => {
    clearTimeout(timeoutId)
    const { horario, minutos } = encontrarHorarioMasCercano(horaActual, cache)
    if (horario && minutos !== Infinity) {
      const msHastaCierre = minutos * 60 * 1000
      // Ajustamos el tiempo para asegurar precisión
      const ahora = new Date().getTime()
      const horaServer = horaActual.getTime()
      const diferencia = ahora - horaServer
      const msAjustados = Math.max(0, msHastaCierre - diferencia)
      
      timeoutId = setTimeout(() => {
        actualizarEstadosCompletos()
      }, msAjustados)
      
      console.log(`Próxima actualización programada en ${Math.round(msAjustados/1000)} segundos`)
    }
  }

  // Watchers para cambios en los datos fuente
  const setupWatchers = () => {
    watch(() => localStorage.getItem('horaGlobal'), () => {
      console.log('Cambio en horaGlobal detectado')
      actualizarEstadosCompletos()
    })

    watch(() => localStorage.getItem('horaCierreCache'), () => {
      console.log('Cambio en horaCierreCache detectado')
      actualizarEstadosCompletos()
    }, { deep: true })
  }

  // Iniciar el sistema
  const iniciar = () => {
    setupWatchers()
    actualizarEstadosCompletos()
    intervalId = setInterval(() => {
      actualizarEstadosCompletos()
    }, 300000)
  }

  // Limpieza
  const limpiar = () => {
    clearInterval(intervalId)
    clearTimeout(timeoutId)
  }

  return {
    estadosHorarios,
    contadores,
    actualizarEstadosHorarios: actualizarEstadosCompletos,
    iniciar,
    limpiar,
  }
}