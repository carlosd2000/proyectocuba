import { collection, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore'
import { db } from '../firebase/config'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useFondo } from '../scripts/useFondo'
import localforage from '@/stores/localStorage';

// Estado reactivo para apuestas
export const apuestas = ref([])
const authStore = useAuthStore()

// Obtener apuestas en tiempo real filtradas por id_listero
export const obtenerApuestas = async (idUsuario) => {
  try {
    // Obtener de Firebase
    const bancoId = authStore.bancoId
    const q = query(
      collection(db, `bancos/${bancoId}/apuestas`),
      where("id_usuario", "==", idUsuario)
    );

    const querySnapshot = await getDocs(q);
    const firebaseApuestas = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Obtener de LocalForage
    const localApuestas = await getLocalStorageArray('apuestasPendientes');
    console.log(`[LocalForage] ${localApuestas.length} apuestas locales encontradas`);

    // Combinar y ordenar
    apuestas.value = [...firebaseApuestas, ...localApuestas]
      .sort((a, b) => {
        const fechaA = a.creadoEn?.toDate?.()?.getTime() || a.timestampLocal || 0
        const fechaB = b.creadoEn?.toDate?.()?.getTime() || b.timestampLocal || 0
        return fechaB - fechaA
      });

    console.log(`[Apuestas] Total de apuestas cargadas: ${apuestas.value.length}`);
    return { success: true }
  } catch (error) {
    console.error('Error obteniendo apuestas:', error);
    return { success: false, error }
  }
}

// Función para manejar el almacenamiento local de forma segura
const getLocalStorageArray = async (key) => {
  try {
    const data = await localforage.getItem(key)
    return data || []
  } catch (error) {
    console.error(`[LocalForage] Error al leer ${key}:`, error)
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
        const pendientes = await getLocalStorageArray('apuestasPendientes');
        const apuesta = pendientes.find(p => p.uuid === id)
        montoApuesta = apuesta?.totalGlobal || 0
      } else {
        const cache = await getLocalStorageArray('apuestasFirebaseCache');
        const apuesta = cache.find(a => a.id === id)
        montoApuesta = apuesta?.totalGlobal || 0
      }
    }

    // Ajustar fondo ANTES de eliminar
    if (montoApuesta > 0) {
      console.log(`[Eliminar] Ajustando fondo por eliminación de apuesta ${id}, monto: ${montoApuesta}`);
      await ajustarFondoPorApuesta('ELIMINACION', montoApuesta)
    }

    if (esPendiente) {
      // Eliminar de pendientes locales
      const pendientes = await getLocalStorageArray('apuestasPendientes');
      const nuevasPendientes = pendientes.filter(p => p.uuid !== id);
      await localforage.setItem('apuestasPendientes', nuevasPendientes);
      console.log(`[LocalForage] Apuesta pendiente ${id} eliminada localmente`);
      return { success: true, offline: true };
    }

    // Para apuestas normales (Firebase)
    if (navigator.onLine) {
      const bancoId = authStore.bancoId
      console.log(`[Firebase] Eliminando apuesta ${id} de Firebase`);
      await deleteDoc(doc(db, `bancos/${bancoId}/apuestas`, id));
      return { success: true };
    } else {
      // Guardar para sincronización posterior como mutación
      const mutaciones = await getLocalStorageArray('mutacionesPendientes');
      
      // Verificar si ya existe una mutación para esta apuesta
      const existe = mutaciones.some(m => m.idOriginal === id && m.tipo === 'ELIMINACION');
      
      if (!existe) {
        mutaciones.push({
          tipo: 'ELIMINACION',
          idOriginal: id,
          timestamp: Date.now(),
          uuid: id
        });
        await localforage.setItem('mutacionesPendientes', mutaciones);
        console.log(`[LocalForage] Mutación de eliminación para ${id} guardada localmente`);
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