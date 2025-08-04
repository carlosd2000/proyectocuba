// scripts/obtenerApuestas.js
import { ref } from 'vue'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuthStore } from '@/stores/authStore'
import localforage from '@/stores/localStorage'

// Estado compartido global
export const apuestas = ref([])

// Función principal
export const obtenerApuestas = async (idUsuario) => {
  try {
    const authStore = useAuthStore()
    const bancoId = authStore.bancoId

    if (!bancoId || !idUsuario) throw new Error('Faltan datos necesarios para la consulta')

    const q = query(
      collection(db, `bancos/${bancoId}/apuestas`),
      where("id_usuario", "==", idUsuario)
    )

    const querySnapshot = await getDocs(q)
    const firebaseApuestas = querySnapshot.docs.map(doc => ({
      uuid: doc.uuid,
      ...doc.data(),
    }))

    const localApuestas = await getLocalStorageArray('apuestasPendientes')

    apuestas.value = [...firebaseApuestas, ...localApuestas].sort((a, b) => {
      const fechaA = a.creadoEn?.toDate?.()?.getTime() || a.timestampLocal || 0
      const fechaB = b.creadoEn?.toDate?.()?.getTime() || b.timestampLocal || 0
      return fechaB - fechaA
    })
    await guardarApuestasDelDia(firebaseApuestas);
    return { success: true }

  } catch (error) {
    return { success: false, error }
  }
}

const getLocalStorageArray = async (key) => {
  try {
    const data = await localforage.getItem(key)
    return data || []
  } catch (error) {
    return []
  }
}

const guardarApuestasDelDia = async (apuestasFirebase) => {
  const hoy = new Date().toISOString().split('T')[0]
  const apuestasPorFecha = await localforage.getItem('apuestasPorFecha') || {}

  if (!apuestasPorFecha[hoy]) {
    apuestasPorFecha[hoy] = []
  }

  for (const apuesta of apuestasFirebase) {
    const uuid = apuesta.uuid || apuesta.id
    if (!uuid) continue

    // Convertir sincronizadoEn o creadoEn a fecha ISO para comparar
    let fechaReferencia = apuesta.sincronizadoEn?.toDate?.().toISOString?.()
      || apuesta.creadoEn?.toDate?.().toISOString?.()
      || apuesta.creadoEn // por si ya es string

    if (!fechaReferencia) continue

    const fecha = fechaReferencia.split('T')[0]
    if (fecha !== hoy) continue

    const index = apuestasPorFecha[hoy].findIndex(p => p.uuid === uuid)

    const apuestaActualizada = {
      ...apuesta,
      uuid,
      creadoEn: apuesta.sincronizadoEn?.toDate?.().toISOString?.() || apuesta.creadoEn
    }

    if (index !== -1) {
      apuestasPorFecha[hoy][index] = apuestaActualizada
    } else {
      apuestasPorFecha[hoy].push(apuestaActualizada)
    }
  }

  await localforage.setItem('apuestasPorFecha', apuestasPorFecha)
  window.dispatchEvent(new Event('apuestas-locales-actualizadas'))
}
