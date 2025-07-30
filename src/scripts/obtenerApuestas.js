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
      id: doc.id,
      ...doc.data(),
    }))

    const localApuestas = await getLocalStorageArray('apuestasPendientes')

    apuestas.value = [...firebaseApuestas, ...localApuestas].sort((a, b) => {
      const fechaA = a.creadoEn?.toDate?.()?.getTime() || a.timestampLocal || 0
      const fechaB = b.creadoEn?.toDate?.()?.getTime() || b.timestampLocal || 0
      return fechaB - fechaA
    })

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
