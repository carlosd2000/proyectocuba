import { collection, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { ref } from 'vue'

// Estado reactivo para apuestas
export const apuestas = ref([])

// Obtener apuestas en tiempo real
export const obtenerApuestas = () => {
  const unsubscribe = onSnapshot(
    collection(db, 'apuestas'), 
    (querySnapshot) => {
      apuestas.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        candadoAbierto: true // valor visual local
      }))
      .sort((a, b) => {
        const fechaA = a.creadoEn?.toDate?.()?.getTime() || 0
        const fechaB = b.creadoEn?.toDate?.()?.getTime() || 0
        return fechaB - fechaA
      })
    },
    (error) => {
      console.error('Error en la suscripción a apuestas:', error)
    }
  )
  return unsubscribe
}

// Función para manejar el almacenamiento local de forma segura
const getLocalStorageArray = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error(`Error al leer ${key} del localStorage:`, error)
    return []
  }
}

// Eliminar una apuesta (online/offline)
export const eliminarApuesta = async (id, esPendiente = false) => {
  try {
    if (esPendiente) {
      // Solo para apuestas pendientes (offline)
      return { success: true, offline: true };
    }

    // Para apuestas normales (Firebase)
    if (navigator.onLine) {
      await deleteDoc(doc(db, 'apuestas', id));
      return { success: true };
    } else {
      // Guardar para sincronización posterior
      const eliminaciones = JSON.parse(localStorage.getItem('eliminacionesPendientes') || '[]');
      if (!eliminaciones.includes(id)) {
        eliminaciones.push(id);
        localStorage.setItem('eliminacionesPendientes', JSON.stringify(eliminaciones));
      }
      return { success: true, offline: true };
    }
  } catch (error) {
    console.error('Error eliminando apuesta:', error);
    return { success: false, error };
  }
}
// Sincronizar eliminaciones pendientes
export const sincronizarEliminaciones = async () => {
  if (!navigator.onLine) return

  const eliminaciones = getLocalStorageArray('eliminacionesPendientes')
  if (eliminaciones.length === 0) return

  try {
    const resultados = await Promise.allSettled(
      eliminaciones.map(id => 
        deleteDoc(doc(db, 'apuestas', id))
      )
    )

    // Verificar si todas las eliminaciones fueron exitosas
    const todasExitosas = resultados.every(r => r.status === 'fulfilled')
    
    if (todasExitosas) {
      localStorage.removeItem('eliminacionesPendientes')
    } else {
      // Guardar solo las que fallaron para reintentar luego
      const fallidas = eliminaciones.filter((_, index) => 
        resultados[index].status === 'rejected'
      )
      localStorage.setItem('eliminacionesPendientes', JSON.stringify(fallidas))
    }
  } catch (error) {
    console.error('Error general en sincronizarEliminaciones:', error)
  }
}

// Editar una apuesta
export const editarApuesta = async (id, datosActualizados) => {
  try {
    await updateDoc(doc(db, 'apuestas', id), datosActualizados)
    return { success: true }
  } catch (error) {
    console.error('Error actualizando apuesta:', error)
    return { 
      success: false, 
      error,
      message: error.message || 'Error al actualizar la apuesta'
    }
  }
}