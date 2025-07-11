// src/composables/useTotalPorHorario.js
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { apuestas, obtenerApuestas } from '../scripts/crudListas.js'
import { sincronizarPendientes } from '../scripts/añadir.js'

export default function useTotalPorHorario(fechaRef) {
  const route = useRoute()
  const isOnline = ref(navigator.onLine)
  const apuestasLocales = ref([])
  const idListero = route.params.id
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

  function cargarApuestasLocales() {
    try {
      const eliminacionesPermanentes = JSON.parse(localStorage.getItem('eliminacionesPermanentes') || '{}')
      const pendientes = JSON.parse(localStorage.getItem('apuestasPendientes') || '[]')
      const cacheadas = cargarApuestasDesdeCache()

      apuestasLocales.value = [
        ...pendientes.filter(a => !eliminacionesPermanentes[a.uuid]),
        ...cacheadas.filter(a => !eliminacionesPermanentes[a.id])
      ].map(a => ({
        ...a,
        totalGlobal: Number(a.totalGlobal) || 0,
        horario: a.horario || 'SinHorario',
      }))
    } catch {
      apuestasLocales.value = []
    }
  }

  const todasApuestas = computed(() => {
    const firebaseData = isOnline.value ? apuestas.value : cargarApuestasDesdeCache()
    const firebaseUuids = new Set(firebaseData.map(a => a.uuid))
    const localesFiltradas = apuestasLocales.value.filter(local => !firebaseUuids.has(local.uuid))

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

  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine
    if (isOnline.value) {
      sincronizarPendientes().then(() => {
        obtenerApuestas(idListero)
        cargarApuestasLocales()
      })
    } else {
      cargarApuestasLocales()
    }
  }

  onMounted(() => {
    cargarApuestasLocales()
    if (isOnline.value) {
      sincronizarPendientes().then(() => {
        obtenerApuestas(idListero)
        cargarApuestasLocales()
      })
    }
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    window.addEventListener('storage', cargarApuestasLocales)
  })

  watch(() => fechaRef.value, () => {
    cargarApuestasLocales()
  })

  return {
    totalPorHorario
  }
}
