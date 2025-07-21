import { collection, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore'
import { db } from '../firebase/config'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useFondo } from '../scripts/useFondo'

// Estado reactivo para apuestas
export const apuestas = ref([])
const authStore = useAuthStore()

// Obtener apuestas en tiempo real filtradas por id_listero
export const obtenerApuestas = async (idListero) => {
  try {
    const bancoId = authStore.bancoId
    const q = query(
      collection(db, `bancos/${bancoId}/apuestas`),
      where("id_listero", "==", idListero)
    );

    const querySnapshot = await getDocs(q);

    apuestas.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
    .sort((a, b) => {
      const fechaA = a.creadoEn?.toDate?.()?.getTime() || 0
      const fechaB = b.creadoEn?.toDate?.()?.getTime() || 0
      return fechaB - fechaA
    });

    return { success: true }
  } catch (error) {
    console.error('Error obteniendo apuestas:', error);
    return { success: false, error }
  }
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
export const eliminarApuesta = async (id, esPendiente = false, montoApuesta = 0) => {
  try {
    const { ajustarFondoPorApuesta } = useFondo()
    // Obtener monto si no se proporcionó
    if (montoApuesta === 0) {
      if (esPendiente) {
        const pendientes = JSON.parse(localStorage.getItem('apuestasPendientes') || [] );
        const apuesta = pendientes.find(p => p.uuid === id)
        montoApuesta = apuesta?.totalGlobal || 0
      } else {
        const cache = JSON.parse(localStorage.getItem('apuestasFirebaseCache') || '{"data":[]}');
        const apuesta = cache.data.find(a => a.id === id)
        montoApuesta = apuesta?.totalGlobal || 0
      }
    }

    // Ajustar fondo ANTES de eliminar
    if (montoApuesta > 0) {
      await ajustarFondoPorApuesta('ELIMINACION', montoApuesta)
    }
    if (esPendiente) {
      // Solo para apuestas pendientes (offline)
      return { success: true, offline: true };
    }
    // Para apuestas normales (Firebase)
    if (navigator.onLine) {
      const bancoId = authStore.bancoId
      await deleteDoc(doc(db, `bancos/${bancoId}/apuestas`, id));
      return { success: true };
    } else {
      // Guardar para sincronización posterior como mutación
      const mutaciones = JSON.parse(localStorage.getItem('mutacionesPendientes') || '[]');
      
      // Verificar si ya existe una mutación para esta apuesta
      const existe = mutaciones.some(m => m.idOriginal === id && m.tipo === 'ELIMINACION');
      
      if (!existe) {
        mutaciones.push({
          tipo: 'ELIMINACION',
          idOriginal: id,
          timestamp: Date.now(),
          uuid: id // Usar el mismo ID
        });
        localStorage.setItem('mutacionesPendientes', JSON.stringify(mutaciones));
      }
      
      return { success: true, offline: true };
    }
  } catch (error) {
    console.error('Error eliminando apuesta:', error);
    return { success: false, error };
  }
};

// Sincronizar eliminaciones pendientes
export const sincronizarEliminaciones = async () => {
  if (!navigator.onLine) return

  const eliminaciones = getLocalStorageArray('eliminacionesPendientes')
  if (eliminaciones.length === 0) return

  try {
    const bancoId = authStore.bancoId
    const resultados = await Promise.allSettled(
      eliminaciones.map(id => 
        deleteDoc(doc(db, `bancos/${bancoId}/apuestas`, id))
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
export const editarApuesta = async (id, datosActualizados, montoAnterior = 0) => {
  try {
    const { ajustarFondoPorApuesta } = useFondo()
    const bancoId = authStore.bancoId

    // Calcular diferencia si hay monto anterior
    if (montoAnterior > 0 && datosActualizados.totalGlobal) {
      await ajustarFondoPorApuesta('EDICION', datosActualizados.totalGlobal, montoAnterior)
    }

    await updateDoc(doc(db, `bancos/${bancoId}/apuestas`, id), datosActualizados)
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