import { ref, watch, onUnmounted } from 'vue'
import { doc, getDoc, getFirestore, Timestamp } from 'firebase/firestore'
import { obtenerBancoPadre } from './FunctionBancoPadre.js'

const db = getFirestore()

export function useCandadoHorario(fechaSeleccionada, horarioSeleccionado) {
  const candadoAbierto = ref(false)
  const horaCierre = ref(null)
  const serverTime = ref(null)
  let intervalId = null

  async function obtenerHoraServidor() {
    // Si tienes un endpoint de hora del servidor, úsalo aquí.
    // Por ahora, usamos la hora local del cliente.
    const now = new Date()
    now.setHours(now.getHours() + 1) // <--- AJUSTE AQUÍ
    return now
  }

async function actualizarEstadoCandado() {
  const hoy = new Date();
  const fecha = new Date(fechaSeleccionada.value);
  hoy.setHours(0, 0, 0, 0);
  fecha.setHours(0, 0, 0, 0);

  const horarioKey = (horarioSeleccionado.value || '').toLowerCase();

  if (!navigator.onLine) {
    // OFFLINE: Solo usa el cache
    const cacheAbierto = leerEstadoCandadoCache(fechaSeleccionada, horarioKey);
    candadoAbierto.value = !!cacheAbierto;
    return;
  }

  // ONLINE: lógica normal
  if (fecha < hoy) {
    candadoAbierto.value = false;
    horaCierre.value = null;
    guardarEstadoCandadoEnCache(fechaSeleccionada, horarioKey, false);
    return;
  }

  const bancoId = await obtenerBancoPadre();
  if (!bancoId) {
    candadoAbierto.value = false;
    horaCierre.value = null;
    guardarEstadoCandadoEnCache(fechaSeleccionada, horarioKey, false);
    return;
  }

  const horarioRef = doc(db, `bancos/${bancoId}/hora`, horarioKey);
  const horarioSnap = await getDoc(horarioRef);
  if (!horarioSnap.exists()) {
    candadoAbierto.value = false;
    horaCierre.value = null;
    guardarEstadoCandadoEnCache(fechaSeleccionada, horarioKey, false);
    return;
  }

  const now = await obtenerHoraServidor();
  serverTime.value = now;

  let cierreDate = null;
  const hora = horarioSnap.data().hora;

  if (hora instanceof Timestamp || (hora && typeof hora.toDate === 'function')) {
    const horaObj = hora.toDate();
    cierreDate = new Date(now);
    cierreDate.setHours(horaObj.getHours(), horaObj.getMinutes(), 0, 0);
  } else {
    candadoAbierto.value = false;
    horaCierre.value = null;
    guardarEstadoCandadoEnCache(fechaSeleccionada, horarioKey, false);
    return;
  }

  horaCierre.value = cierreDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (fecha.getTime() === hoy.getTime()) {
    candadoAbierto.value = now < cierreDate;
    // ACTUALIZA EL CACHE SIEMPRE QUE ESTÉS ONLINE
    guardarEstadoCandadoEnCache(fechaSeleccionada, horarioKey, candadoAbierto.value);
  } else {
    candadoAbierto.value = true;
    guardarEstadoCandadoEnCache(fechaSeleccionada, horarioKey, true);
  }
}
  // Intervalo para actualizar el candado en tiempo real si la fecha es hoy
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

function guardarEstadoCandadoEnCache(fechaSeleccionada, horario, abierto) {
  const fecha = new Date(fechaSeleccionada.value);
  fecha.setHours(0, 0, 0, 0);
  const fechaKey = fecha.toISOString().slice(0, 10); // yyyy-mm-dd
  let cache = JSON.parse(localStorage.getItem('candadoCache') || '{}');
  if (!cache[fechaKey]) cache[fechaKey] = {};
  cache[fechaKey][horario] = abierto;
  localStorage.setItem('candadoCache', JSON.stringify(cache));
}

function leerEstadoCandadoCache(fechaSeleccionada, horario) {
  const fecha = new Date(fechaSeleccionada.value);
  fecha.setHours(0, 0, 0, 0);
  const fechaKey = fecha.toISOString().slice(0, 10);
  const cache = JSON.parse(localStorage.getItem('candadoCache') || '{}');
  return cache[fechaKey]?.[horario];
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