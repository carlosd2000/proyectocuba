import { collection, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { ref } from 'vue'

// Estado reactivo para apuestas
export const apuestas = ref([])

// Obtener apuestas en tiempo real
export const obtenerApuestas = () => {
  const unsubscribe = onSnapshot(collection(db, 'apuestas'), (querySnapshot) => {
    apuestas.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      candadoAbierto: true // valor visual local
    }))
  })
  return unsubscribe // puedes usarlo con onUnmounted(() => unsubscribe())
}

// Eliminar una apuesta por su ID
export const eliminarApuesta = async (id) => {
  try {
    await deleteDoc(doc(db, 'apuestas', id))
    return { success: true }
  } catch (error) {
    console.error('Error eliminando apuesta:', error)
    return { success: false, error }
  }
}

// Editar una apuesta por su ID
export const editarApuesta = async (id, datosActualizados) => {
  try {
    await updateDoc(doc(db, 'apuestas', id), datosActualizados)
    return { success: true }
  } catch (error) {
    console.error('Error actualizando apuesta:', error)
    return { success: false, error }
  }
}
