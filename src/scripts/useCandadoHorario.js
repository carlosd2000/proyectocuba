import { ref, watch } from 'vue'
import { doc, getDoc, getFirestore, Timestamp } from 'firebase/firestore'
import { obtenerBancoPadre } from './FunctionBancoPadre.js'

const db = getFirestore()

export function useCandadoHorario(fechaSeleccionada, horarioSeleccionado) {
  const candadoAbierto = ref(false)
  const horaCierre = ref(null)
  const serverTime = ref(null)

  async function obtenerHoraServidor() {
    // Si tienes un endpoint de hora del servidor, úsalo aquí.
    // Por ahora, usamos la hora local del cliente.
    return new Date()
  }

  async function actualizarEstadoCandado() {
    // 1. Si la fecha seleccionada es anterior a hoy, candado cerrado
    const hoy = new Date()
    const fecha = new Date(fechaSeleccionada.value)
    hoy.setHours(0, 0, 0, 0)
    fecha.setHours(0, 0, 0, 0)
    if (fecha < hoy) {
      candadoAbierto.value = false
      horaCierre.value = null
      return
    }

    // 2. Si es hoy, verifica la hora de cierre en la base de datos
    const bancoId = await obtenerBancoPadre()
    if (!bancoId) {
      candadoAbierto.value = false
      horaCierre.value = null
      return
    }

    // 3. Trae la hora de cierre del horario seleccionado
    const horarioKey = (horarioSeleccionado.value || '').toLowerCase()
    const horarioRef = doc(db, `bancos/${bancoId}/hora`, horarioKey)
    const horarioSnap = await getDoc(horarioRef)
    if (!horarioSnap.exists()) {
      candadoAbierto.value = false
      horaCierre.value = null
      return
    }

    // 4. Compara con la hora actual del servidor
    const now = await obtenerHoraServidor()
    serverTime.value = now

    let cierreDate = null
    const hora = horarioSnap.data().hora

    if (hora instanceof Timestamp || (hora && typeof hora.toDate === 'function')) {
      cierreDate = hora.toDate()
    } else {
      console.warn('El campo "hora" no es un Timestamp de Firebase o está indefinido:', hora)
      candadoAbierto.value = false
      horaCierre.value = null
      return
    }

    horaCierre.value = cierreDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    // Si la fecha seleccionada es hoy, compara la hora
    if (fecha.getTime() === hoy.getTime()) {
      candadoAbierto.value = now < cierreDate
    } else {
      // Si la fecha es futura, candado abierto
      candadoAbierto.value = true
    }
  }

  watch([fechaSeleccionada, horarioSeleccionado], actualizarEstadoCandado, { immediate: true })

  return {
    candadoAbierto,
    horaCierre,
    serverTime,
    actualizarEstadoCandado
  }
}