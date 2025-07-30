// src/composables/useTotalPorHorario.js
import { ref, computed, onMounted, watch } from 'vue'
import { sincronizarPendientes } from '../scripts/añadir.js'
import localforage from 'localforage'

export default function useTotalPorHorario(fechaRef) {
  const isOnline = ref(navigator.onLine)
  const apuestasLocales = ref([])
  const CACHE_DURATION_HOURS = 12

  const esMismoDia = (fechaA, fechaB) => {
    try {
      const a = new Date(fechaA)
      const b = new Date(fechaB)
      return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    } catch {
      return false
    }
  }

  const cargarApuestasDesdeCache = () => {
    try {
      const cacheStr = localStorage.getItem('apuestasFirebaseCache')
      if (!cacheStr) return []

      const cache = JSON.parse(cacheStr)
      const ahora = new Date().getTime()
      const hoy = new Date().toISOString().split('T')[0]

      const esCacheValido = cache.timestamp &&
        (ahora - cache.timestamp < CACHE_DURATION_HOURS * 60 * 60 * 1000) &&
        cache.cacheDate === hoy

      return esCacheValido ? cache.data || [] : []
    } catch {
      return []
    }
  }

async function cargarApuestasLocales() {
  try {
    // Obtener datos de diferentes fuentes
    const hoy = new Date().toISOString().split('T')[0];
    const esHoySeleccionado = esMismoDia(fechaRef.value, new Date());
    
    // 1. Eliminaciones permanentes (todavía en localStorage)
    const eliminacionesPermanentes = JSON.parse(
      localStorage.getItem('eliminacionesPermanentes') || '{}'
    );
    
    // 2. Apuestas por fecha desde LocalForage
    const apuestasPorFecha = await localforage.getItem('apuestasPorFecha') || {};
    const fechaSeleccionadaStr = fechaRef.value.toISOString().split('T')[0];
    const apuestasFecha = apuestasPorFecha[fechaSeleccionadaStr] || [];
    
    // 3. Mutaciones pendientes desde LocalForage
    const mutaciones = await localforage.getItem('mutacionesPendientes') || [];
    const eliminacionesPendientes = mutaciones.filter(m => m.tipo === 'ELIMINACION');
    const edicionesPendientes = mutaciones.filter(m => m.tipo === 'EDICION');
    
    // Procesar apuestas locales
    apuestasLocales.value = apuestasFecha
      .filter(a => !eliminacionesPermanentes[a.uuid])
      .filter(a => !eliminacionesPendientes.some(e => e.idOriginal === a.uuid || e.idOriginal === a.id))
      .map(a => {
        // Aplicar ediciones pendientes si existen
        const edicionPendiente = edicionesPendientes.find(e => 
          e.idOriginal === a.uuid || e.idOriginal === a.id
        );
        
        if (edicionPendiente) {
          return {
            ...a,
            ...edicionPendiente.nuevosDatos,
            estado: 'EditadoOffline',
            id: a.uuid,
            totalGlobal: Number(edicionPendiente.nuevosDatos.totalGlobal) || Number(a.totalGlobal) || 0,
            horario: edicionPendiente.nuevosDatos.horario || a.horario || 'SinHorario'
          };
        }
        
        return {
          ...a,
          estado: a.estado || 'Pendiente',
          id: a.uuid,
          totalGlobal: Number(a.totalGlobal) || 0,
          horario: a.horario || 'SinHorario'
        };
      });
    
    // Si es hoy, añadir nuevas apuestas pendientes
    if (esHoySeleccionado) {
      const nuevasApuestasPendientes = mutaciones
        .filter(m => m.tipo === 'CREACION')
        .map(m => ({
          ...m.nuevosDatos,
          estado: 'Pendiente',
          id: m.uuid,
          horario: m.nuevosDatos.horario || 'SinHorario'
        }));
      
      apuestasLocales.value = [...apuestasLocales.value, ...nuevasApuestasPendientes];
    }
    
    console.log(`[LocalForage] ${apuestasLocales.value.length} apuestas cargadas para ${fechaSeleccionadaStr}`);
  } catch (error) {
    console.error('Error cargando apuestas locales:', error);
    apuestasLocales.value = [];
  }
}

const todasApuestas = computed(() => {
  const firebaseData = cargarApuestasDesdeCache()
  const firebaseUuids = new Set(firebaseData.map(a => a.uuid))
  
  // Filtra apuestas locales que no están ya en Firebase
  const localesFiltradas = apuestasLocales.value.filter(local => 
    !firebaseUuids.has(local.uuid) && 
    !firebaseUuids.has(local.id)
  )

  return [...firebaseData, ...localesFiltradas]
    .filter(a => {
      let fechaA
      try {
        if (a.creadoEn?.seconds) fechaA = new Date(a.creadoEn.seconds * 1000)
        else if (a.creadoEn?.toDate) fechaA = a.creadoEn.toDate()
        else if (a.creadoEn) fechaA = new Date(a.creadoEn)
        return fechaA && esMismoDia(fechaA, fechaRef.value)
      } catch {
        return false
      }
    })
})

  const totalPorHorario = computed(() => {
    const resultado = {
      Dia: 0,
      Tarde: 0,
      Noche: 0,
      SinHorario: 0,
      Total: 0
    }

    for (const a of todasApuestas.value) {
      const horario = a.horario || 'SinHorario'
      const total = Number(a.totalGlobal) || 0

      if (horario === 'Dia' || horario === 'Tarde' || horario === 'Noche') {
        resultado[horario] += total
      } else {
        resultado.SinHorario += total
      }
      resultado.Total += total
    }

    return resultado
  })

 const updateOnlineStatus = async () => {  // Añade async
  isOnline.value = navigator.onLine
  if (isOnline.value) {
    await sincronizarPendientes().then(async () => {  // Añade await
      await cargarApuestasLocales()  // Añade await
    })
  } else {
    await cargarApuestasLocales()  // Añade await
  }
}

onMounted(async () => {  // Añade async
  await cargarApuestasLocales()  // Añade await
  if (isOnline.value) {
    await sincronizarPendientes().then(async () => {  // Añade await
      await cargarApuestasLocales()  // Añade await
    })
  }
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  window.addEventListener('storage', () => cargarApuestasLocales())
})

watch(() => fechaRef.value, () => {
  cargarApuestasLocales()  // No necesitas await aquí porque watch no maneja async directamente
})
  return {
    totalPorHorario
  }
}
