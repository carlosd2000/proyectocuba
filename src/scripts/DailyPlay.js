import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import { setHorario } from '../scripts/añadir.js'
import { useAuthStore } from '@/stores/authStore'

export function useDailyPlay() {
  const db = getFirestore()
  const bancoId = ref(null)
  const apuestasRef = ref(null)

  const opciones = ['Dia', 'Tarde', 'Noche']
  const turnoSeleccionado = ref('Dia')
  const totalGlobal = ref(0)
  const isOnline = ref(navigator.onLine)
  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()

  // Sumar apuestas locales si está offline
  function calcularTotalLocal() {
    try {
      const pendientes = JSON.parse(localStorage.getItem('apuestasPendientes') || '[]')
      return pendientes
        .filter(a => a.horario === turnoSeleccionado.value)
        .reduce((sum, a) => sum + (Number(a.totalGlobal) || 0), 0)
    } catch {
      return 0
    }
  }

  const totalFormateado = computed(() => {
    const totalesOnline = JSON.parse(localStorage.getItem('totalesOnline') || '{}')
    const totalOnlineGuardado = totalesOnline[turnoSeleccionado.value] || 0
    const totalOffline = calcularTotalLocal()
    let total = 0
    if (isOnline.value) {
      total = totalGlobal.value + totalOffline
    } else {
      total = totalOnlineGuardado + totalOffline
    }
    return `$${total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`
  })

  // Obtener total solo una vez
  const obtenerTotalGlobal = async () => {
    if (!isOnline.value || !bancoId.value) return

    try {
      apuestasRef.value = collection(db, 'bancos', bancoId.value, 'apuestas')
      const q = query(apuestasRef.value, where('horario', '==', turnoSeleccionado.value))
      const snapshot = await getDocs(q)
      const total = snapshot.docs.reduce((sum, doc) => {
        const data = doc.data()
        return sum + (typeof data.totalGlobal === 'number' ? data.totalGlobal : 0)
      }, 0)

      totalGlobal.value = total

      // Guarda el total online por horario en localStorage
      const totalesOnline = JSON.parse(localStorage.getItem('totalesOnline') || '{}')
      totalesOnline[turnoSeleccionado.value] = total
      localStorage.setItem('totalesOnline', JSON.stringify(totalesOnline))
    } catch (error) {
      console.error("Error al obtener totalGlobal:", error)
    }
  }

  onMounted(async () => {
    bancoId.value = authStore.bancoId
    if (isOnline.value && bancoId.value) {
      setHorario(turnoSeleccionado.value)
      await obtenerTotalGlobal()
    }
  })

  onBeforeUnmount(() => {
    // Ya no necesitamos limpiar listeners porque no usamos ninguno
  })

  return {
    opciones,
    turnoSeleccionado,
    totalGlobal,
    totalFormateado,
    route,
    router
  }
}
